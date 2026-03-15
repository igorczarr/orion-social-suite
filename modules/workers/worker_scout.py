import sys
import os
import json
import time
from datetime import datetime, timezone
from googleapiclient.discovery import build
import google.generativeai as genai
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal, init_db
from database.models import TrackedProfile, SocialInsight, Tenant

class YouTubeScoutRadar:
    def __init__(self, youtube_api_key: str, gemini_api_key: str):
        self.youtube = build('youtube', 'v3', developerKey=youtube_api_key)
        genai.configure(api_key=gemini_api_key)
        # Usamos o flash que é rápido e lida bem com JSON
        self.ai_model = genai.GenerativeModel('gemini-2.5-flash')
        self.db = SessionLocal()

    def get_target_tenants(self, target_tenant_id=None):
        query = self.db.query(Tenant).filter(Tenant.keywords != None)
        if target_tenant_id:
            query = query.filter(Tenant.id == target_tenant_id)
        return query.all()

    def check_tenant_volume(self, tenant_id: int) -> int:
        return self.db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant_id).count()

    def _purge_contaminated_data(self, tenant_id: int):
        """
        OPERAÇÃO LIXEIRO: Remove os dados velhos/errados (Trends e Notícias) 
        que foram parar na tabela de Personas por erro do antigo motor.
        """
        print("  🧹 Limpando impurezas do banco (Expurgando dados de radar contaminados)...")
        # Remove tudo que for Trend, Notícia ou que não tenha vindo do YouTube (O verdadeiro Scout)
        self.db.query(SocialInsight).filter(
            SocialInsight.tenant_id == tenant_id,
            SocialInsight.platform != "YouTube"
        ).delete()
        self.db.commit()

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
            
            while request and len(comments) < max_comments:
                response = request.execute()
                
                for item in response.get('items', []):
                    text = item['snippet']['topLevelComment']['snippet']['textDisplay']
                    # Filtro de qualidade: ignora comentários muito curtos (ex: "amei", "legal")
                    if len(text.strip()) > 20:
                        comments.append(text.replace('\n', ' ').replace('"', "'"))
                
                request = self.youtube.commentThreads().list_next(request, response)
                    
            return comments[:max_comments]
        except Exception as e:
            return comments

    def classify_batch_with_ai(self, comments_list, niche, attempt=1):
        """BATCH PROMPTING: Foco em encontrar o Oceano Azul. Com Rate Limiting."""
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
            error_msg = str(e)
            if "429" in error_msg or "Quota exceeded" in error_msg:
                if "PerDay" in error_msg:
                    print(f"   🚨 Cota DIÁRIA do Gemini esgotada. Abortando IA.")
                    return "QUOTA_EXHAUSTED"
                elif attempt <= 3:
                    print(f"   ⚠️ Rate Limit (Gemini). Pausando 30s (Tentativa {attempt}/3)...")
                    time.sleep(30)
                    return self.classify_batch_with_ai(comments_list, niche, attempt + 1)
            
            print(f"  ⚠️ Falha no Batch da IA: {error_msg[:100]}...")
            return []

    def run_radar_cycle(self, target_tenant_id=None):
        print("\n📡 ========================================================")
        print("📡 INICIANDO WORKER SCOUT (Escuta Ativa & Oceano Azul)")
        print("📡 ========================================================")

        tenants = self.get_target_tenants(target_tenant_id)
        if not tenants:
            print("⚠️ Nenhum cliente com palavras-chave configuradas.")
            return

        for tenant in tenants:
            print(f"\n🎯 Rastreador focado no Cliente: {tenant.name}")
            
            # --- EXPURGO DE DADOS CONTAMINADOS ---
            self._purge_contaminated_data(tenant.id)
            
            current_volume = self.check_tenant_volume(tenant.id)
            is_initial_load = current_volume < 1000
            
            target_volume = 1000 if is_initial_load else 100
            videos_per_kw = 5 if is_initial_load else 2
            comments_per_video = 100 if is_initial_load else 50

            print(f"  📊 Volume no Cofre: {current_volume} insights puros.")
            print(f"  ⚙️ Modo: {'ARRASTÃO INICIAL (Alvo: 1000)' if is_initial_load else 'MANUTENÇÃO (Alvo: 100)'}")

            if not tenant.keywords:
                print("  ⚠️ Cliente sem keywords. Pulando.")
                continue
                
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
                        break 
                
                if len(all_comments) >= target_volume:
                    break

            all_comments = all_comments[:target_volume]

            if not all_comments:
                print("  ⚠️ Nenhum comentário relevante encontrado.")
                continue

            print(f"  🧠 {len(all_comments)} comentários extraídos. Iniciando análise Oceano Azul...")

            # 2. Fase de Processamento IA
            chunk_size = 25
            for i in range(0, len(all_comments), chunk_size):
                chunk = all_comments[i:i + chunk_size]
                
                classifications = self.classify_batch_with_ai(chunk, tenant.niche)
                
                if classifications == "QUOTA_EXHAUSTED":
                    print("🛑 Abortando classificação para proteger o banco. Troque a API Key.")
                    break
                    
                if not classifications:
                    continue

                for item in classifications:
                    idx = item.get('index', -1)
                    cat = item.get('categoria', 'Descarte')
                    intns = item.get('intensidade', 'Média')
                    
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
                # Pacing seguro para a IA gratuita
                time.sleep(13)

            print(f"  💾 Total: {insights_salvos} novos insights gravados para {tenant.name}.")

        self.db.close()
        print("\n🔒 Varredura Scout finalizada com sucesso.")

if __name__ == "__main__":
    load_dotenv()
    
    try:
        init_db()
    except Exception as e:
        pass

    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not YOUTUBE_API_KEY or not GEMINI_API_KEY:
        print("❌ Erro: YOUTUBE_API_KEY ou GEMINI_API_KEY não configurados no .env")
    else:
        worker = YouTubeScoutRadar(YOUTUBE_API_KEY, GEMINI_API_KEY)
        worker.run_radar_cycle()