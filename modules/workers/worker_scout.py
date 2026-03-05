import sys
import os
import json
import time
from datetime import datetime, timezone
from googleapiclient.discovery import build
import google.generativeai as genai
from dotenv import load_dotenv # Adicionado para carregar .env

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal
from database.models import TrackedProfile, SocialInsight, Tenant

class YouTubeScoutRadar:
    def __init__(self, youtube_api_key: str, gemini_api_key: str):
        self.youtube = build('youtube', 'v3', developerKey=youtube_api_key)
        genai.configure(api_key=gemini_api_key)
        # Usamos o flash que é rápido e lida bem com JSON
        self.ai_model = genai.GenerativeModel('gemini-2.5-flash')
        self.db = SessionLocal()

    def get_target_tenants(self):
        return self.db.query(Tenant).filter(Tenant.keywords != None).all()

    def search_youtube_trends(self, keyword: str, max_results=2):
        """Procura os vídeos mais relevantes sobre o tema."""
        try:
            request = self.youtube.search().list(
                q=keyword, part="snippet", type="video", 
                maxResults=max_results, order="relevance",
                relevanceLanguage="pt", regionCode="BR"
            )
            response = request.execute()
            return [item['id']['videoId'] for item in response.get('items', [])]
        except Exception as e:
            print(f"  ⚠️ Erro na pesquisa do YouTube: {e}")
            return []

    def get_video_comments(self, video_id: str, max_comments=100):
        """Extrai um grande volume de comentários de um vídeo."""
        comments = []
        try:
            request = self.youtube.commentThreads().list(
                part="snippet", videoId=video_id, 
                maxResults=100, order="relevance", textFormat="plainText"
            )
            response = request.execute()
            
            for item in response.get('items', []):
                text = item['snippet']['topLevelComment']['snippet']['textDisplay']
                # Filtra comentários inúteis (só emojis ou muito curtos)
                if len(text.strip()) > 15:
                    comments.append(text.replace('\n', ' ').replace('"', "'"))
                    
            return comments[:max_comments]
        except Exception as e:
            return []

    def classify_batch_with_ai(self, comments_list, niche):
        """BATCH PROMPTING: Analisa até 30 comentários de uma só vez (Economiza Quota e Evita Erro 429)."""
        if not comments_list:
            return []

        # Numera os comentários para a IA não se perder
        numbered_comments = "\n".join([f"[{i}] {c}" for i, c in enumerate(comments_list)])

        prompt = f"""
        Você é um psicólogo de consumo do nicho: '{niche}'.
        Abaixo estão comentários reais extraídos do YouTube.
        
        {numbered_comments}
        
        Sua tarefa é classificar CADA comentário.
        Categorias válidas: "Dor de Uso", "Medo", "Aspiração", "Dúvida Técnica", "Objeção", "Indefinido".
        Intensidade válida: "Baixa", "Média", "Alta", "Extrema".
        
        RETORNE APENAS UM JSON VÁLIDO no seguinte formato (sem formatação markdown ```json):
        [
          {{"index": 0, "categoria": "Medo", "intensidade": "Alta"}},
          {{"index": 1, "categoria": "Aspiração", "intensidade": "Média"}}
        ]
        """
        try:
            response = self.ai_model.generate_content(prompt).text
            clean_json = response.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"  ⚠️ Falha no Batch da IA: {str(e)[:100]}...")
            return []

    def run_radar_cycle(self):
        print("\n📡 ========================================================")
        print("📡 INICIANDO WORKER SCOUT (Escuta Ativa Escalável)")
        print("📡 ========================================================")

        tenants = self.get_target_tenants()
        if not tenants:
            print("⚠️ Nenhum cliente com palavras-chave configuradas.")
            return

        for tenant in tenants:
            print(f"\n🎯 Rastreador focado no Cliente: {tenant.name}")
            keywords = [k.strip() for k in tenant.keywords.split(',')]
            insights_salvos = 0

            for kw in keywords[:3]:
                print(f"\n  🔍 Pesquisando tendência: '{kw}'...")
                video_ids = self.search_youtube_trends(kw, max_results=2)
                
                all_comments = []
                for vid in video_ids:
                    all_comments.extend(self.get_video_comments(vid, max_comments=60)) # Puxa até 120 comentários por keyword
                
                if not all_comments:
                    continue

                print(f"  🧠 {len(all_comments)} comentários extraídos. Iniciando análise neuromarketing em lotes...")

                # Quebra a lista gigante em pedaços de 25 comentários (Chunks)
                chunk_size = 25
                for i in range(0, len(all_comments), chunk_size):
                    chunk = all_comments[i:i + chunk_size]
                    
                    # Pede para a IA analisar os 25 de uma vez
                    classifications = self.classify_batch_with_ai(chunk, tenant.niche)
                    
                    # Salva no banco
                    for item in classifications:
                        idx = item.get('index', -1)
                        cat = item.get('categoria', 'Indefinido')
                        intns = item.get('intensidade', 'Média')
                        
                        if idx >= 0 and idx < len(chunk) and "Indefinido" not in cat:
                            insight = SocialInsight(
                                tenant_id=tenant.id,
                                platform="YouTube",
                                quote=chunk[idx][:500], # Limite de segurança
                                category=cat,
                                intensity=intns,
                                created_at=datetime.now(timezone.utc)
                            )
                            self.db.add(insight)
                            insights_salvos += 1
                            print(f"    ✅ Insight: [{cat}] {chunk[idx][:40]}...")

                    # COMMIT PARCIAL POR LOTE
                    self.db.commit()

                    # === O RESPIRO DA MÁQUINA (ANTI-BAN) ===
                    if i + chunk_size < len(all_comments):
                        print("  ⏳ Pausa tática de 10s para não saturar a Google API...")
                        time.sleep(10)

            print(f"  💾 Total: {insights_salvos} novos insights gravados para {tenant.name}.")

        self.db.close()
        print("\n🔒 Varredura Scout finalizada com sucesso.")

if __name__ == "__main__":
    # PADRONIZAÇÃO SÊNIOR: Carrega variáveis do ambiente
    load_dotenv()
    
    # Nomes idênticos ao do .env e main.py
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not YOUTUBE_API_KEY or not GEMINI_API_KEY:
        print("❌ Erro: YOUTUBE_API_KEY ou GEMINI_API_KEY não configurados no .env")
    else:
        worker = YouTubeScoutRadar(YOUTUBE_API_KEY, GEMINI_API_KEY)
        worker.run_radar_cycle()