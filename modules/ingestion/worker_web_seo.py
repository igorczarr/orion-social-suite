# modules/ingestion/worker_web_seo.py
import sys
import os
import json
import time
import requests
import builtwith
from urllib.parse import urlparse
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH para garantir importações a partir da raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, WebTrafficIntel
from config.settings import settings

class WebSEOPhantomWorker:
    """
    ESQUADRÃO DE INFILTRAÇÃO (O Fantasma).
    Arbitragem Global (BR, US, EU): Extrai VSLs, Tech Stack e SEO de Landing Pages inimigas.
    """
    def __init__(self):
        self.db = SessionLocal()
        
        # Armamento (Chaves de API) importado de forma segura do Settings
        self.serper_key = settings.ExternalAPIs.SERPER_API_KEY
        self.firecrawl_key = settings.ExternalAPIs.FIRECRAWL_API_KEY
        
        # DataForSEO usa Basic Auth (Login:Senha em Base64, a biblioteca requests lida com isso)
        self.dfs_login = settings.ExternalAPIs.DATAFORSEO_LOGIN
        self.dfs_pass = settings.ExternalAPIs.DATAFORSEO_PASSWORD

        # O Mapa de Arbitragem Global
        self.markets = [
            {"name": "Brasil", "gl": "br", "hl": "pt-br", "dfs_loc": 2076},
            {"name": "Estados Unidos", "gl": "us", "hl": "en", "dfs_loc": 2840},
            {"name": "Europa (UK)", "gl": "gb", "hl": "en", "dfs_loc": 2826}
        ]

    def _extract_domain(self, url: str) -> str:
        """Limpa a URL para extrair apenas o domínio (necessário para o DataForSEO)."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.replace("www.", "")
            return domain
        except:
            return url

    def _search_serper(self, query: str, gl: str, hl: str) -> list:
        """FASE 1: Radar Serper. Encontra quem domina a palavra-chave no mercado alvo."""
        if not self.serper_key: return []
        
        url = "https://google.serper.dev/search"
        payload = json.dumps({"q": query, "gl": gl, "hl": hl, "num": 3})
        headers = {'X-API-KEY': self.serper_key, 'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, headers=headers, data=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                urls = []
                # Pega anúncios pagos (Follow the Money)
                for ad in data.get("ads", []):
                    urls.append(ad.get("link"))
                # Pega os orgânicos (SEO)
                for org in data.get("organic", [])[:3]:
                    urls.append(org.get("link"))
                return list(set(urls)) # Remove duplicatas
        except Exception as e:
            print(f"  ⚠️ [Serper] Falha na busca por '{query}' ({gl}): {e}")
        return []

    def _extract_vsl_firecrawl(self, url: str) -> str:
        """FASE 2: Infiltração Firecrawl. Transforma a Landing Page em Markdown puro."""
        if not self.firecrawl_key: return "Firecrawl API Key ausente."
        
        # Firecrawl SDK (Modo Scrape simples)
        api_url = "https://api.firecrawl.dev/v1/scrape"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True # Corta rodapés e menus inúteis, foca na Copy
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                markdown = data.get("data", {}).get("markdown", "")
                return markdown[:5000] # Limite tático de 5000 caracteres para poupar o Gemini depois
        except Exception as e:
            print(f"  ⚠️ [Firecrawl] Falha ao extrair VSL de {url}: {e}")
        return "Falha na extração da Copy."

    def _scan_tech_stack(self, url: str) -> dict:
        """FASE 3: Cyber-Recon. Raio-X das tecnologias usadas no site."""
        try:
            # builtwith roda 100% localmente e é gratuito
            tech_stack = builtwith.parse(url)
            return tech_stack
        except Exception as e:
            return {"error": "Blindagem Anti-Bot detetada ou timeout."}

    def run_global_recon(self, tenant_id: int):
        """O Orquestrador do Fantasma: Executa a operação nos 3 mercados."""
        print(f"\n🥷 [O FANTASMA] Iniciando Arbitragem Global (BR, US, EU) para Tenant: {tenant_id}")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant or not tenant.keywords:
            print(" ⚠️ Operação abortada: Cliente não encontrado ou sem Keywords configuradas.")
            self.db.close()
            return

        keywords = [k.strip() for k in tenant.keywords.split(',')]
        if not keywords: return

        # Para poupar créditos MVP, pegamos apenas a Keyword principal do cliente
        core_keyword = keywords[0]
        intel_salvos = 0

        for market in self.markets:
            print(f"\n 🌍 [MERCADO: {market['name'].upper()}] Rastreador ativado para: '{core_keyword}'")
            
            # 1. Encontra os Alvos
            target_urls = self._search_serper(core_keyword, market['gl'], market['hl'])
            print(f"  🎯 Alvos trancados: {len(target_urls)} Landing Pages detetadas.")

            for url in target_urls:
                domain = self._extract_domain(url)
                
                # Verifica se já varremos este domínio recentemente para este cliente
                existente = self.db.query(WebTrafficIntel).filter(
                    WebTrafficIntel.tenant_id == tenant_id,
                    WebTrafficIntel.competitor_url.ilike(f"%{domain}%")
                ).first()
                if existente:
                    continue

                print(f"  🕵️‍♂️ Infiltrando: {domain} ...")
                
                # 2. Extrai a Copy/VSL
                vsl_markdown = self._extract_vsl_firecrawl(url)
                
                # 3. Raio-X Tecnológico
                tech_stack = self._scan_tech_stack(url)
                
                # O DataForSEO (Tráfego) será implementado na v2 devido à complexidade da sua API assíncrona,
                # Mas já deixamos o espaço preparado no banco.
                estimated_traffic = 0 
                
                # 4. Injeção Idempotente no Banco
                intel = WebTrafficIntel(
                    tenant_id=tenant_id,
                    competitor_url=url,
                    monthly_visits_estimate=estimated_traffic,
                    top_keywords={"market": market['name'], "tech_stack": tech_stack}, # Guardamos a tech stack aqui no JSON
                    vsl_transcript="", # Deixamos vazio se for apenas texto
                    sales_page_copy=vsl_markdown,
                    captured_at=datetime.now(timezone.utc)
                )
                
                try:
                    self.db.add(intel)
                    self.db.commit()
                    intel_salvos += 1
                    print(f"    ✅ Dossiê de Copy e Tech Stack arquivado com sucesso.")
                except SQLAlchemyError as e:
                    self.db.rollback()
                    print(f"    ❌ Erro ao salvar inteligência de {domain}: {e}")
                    
                # Evasão Básica: Pausa para não engatilhar firewalls
                time.sleep(2)

        self.db.close()
        print(f"\n🏁 [O FANTASMA] Extração Finalizada. {intel_salvos} Páginas Inimigas dissecadas.")

# =====================================================================
# BLOCO DE TESTE ISOLADO
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = WebSEOPhantomWorker()
    # Teste: Assumindo que o Tenant ID 1 existe e tem a keyword "Mentoria Financeira"
    worker.run_global_recon(tenant_id=1)