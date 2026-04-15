# modules/swipefile/worker_titans.py
import sys
import os
import time
import json
import requests
import feedparser
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset
from config.settings import settings

class TitansHarvesterWorker:
    """
    ESQUADRÃO TITÃS & GANCHOS.
    Infiltração silenciosa (Harvester-Breacher) via RSS, Google Dorks e Firecrawl.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.serper_key = settings.ExternalAPIs.SERPER_API_KEY
        self.firecrawl_key = settings.ExternalAPIs.FIRECRAWL_API_KEY

    # =====================================================================
    # MOTORES HARVESTERS (Batedores Invisíveis)
    # =====================================================================

    def harvest_medium_rss(self) -> list:
        """
        Batedor do Medium. Burla paywalls usando RSS Feeds.
        Alvos: Publicações de Topo de Marketing e Empreendedorismo.
        """
        feeds = [
            "https://medium.com/feed/the-startup",
            "https://medium.com/feed/better-marketing",
            "https://medium.com/feed/swlh" # The Startup alternativa
        ]
        
        hooks_coletados = []
        print(" 📡 [HARVESTER] Intercetando Feeds RSS do Medium...")
        
        for url in feeds:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:10]: # Top 10 mais recentes de cada
                    # O título e a introdução são o verdadeiro Hook
                    title = entry.title
                    link = entry.link
                    # Limpeza básica de HTML do sumário
                    summary = entry.summary.split('<')[0].strip() if '<' in entry.summary else entry.summary
                    
                    hooks_coletados.append({
                        "source_name": "Medium (Top Publications)",
                        "category": "Trench",
                        "market": "Global",
                        "asset_type": "Narrative Hook",
                        "title": title,
                        "content": f"TÍTULO: {title}\n\nLEAD/HOOK: {summary}",
                        "url": link
                    })
            except Exception as e:
                print(f"  ⚠️ Erro ao ler RSS {url}: {e}")
                
        return hooks_coletados

    def harvest_agora_empiricus(self) -> list:
        """
        Batedor Financeiro. Usa Google Dorking via Serper para achar cartas de vendas ocultas.
        """
        urls_alvo = []
        dorks = [
            {"query": "site:empiricus.com.br inurl:sl", "market": "BR", "name": "Empiricus (Brasil)"},
            {"query": "site:pro.agorafinancial.com", "market": "US", "name": "Agora Financial (EUA)"}
        ]
        
        print(" 🕵️‍♂️ [HARVESTER] Executando Google Dorking para Titãs Financeiros...")
        
        for dork in dorks:
            url = "https://google.serper.dev/search"
            payload = json.dumps({"q": dork["query"], "num": 10})
            headers = {'X-API-KEY': self.serper_key, 'Content-Type': 'application/json'}
            
            try:
                response = requests.post(url, headers=headers, data=payload, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for org in data.get("organic", []):
                        urls_alvo.append({
                            "source_name": dork["name"],
                            "category": "Titan",
                            "market": dork["market"],
                            "url": org.get("link"),
                            "title": org.get("title", "Carta de Vendas")
                        })
            except Exception as e:
                print(f"  ⚠️ Erro no Dorking {dork['name']}: {e}")
            
            time.sleep(1) # Evasão Serper
            
        return urls_alvo

    # =====================================================================
    # MOTOR BREACHER (Invasor e Extrator)
    # =====================================================================

    def extract_with_firecrawl(self, url: str) -> str:
        """Envia a URL descoberta pelo Harvester para o Firecrawl extrair a Copy limpa."""
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
            response = requests.post(api_url, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                return response.json().get("data", {}).get("markdown", "")
        except:
            pass
        return ""

    # =====================================================================
    # MOTOR DE PERSISTÊNCIA (O Cofre do Grafo)
    # =====================================================================

    def _get_or_create_source(self, name: str, category: str, market: str) -> SwipeSource:
        """Garante que a Fonte de Inteligência existe no Grafo de Conhecimento."""
        source = self.db.query(SwipeSource).filter(SwipeSource.name == name).first()
        if not source:
            source = SwipeSource(name=name, category=category, market=market, authority_score=90)
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def run_infiltration(self):
        print("\n⚔️ [OPERAÇÃO TITÃS] Iniciando extração massiva de Copywriting...")
        
        ativos_salvos = 0
        
        # 1. Processa o Medium (Rápido, não precisa de Firecrawl)
        medium_hooks = self.harvest_medium_rss()
        for hook in medium_hooks:
            # Verifica Idempotência (Não guarda duplicatas)
            existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == hook["url"]).first()
            if not existe:
                source = self._get_or_create_source(hook["source_name"], hook["category"], hook["market"])
                asset = SwipeAsset(
                    source_id=source.id,
                    asset_type=hook["asset_type"],
                    title_or_hook=hook["title"][:200],
                    clean_content=hook["content"],
                    original_url=hook["url"]
                )
                self.db.add(asset)
                ativos_salvos += 1
                
        self.db.commit()
        print(f"  ✅ [MEDIUM] {ativos_salvos} Hooks Narrativos capturados via RSS.")

        # 2. Processa os Titãs Financeiros (Exige Firecrawl)
        agora_urls = self.harvest_agora_empiricus()
        print(f"  🎯 {len(agora_urls)} Cartas de Vendas localizadas. Acionando Firecrawl...")
        
        vsls_salvas = 0
        for alvo in agora_urls:
            existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == alvo["url"]).first()
            if existe:
                continue
                
            print(f"    Infiltrando: {alvo['title'][:40]}...")
            markdown_copy = self.extract_with_firecrawl(alvo["url"])
            
            # Se a extração for um sucesso e tiver volume (uma VSL real tem milhares de caracteres)
            if markdown_copy and len(markdown_copy) > 500:
                source = self._get_or_create_source(alvo["source_name"], alvo["category"], alvo["market"])
                asset = SwipeAsset(
                    source_id=source.id,
                    asset_type="Long-Form VSL",
                    title_or_hook=alvo["title"][:200],
                    clean_content=markdown_copy[:15000], # Limite seguro
                    original_url=alvo["url"]
                )
                self.db.add(asset)
                vsls_salvas += 1
                
            time.sleep(2) # Evasão anti-ban
            
        self.db.commit()
        self.db.close()
        
        print("\n🏁 [OPERAÇÃO TITÃS] Finalizada.")
        print(f" 📈 Total Injetado no Grafo: {ativos_salvos + vsls_salvas} Peças Ouro.")

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = TitansHarvesterWorker()
    worker.run_infiltration()