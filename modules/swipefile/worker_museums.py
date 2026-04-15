# modules/swipefile/worker_museums.py
import sys
import os
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH para importações a partir da raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset
from config.settings import settings

class MuseumCuratorWorker:
    """
    ESQUADRÃO DOS MUSEUS (O Curador).
    Extrai as campanhas milionárias divididas por Eras Históricas da Persuasão.
    Alvos: Modern (Mid 90s-Current) e Classic (Early 90s & Older).
    """
    def __init__(self):
        self.db = SessionLocal()
        self.firecrawl_key = settings.ExternalAPIs.FIRECRAWL_API_KEY
        
        # O Alvo de Ouro: As Eras de Copywriting no Swiped.co
        self.museum_targets = [
            {
                "url": "https://swiped.co/era/modern/", 
                "type": "Modern Copy (Mid 90s-Current)",
                "description": "Focado em VSLs, SaaS, E-mails e Retenção Digital"
            },
            {
                "url": "https://swiped.co/era/classic/", 
                "type": "Classic Copy (Early 90s & Older)",
                "description": "Focado em Direct Mail, Print Ads e Storytelling Long-Form"
            }
        ]

    def _get_or_create_source(self) -> SwipeSource:
        """O Museu tem Autoridade Máxima (99) porque é a fundação da persuasão humana."""
        source_name = "Swiped.co (Archive)"
        source = self.db.query(SwipeSource).filter(SwipeSource.name == source_name).first()
        if not source:
            source = SwipeSource(
                name=source_name, 
                category="Museum", 
                market="US", 
                authority_score=99 # A maior nota possível no nosso Grafo
            )
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def harvest_museum_links(self, category_url: str, max_pages: int = 3) -> list:
        """
        [O BATEDOR]
        Navega silenciosamente pelas páginas da Era Histórica e extrai as URLs
        das peças individuais.
        """
        links_coletados = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        print(f" 🕵️‍♂️ [HARVESTER] Explorando os arquivos da Era: {category_url}")
        
        for page in range(1, max_pages + 1):
            target = f"{category_url}page/{page}/" if page > 1 else category_url
            try:
                response = requests.get(target, headers=headers, timeout=15)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # No Swiped.co, os links dos posts ficam em divs de classe 'item-title' ou 'post-title'
                    for header in soup.find_all(['h2', 'h3']):
                        a_tag = header.find('a')
                        if a_tag and 'href' in a_tag.attrs:
                            link = a_tag['href']
                            if "swiped.co" in link and link not in links_coletados:
                                links_coletados.append(link)
                else:
                    break # Chegou ao fim das páginas
            except Exception as e:
                print(f"  ⚠️ Erro ao mapear página {page}: {e}")
                
            time.sleep(1) # Evasão Antibot
            
        return list(set(links_coletados))

    def extract_classic_copy(self, url: str) -> str:
        """
        [O INVASOR]
        Usa o Firecrawl para entrar na página e realizar o OCR (leitura de imagens),
        além de capturar as notas táticas do curador.
        """
        api_url = "https://api.firecrawl.dev/v1/scrape"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json().get("data", {}).get("markdown", "")
                return data
        except Exception as e:
            print(f"  ⚠️ Erro na extração via Firecrawl: {e}")
        return ""

    def format_title_from_url(self, url: str) -> str:
        """Cria um título limpo baseado na URL, caso o HTML seja complexo."""
        try:
            slug = url.strip('/').split('/')[-1]
            return slug.replace('-', ' ').title()
        except:
            return "Copywriting Masterpiece"

    def run_curation(self):
        print("\n🏛️ [OPERAÇÃO MUSEU] Iniciando curadoria Temporal (Classic vs. Modern)...")
        
        source = self._get_or_create_source()
        ativos_salvos = 0
        
        for target in self.museum_targets:
            print(f"\n ⏳ Focando na Era: {target['type']}")
            
            # Ajustamos max_pages para 5, varrendo mais fundo nos arquivos da história
            asset_urls = self.harvest_museum_links(target["url"], max_pages=5)
            print(f"  📜 {len(asset_urls)} Relíquias mapeadas. Iniciando extração profunda...")
            
            for url in asset_urls:
                # Idempotência: Preserva o Grafo contra duplicatas e economiza tokens
                existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == url).first()
                if existe:
                    continue
                    
                print(f"    Restaurando: {url.split('/')[-2]}...")
                markdown_copy = self.extract_classic_copy(url)
                
                # O Curador só guarda se a peça tiver substância real
                if markdown_copy and len(markdown_copy) > 300:
                    clean_title = self.format_title_from_url(url)
                    
                    asset = SwipeAsset(
                        source_id=source.id,
                        asset_type=target["type"], # Tag crucial para a IA: 'Classic' ou 'Modern'
                        title_or_hook=clean_title[:200],
                        clean_content=markdown_copy[:30000], # Clássicos podem ser imensos
                        original_url=url
                    )
                    self.db.add(asset)
                    ativos_salvos += 1
                    
                time.sleep(2) # Respeito ao limite do Firecrawl
                
        try:
            self.db.commit()
            print(f"\n🏁 [OPERAÇÃO MUSEU] Curadoria Finalizada.")
            print(f" 🏆 {ativos_salvos} Peças de Ouro Históricas injetadas no Grafo de Conhecimento.")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"❌ Erro Crítico ao arquivar as relíquias: {e}")
        finally:
            self.db.close()

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = MuseumCuratorWorker()
    worker.run_curation()