# modules/swipefile/worker_clickbank.py
import sys
import os
import time
import json
import re
import requests
from urllib.parse import urlparse
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset
from config.settings import settings

class ClickbankGravityHunter:
    """
    ESQUADRÃO CLICKBANK (O Caçador de Gravidade).
    Engenharia reversa de afiliados: caça hoplinks, resolve redirects e extrai VSLs Black.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.serper_key = settings.ExternalAPIs.SERPER_API_KEY
        self.firecrawl_key = settings.ExternalAPIs.FIRECRAWL_API_KEY
        
        # O ClickBank opera maioritariamente em Inglês (US) com ofertas devastadoras.
        self.niches = ["Health and Fitness", "E-business and E-marketing", "Self-Help and Dating"]

    def _get_or_create_source(self) -> SwipeSource:
        source = self.db.query(SwipeSource).filter(SwipeSource.name == "ClickBank (Top Gravity)").first()
        if not source:
            source = SwipeSource(name="ClickBank (Top Gravity)", category="Titan", market="US", authority_score=95)
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def find_affiliate_blogs(self, niche: str) -> list:
        """FASE 1: Usa o Serper para achar artigos que listam as ofertas top do ClickBank."""
        urls = []
        query = f"top converting clickbank products {niche} 2024"
        
        url = "https://google.serper.dev/search"
        payload = json.dumps({"q": query, "num": 5})
        headers = {'X-API-KEY': self.serper_key, 'Content-Type': 'application/json'}
        
        print(f" 🕵️‍♂️ [HARVESTER] Farejando agregadores de afiliados para o nicho: {niche}")
        try:
            response = requests.post(url, headers=headers, data=payload, timeout=10)
            if response.status_code == 200:
                for org in response.json().get("organic", []):
                    urls.append(org.get("link"))
        except Exception as e:
            print(f"  ⚠️ Erro no Radar Serper: {e}")
            
        return urls

    def extract_and_unmask_hoplinks(self, blog_url: str) -> list:
        """
        FASE 2: Entra no blog do afiliado, acha os 'hoplinks' (links de venda) e
        segue o redirecionamento para achar a URL real da VSL.
        """
        real_vsl_urls = []
        try:
            # Puxa o HTML do blog
            response = requests.get(blog_url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            
            # Regex matador para achar links do ClickBank (hop.clickbank.net ou similares)
            cb_links = re.findall(r'href=[\'"]?([^\'" >]+clickbank\.net[^\'" >]*)', response.text)
            cb_links += re.findall(r'href=[\'"]?([^\'" >]+hop[^\'" >]*)', response.text) # Variações de hoplinks
            
            # Limpa duplicatas
            cb_links = list(set([link for link in cb_links if "http" in link]))
            
            # A Magia: Seguir o Redirect (Desmascarar a VSL)
            session = requests.Session()
            for hoplink in cb_links[:3]: # Limitamos a 3 por blog para não travar
                try:
                    # Allow_redirects=True faz o Python seguir a trilha do afiliado até a página final
                    resp = session.get(hoplink, allow_redirects=True, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
                    final_url = resp.url
                    
                    # Se não for o próprio ClickBank, chegámos à VSL do produtor
                    if "clickbank.net" not in urlparse(final_url).netloc:
                        real_vsl_urls.append(final_url)
                except:
                    continue
                    
        except Exception as e:
            pass
            
        return list(set(real_vsl_urls))

    def extract_vsl_copy(self, vsl_url: str) -> str:
        """FASE 3: Injeta o Firecrawl na URL final para roubar o roteiro."""
        api_url = "https://api.firecrawl.dev/v1/scrape"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": vsl_url,
            "formats": ["markdown"],
            "onlyMainContent": True
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=50)
            if response.status_code == 200:
                return response.json().get("data", {}).get("markdown", "")
        except:
            pass
        return ""

    def run_clickbank_heist(self):
        print("\n☢️ [OPERAÇÃO CLICKBANK] Iniciando Engenharia Reversa de Afiliados...")
        
        source = self._get_or_create_source()
        vsls_salvas = 0
        
        for niche in self.niches:
            blogs = self.find_affiliate_blogs(niche)
            
            for blog in blogs:
                print(f"  🔍 Analisando agregador: {blog[:50]}...")
                vsl_urls = self.extract_and_unmask_hoplinks(blog)
                
                if not vsl_urls:
                    continue
                    
                print(f"  🔓 {len(vsl_urls)} VSLs desmascaradas! Acionando Firecrawl...")
                
                for vsl_url in vsl_urls:
                    # Idempotência: Evita raspar a mesma VSL duas vezes
                    existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == vsl_url).first()
                    if existe:
                        continue
                        
                    markdown_copy = self.extract_vsl_copy(vsl_url)
                    
                    if markdown_copy and len(markdown_copy) > 1000: # VSLs reais são longas
                        asset = SwipeAsset(
                            source_id=source.id,
                            asset_type="ClickBank VSL",
                            title_or_hook=f"VSL ({niche}) extraída via engenharia reversa",
                            clean_content=markdown_copy[:20000], # Limite elástico para VSLs enormes
                            original_url=vsl_url
                        )
                        self.db.add(asset)
                        vsls_salvas += 1
                        print(f"    ✅ VSL Arquivada: {vsl_url}")
                        
                    time.sleep(3) # Pausa tática do Firecrawl
                    
        try:
            self.db.commit()
            print(f"\n🏁 [OPERAÇÃO CLICKBANK] Sucesso. {vsls_salvas} VSLs Black-Hat/Aggressive injetadas no cofre.")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"❌ Erro Crítico de Persistência: {e}")
        finally:
            self.db.close()

if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = ClickbankGravityHunter()
    worker.run_clickbank_heist()