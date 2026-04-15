# modules/swipefile/worker_cro_science.py
import sys
import os
import time
import feedparser
import requests
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset
from config.settings import settings

class CroScienceWorker:
    """
    ESQUADRÃO DA CIÊNCIA (O Cientista Comportamental).
    Infiltra-se em institutos de CRO e UX para extrair leis de conversão e testes A/B.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.firecrawl_key = settings.ExternalAPIs.FIRECRAWL_API_KEY
        
        # Institutos de Pesquisa Comportamental (Feeds RSS Públicos/Semi-Públicos)
        self.science_targets = [
            {
                "url": "https://cxl.com/blog/feed/",
                "name": "CXL Institute",
                "category": "CRO_Science",
                "market": "US",
                "authority": 95 # Peso científico alto
            },
            {
                "url": "https://www.nngroup.com/feed/rss/",
                "name": "Nielsen Norman Group (NN/g)",
                "category": "CRO_Science",
                "market": "Global",
                "authority": 98 # A maior autoridade em UX/Usabilidade do mundo
            },
            {
                "url": "https://baymard.com/blog/feed",
                "name": "Baymard Institute",
                "category": "CRO_Science",
                "market": "Global",
                "authority": 95 # Especialistas absolutos em Checkout e E-commerce
            }
        ]

    def _get_or_create_source(self, name: str, category: str, market: str, authority: int) -> SwipeSource:
        """Garante que o Instituto Científico está mapeado no Grafo de Conhecimento."""
        source = self.db.query(SwipeSource).filter(SwipeSource.name == name).first()
        if not source:
            source = SwipeSource(
                name=name, 
                category=category, 
                market=market, 
                authority_score=authority
            )
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def harvest_science_papers(self, feed_url: str) -> list:
        """
        [O BATEDOR]
        Lê o feed XML do instituto e extrai as URLs dos estudos mais recentes.
        """
        papers = []
        print(f" 📡 [HARVESTER] Sincronizando com o laboratório: {feed_url}")
        
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]: # Focamos nos 10 estudos mais recentes por execução
                papers.append({
                    "title": entry.title,
                    "url": entry.link
                })
        except Exception as e:
            print(f"  ⚠️ Erro ao decodificar sinal de {feed_url}: {e}")
            
        return papers

    def extract_study_content(self, url: str) -> str:
        """
        [O INVASOR]
        Usa o Firecrawl para extrair o artigo científico, tabelas e conclusões dos testes A/B.
        """
        api_url = "https://api.firecrawl.dev/v1/scrape"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True # Evita puxar menus, foca apenas na ciência
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                return data.get("data", {}).get("markdown", "")
        except Exception as e:
            print(f"  ⚠️ Erro de extração científica em {url}: {e}")
        return ""

    def run_research(self):
        print("\n🔬 [OPERAÇÃO CRO] Iniciando extração de Inteligência Científica...")
        
        ativos_salvos = 0
        
        for target in self.science_targets:
            print(f"\n 🧪 Analisando Instituto: {target['name']}")
            source = self._get_or_create_source(
                target["name"], target["category"], target["market"], target["authority"]
            )
            
            papers = self.harvest_science_papers(target["url"])
            print(f"  📑 {len(papers)} novos estudos detetados. Iniciando leitura...")
            
            for paper in papers:
                # Idempotência: Não lemos o mesmo estudo duas vezes
                existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == paper["url"]).first()
                if existe:
                    continue
                    
                print(f"    Extraindo Estudo: {paper['title'][:50]}...")
                markdown_content = self.extract_study_content(paper["url"])
                
                if markdown_content and len(markdown_content) > 500:
                    asset = SwipeAsset(
                        source_id=source.id,
                        asset_type="Scientific Study (CRO/UX)",
                        title_or_hook=paper["title"][:200],
                        clean_content=markdown_content[:20000], # Artigos do CXL são longos e detalhados
                        original_url=paper["url"]
                    )
                    self.db.add(asset)
                    ativos_salvos += 1
                    
                time.sleep(2) # Pausa metódica
                
        try:
            self.db.commit()
            print(f"\n🏁 [OPERAÇÃO CRO] Laboratório fechado com sucesso.")
            print(f" 🧠 {ativos_salvos} Novos Estudos Científicos injetados no Grafo de Conhecimento.")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"❌ Erro Crítico ao arquivar dados científicos: {e}")
        finally:
            self.db.close()

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = CroScienceWorker()
    worker.run_research()