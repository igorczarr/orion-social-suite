import sys
import os
import feedparser
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Ajuste de PATH para garantir que o Python encontre o módulo analytics
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from modules.analytics.ai_engine import AIEngine

class OmnidirectionalRadar:
    def __init__(self, ai_api_key: str):
        self.ai_engine = AIEngine(ai_api_key)
        self.google_feeds = {
            "Geral": "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419",
            "Entretenimento": "https://news.google.com/news/rss/headlines/section/topic/ENTERTAINMENT?hl=pt-BR&gl=BR&ceid=BR:pt-419",
            "Negócios": "https://news.google.com/news/rss/headlines/section/topic/BUSINESS?hl=pt-BR&gl=BR&ceid=BR:pt-419"
        }

    def get_x_trends(self) -> list:
        """Hackeia os Trending Topics do X (Twitter) Brasil usando um agregador público."""
        print("🐦 Hackeando os Trending Topics do X (Twitter) Brasil...")
        try:
            # Usamos o Trends24 para fugir do paywall da API oficial do X
            url = "https://trends24.in/brazil/"
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')

            x_trends = set()
            # Captura os assuntos em alta na primeira lista (última hora)
            for a_tag in soup.select('.trend-card__list li a')[:20]:
                trend_name = a_tag.text.strip()
                x_trends.add(trend_name)

            print(f"  -> {len(x_trends)} Assuntos do X capturados.")
            return list(x_trends)
        except Exception as e:
            print(f"  ❌ Erro ao capturar o X (Twitter): {e}")
            return []

    def get_massive_trend_list(self) -> list:
        """Une as notícias do Google com o caos do X (Twitter)."""
        print("🌍 Lançando rede de captura global (Google + X)...")
        
        todas_noticias = set()
        
        # 1. Puxa os dados do Google
        for categoria, url in self.google_feeds.items():
            print(f"  -> Puxando Google Notícias: {categoria}...")
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:10]: # Top 10 de cada
                    clean_title = entry.title.split(" - ")[0]
                    todas_noticias.add(clean_title)
            except Exception as e:
                print(f"  ❌ Erro no Google {categoria}: {e}")

        # 2. Puxa os dados do X (Twitter)
        twitter_trends = self.get_x_trends()
        for t in twitter_trends:
            todas_noticias.add(f"[Trend do Twitter]: {t}")

        lista_final = list(todas_noticias)
        print(f"🔥 Rede recolhida! Capturamos {len(lista_final)} tópicos únicos.")
        return lista_final

    def run_strategic_radar(self, username: str, niche: str):
        print(f"\n🚀 --- INICIANDO RADAR OMNIDIRECIONAL PARA @{username} ---")
        
        massive_trends = self.get_massive_trend_list()
        
        if not massive_trends:
            print("⚠️ Radar cego. Operação abortada.")
            return

        profile_context = {"username": username, "niche": niche}
        
        print(f"\n🧠 CMO processando {len(massive_trends)} assuntos. Gerando Ranking de Oportunidades...")
        insight = self.ai_engine.analyze_trends_and_timings(massive_trends, profile_context)
        
        print("\n💡 MAPA DE GUERRA TÁTICO (RANKING & COPY):")
        print(insight)
        print("-" * 80)

if __name__ == "__main__":
    # PADRONIZAÇÃO SÊNIOR: Carrega variáveis de ambiente
    load_dotenv()
    
    # Nome da variável idêntico ao do .env e main.py
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not GEMINI_API_KEY:
        print("⚠️ ERRO: Chave GEMINI_API_KEY não encontrada. Verifique o arquivo .env")
    else:
        # Passando a variável correta para a classe
        worker = OmnidirectionalRadar(GEMINI_API_KEY)
        worker.run_strategic_radar(username="sofs.valentini", niche="Moda Feminina")