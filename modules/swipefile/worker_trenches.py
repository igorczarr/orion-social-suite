# modules/swipefile/worker_trenches.py
import sys
import os
import time
import requests
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset

class TrenchSpyWorker:
    """
    ESQUADRÃO DAS TRINCHEIRAS (O Operacional de Campo).
    Infiltra-se no Reddit e Hacker News para extrair táticas brutas (Hacks)
    validadas pela própria comunidade (Upvotes).
    """
    def __init__(self):
        self.db = SessionLocal()
        
        # User-Agent personalizado é OBRIGATÓRIO no Reddit para não levar ban instantâneo
        self.headers = {
            "User-Agent": "OrionGrowthOS/1.0 (Data Intelligence Agent; +contact@orion-os.com)"
        }
        
        self.reddit_targets = [
            {"subreddit": "copywriting", "market": "Global"},
            {"subreddit": "PPC", "market": "Global"}, # Tráfego Pago
            {"subreddit": "marketing", "market": "Global"}
        ]

    def _get_or_create_source(self, name: str, market: str) -> SwipeSource:
        """As trincheiras têm Autoridade Média (70), pois são táticas efêmeras."""
        source = self.db.query(SwipeSource).filter(SwipeSource.name == name).first()
        if not source:
            source = SwipeSource(
                name=name, 
                category="Trench", 
                market=market, 
                authority_score=70 
            )
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def intercept_reddit_comms(self, subreddit: str) -> list:
        """
        [O RADAR]
        Usa o endpoint .json oculto do Reddit para puxar os "Top Threads do Mês".
        """
        intel_bruta = []
        # t=month garante que pegamos o que está a funcionar agora
        url = f"https://www.reddit.com/r/{subreddit}/top.json?t=month&limit=15"
        
        print(f" 📡 Intercetando frequências de r/{(subreddit).upper()}...")
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                posts = response.json().get("data", {}).get("children", [])
                
                for post in posts:
                    data = post.get("data", {})
                    # A Métrica de Ouro: Upvotes. Ignora lixo sem tração.
                    if data.get("score", 0) > 30 and not data.get("is_video"):
                        thread_text = data.get("selftext", "")
                        # Se for apenas uma imagem ou um link sem texto, ignoramos
                        if len(thread_text) > 200:
                            intel_bruta.append({
                                "title": data.get("title"),
                                "content": thread_text,
                                "url": f"https://www.reddit.com{data.get('permalink')}",
                                "score": data.get("score")
                            })
            else:
                print(f"  ⚠️ Erro tático: O Reddit bloqueou a conexão (Status {response.status_code})")
        except Exception as e:
            print(f"  ⚠️ Falha no rádio: {e}")
            
        return intel_bruta

    def intercept_hacker_news(self) -> list:
        """Infiltração rápida no Hacker News via Firebase API pública."""
        intel_bruta = []
        print(f" 📡 Intercetando frequências do Hacker News (B2B/SaaS)...")
        
        try:
            # Puxa os IDs das Top Stories
            top_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
            top_ids = requests.get(top_url, timeout=10).json()[:20]
            
            for item_id in top_ids:
                item_url = f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json"
                item_data = requests.get(item_url, timeout=5).json()
                
                # Focamos em posts do tipo "Ask HN" ou "Show HN" que têm texto (discussões ricas)
                if item_data and item_data.get("text") and item_data.get("score", 0) > 50:
                    intel_bruta.append({
                        "title": item_data.get("title"),
                        "content": item_data.get("text"), # HN usa HTML básico
                        "url": f"https://news.ycombinator.com/item?id={item_id}",
                        "score": item_data.get("score")
                    })
        except Exception as e:
            print(f"  ⚠️ Falha no Hacker News: {e}")
            
        return intel_bruta

    def run_infiltration(self):
        print("\n🪖 [OPERAÇÃO TRINCHEIRAS] Iniciando escuta tática de Fóruns e Comunidades...")
        
        ativos_salvos = 0
        
        # 1. Varredura do Reddit
        for target in self.reddit_targets:
            source = self._get_or_create_source(f"Reddit (r/{target['subreddit']})", target['market'])
            hacks = self.intercept_reddit_comms(target['subreddit'])
            
            print(f"  🎯 {len(hacks)} discussões de alto valor localizadas.")
            
            for hack in hacks:
                existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == hack["url"]).first()
                if existe:
                    continue
                    
                asset = SwipeAsset(
                    source_id=source.id,
                    asset_type="Forum Hack & Intel",
                    title_or_hook=hack["title"][:200],
                    clean_content=f"UPVOTES: {hack['score']}\n\n{hack['content']}",
                    original_url=hack["url"]
                )
                self.db.add(asset)
                ativos_salvos += 1
                
            time.sleep(2) # Respeito ao Rate Limit do Reddit (MÁXIMO 1 request/segundo)

        # 2. Varredura do Hacker News
        hn_source = self._get_or_create_source("Hacker News", "Global")
        hn_hacks = self.intercept_hacker_news()
        
        print(f"  🎯 {len(hn_hacks)} discussões de crescimento B2B localizadas.")
        
        for hack in hn_hacks:
            existe = self.db.query(SwipeAsset).filter(SwipeAsset.original_url == hack["url"]).first()
            if existe:
                continue
                
            asset = SwipeAsset(
                source_id=hn_source.id,
                asset_type="SaaS/B2B Intel",
                title_or_hook=hack["title"][:200],
                clean_content=f"UPVOTES: {hack['score']}\n\n{hack['content']}",
                original_url=hack["url"]
            )
            self.db.add(asset)
            ativos_salvos += 1

        try:
            self.db.commit()
            print(f"\n🏁 [OPERAÇÃO TRINCHEIRAS] Escuta Finalizada.")
            print(f" 🗂️ {ativos_salvos} Táticas de Campo arquivadas no Grafo de Conhecimento.")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"❌ Erro Crítico ao arquivar comunicações: {e}")
        finally:
            self.db.close()

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = TrenchSpyWorker()
    worker.run_infiltration()