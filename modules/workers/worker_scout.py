# modules/workers/worker_scout.py
import sys
import os
import time
from datetime import datetime, timezone
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Ajuste de PATH para garantir importações corretas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal, init_db
from database.models import TrackedProfile, SocialInsight, Tenant

class YouTubeScoutRadar:
    def __init__(self, youtube_api_key: str):
        self.youtube = build('youtube', 'v3', developerKey=youtube_api_key)
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
        que foram parar na tabela de Personas no passado.
        """
        print("  🧹 Limpando impurezas do banco (Expurgando dados antigos ou de outras plataformas)...")
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

    def run_radar_cycle(self, target_tenant_id=None):
        print("\n📡 ========================================================")
        print("📡 INICIANDO WORKER SCOUT (Escuta Ativa em Massa - Data Lake)")
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
            
            # Ajuste de carga inteligente
            target_volume = 500 if is_initial_load else 100
            videos_per_kw = 3 if is_initial_load else 1
            comments_per_video = 50 if is_initial_load else 30

            print(f"  📊 Volume no Cofre: {current_volume} insights.")
            print(f"  ⚙️ Modo: {'ARRASTÃO INICIAL (Alvo: 500)' if is_initial_load else 'MANUTENÇÃO (Alvo: 100)'}")

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

            # Remove duplicatas que possam vir de diferentes vídeos com comentários parecidos
            all_comments = list(set(all_comments))[:target_volume]

            if not all_comments:
                print("  ⚠️ Nenhum comentário relevante encontrado.")
                continue

            print(f"  🧠 {len(all_comments)} comentários extraídos. Injetando diretamente no Data Lake (Bulk Insert)...")

            # 2. Fase de Injeção no Banco (Sem IA)
            batch_insert = []
            for comment in all_comments:
                insight = SocialInsight(
                    tenant_id=tenant.id,
                    platform="YouTube",
                    quote=comment[:500], # Trava de segurança para o banco
                    category="Escuta Bruta",
                    intensity="Pendente",
                    created_at=datetime.now(timezone.utc)
                )
                batch_insert.append(insight)

            if batch_insert:
                self.db.add_all(batch_insert)
                self.db.commit()
                insights_salvos = len(batch_insert)

            print(f"  💾 Total: {insights_salvos} novos insights brutos gravados para {tenant.name}.")

        self.db.close()
        print("\n🔒 Varredura Scout finalizada com sucesso.")

if __name__ == "__main__":
    load_dotenv()
    
    try:
        init_db()
    except Exception as e:
        pass

    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    
    if not YOUTUBE_API_KEY:
        print("❌ Erro: YOUTUBE_API_KEY não configurada no .env")
    else:
        # A IA (Gemini) foi removida inteiramente deste motor
        worker = YouTubeScoutRadar(YOUTUBE_API_KEY)
        worker.run_radar_cycle()