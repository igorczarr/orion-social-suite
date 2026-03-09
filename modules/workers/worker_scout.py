import sys
import os
import json
import time
from datetime import datetime, timezone
from googleapiclient.discovery import build
import google.generativeai as genai
from dotenv import load_dotenv

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

    # NOVO: Conta o volume atual para decidir entre Arrastão (1000) ou Manutenção (100)
    def check_tenant_volume(self, tenant_id: int) -> int:
        return self.db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant_id).count()

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
        """Extrai um grande volume de comentários de um vídeo, com paginação."""
        comments = []
        try:
            request = self.youtube.commentThreads().list(
                part="snippet", videoId=video_id, 
                maxResults=100, order="relevance", textFormat="plainText"
            )
            
            # ATUALIZADO: Loop de paginação para conseguir romper a barreira dos 100 iniciais
            while request and len(comments) < max_comments:
                response = request.execute()
                
                for item in response.get('items', []):
                    text = item['snippet']['topLevelComment']['snippet']['textDisplay']
                    # Filtro de qualidade: ignora comentários muito curtos (ex: "amei", "legal")
                    if len(text.strip()) > 20:
                        comments.append(text.replace('\n', ' ').replace('"', "'"))
                
                # Prepara a próxima página
                request = self.youtube.commentThreads().list_next(request, response)
                    
            return comments[:max_comments]
        except Exception as e:
            return comments

    def classify_batch_with_ai(self, comments_list, niche):
        """BATCH PROMPTING ATUALIZADO: Foco em encontrar o Oceano Azul."""
        if not comments_list:
            return []

        numbered_comments = "\n".join([f"[{i}] {c}" for i, c in enumerate(comments_list)])

        prompt = f"""
        Você é um estrategista de Oceano Azul operando no nicho: '{niche}'.
        Sua missão é extrair VANTAGEM COMPETITIVA desses comentários reais do YouTube.
        Ignorar elogios vazios. Focar em lacunas de mercado, demandas não atendidas e sentimentos profundos.
        
        {numbered_comments}
        
        Classifique CADA comentário usando ESTRITAMENTE estas categorias:
        - "Demanda Oculta" (O mercado não está entregando isso)
        - "Dor Subestimada" (Um problema que a maioria ignora)
        - "Medo Paralisante" (O que impede a compra)
        - "Aspiração Real" (O que eles realmente querem no fundo)
        - "Objeção Clássica"
        - "Descarte" (Comentários sem utilidade estratégica)
        
        Intensidade válida: "Baixa", "Média", "Alta", "Extrema".
        
        RETORNE APENAS UM JSON VÁLIDO no seguinte formato (sem formatação markdown ```json):
        [
          {{"index": 0, "categoria": "Demanda Oculta", "intensidade": "Alta"}},
          {{"index": 1, "categoria": "Descarte", "intensidade": "Baixa"}}
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
        print("📡 INICIANDO WORKER SCOUT (Escuta Ativa & Oceano Azul)")
        print("📡 ========================================================")

        tenants = self.get_target_tenants()
        if not tenants:
            print("⚠️ Nenhum cliente com palavras-chave configuradas.")
            return

        for tenant in tenants:
            # LÓGICA DE ESCALA: Verifica quantos dados o cliente tem
            current_volume = self.check_tenant_volume(tenant.id)
            is_initial_load = current_volume < 1000
            
            target_volume = 1000 if is_initial_load else 100
            videos_per_kw = 5 if is_initial_load else 2
            comments_per_video = 100 if is_initial_load else 50

            print(f"\n🎯 Rastreador focado no Cliente: {tenant.name}")
            print(f"  📊 Volume no Cofre: {current_volume} insights.")
            print(f"  ⚙️ Modo: {'ARRASTÃO INICIAL (Alvo: 1000)' if is_initial_load else 'MANUTENÇÃO (Alvo: 100)'}")

            keywords = [k.strip() for k in tenant.keywords.split(',')]
            insights_salvos = 0
            all_comments = []

            # 1. Fase de Coleta
            for kw in keywords[:4]:
                print(f"  🔍 Pesquisando tendência: '{kw}'...")
                video_ids = self.search_youtube_trends(kw, max_results=videos_per_kw)
                
                for vid in video_ids:
                    all_comments.extend(self.get_video_comments(vid, max_comments=comments_per_video))
                    if len(all_comments) >= target_volume:
                        break # Otimização: para de buscar se já bateu a meta
                
                if len(all_comments) >= target_volume:
                    break

            # Limita ao alvo exato para não gastar tokens à toa
            all_comments = all_comments[:target_volume]

            if not all_comments:
                print("  ⚠️ Nenhum comentário relevante encontrado.")
                continue

            print(f"  🧠 {len(all_comments)} comentários extraídos. Iniciando análise Oceano Azul em lotes...")

            # 2. Fase de Processamento IA
            chunk_size = 25
            for i in range(0, len(all_comments), chunk_size):
                chunk = all_comments[i:i + chunk_size]
                
                classifications = self.classify_batch_with_ai(chunk, tenant.niche)
                
                for item in classifications:
                    idx = item.get('index', -1)
                    cat = item.get('categoria', 'Descarte')
                    intns = item.get('intensidade', 'Média')
                    
                    # Salva apenas se for válido e não for lixo (Descarte)
                    if idx >= 0 and idx < len(chunk) and "Descarte" not in cat and "Indefinido" not in cat:
                        insight = SocialInsight(
                            tenant_id=tenant.id,
                            platform="YouTube",
                            quote=chunk[idx][:500],
                            category=cat,
                            intensity=intns,
                            created_at=datetime.now(timezone.utc)
                        )
                        self.db.add(insight)
                        insights_salvos += 1
                        print(f"    ✅ Oceano Azul: [{cat}] {chunk[idx][:40]}...")

                self.db.commit()

                # Respiro anti-ban da Google
                if i + chunk_size < len(all_comments):
                    time.sleep(5)

            print(f"  💾 Total: {insights_salvos} novos insights gravados para {tenant.name}.")

        self.db.close()
        print("\n🔒 Varredura Scout finalizada com sucesso.")

if __name__ == "__main__":
    load_dotenv()
    
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not YOUTUBE_API_KEY or not GEMINI_API_KEY:
        print("❌ Erro: YOUTUBE_API_KEY ou GEMINI_API_KEY não configurados no .env")
    else:
        worker = YouTubeScoutRadar(YOUTUBE_API_KEY, GEMINI_API_KEY)
        worker.run_radar_cycle()