# modules/ingestion/worker_youtube.py
import sys
import os
import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.exc import SQLAlchemyError
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

# Ajuste de PATH para garantir importações a partir da raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, SwipeFile, SocialInsight
from config.settings import settings

class YoutubeInterrogatorWorker:
    """
    ESQUADRÃO DE RETENÇÃO (O Interrogador).
    Extrai roteiros de vídeos virais e escuta dores no confessionário (comentários).
    Atua nos mercados BR, US e GB.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.api_key = settings.ExternalAPIs.YOUTUBE_API_KEY
        
        if not self.api_key or self.api_key == ".":
            raise Exception("🛑 [CRÍTICO] Chave da API do YouTube ausente. Interrogador cego.")
            
        # Instancia o cliente oficial do Google (Custo: Cotas Diárias)
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        
        # O Mapa de Arbitragem Global
        self.markets = [
            {"name": "Brasil", "gl": "BR", "lang_codes": ['pt', 'pt-BR']},
            {"name": "Estados Unidos", "gl": "US", "lang_codes": ['en', 'en-US']},
            {"name": "Europa (UK)", "gl": "GB", "lang_codes": ['en', 'en-GB']}
        ]

    def _get_viral_videos(self, query: str, region_code: str) -> list:
        """
        FASE 1: Radar de Viralidade.
        Busca os vídeos que dominaram o algoritmo nos últimos 30 dias naquele país.
        """
        # Filtro de tempo: Apenas o que está a funcionar AGORA (últimos 30 dias)
        last_month = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        
        try:
            request = self.youtube.search().list(
                part="id,snippet",
                q=query,
                type="video",
                regionCode=region_code,
                order="relevance", # Mescla visualizações com engajamento
                publishedAfter=last_month,
                maxResults=3 # Micro-batching para poupar a cota gratuita do Google
            )
            response = request.execute()
            
            videos = []
            for item in response.get('items', []):
                videos.append({
                    "video_id": item['id']['videoId'],
                    "title": item['snippet']['title'],
                    "channel": item['snippet']['channelTitle'],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                })
            return videos
        except HttpError as e:
            print(f"  ⚠️ [YouTube API] Falha no Radar da região {region_code}: Erro HTTP {e.resp.status}")
            return []

    def _extract_transcript(self, video_id: str, lang_codes: list) -> str:
        """
        FASE 2: A Interrogação Silenciosa.
        Usa scraping de frontend (youtube_transcript_api) para não gastar 1 cêntimo da API oficial.
        """
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=lang_codes)
            formatter = TextFormatter()
            text_transcript = formatter.format_transcript(transcript)
            return text_transcript
        except Exception as e:
            # Muitos vídeos têm transcrição bloqueada ou são instrumentais
            return ""

    def _extract_confessions(self, video_id: str) -> list:
        """
        FASE 3: O Confessionário (Comentários).
        Puxa os comentários mais relevantes onde a audiência expõe as suas dores.
        """
        try:
            request = self.youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=15, # Limite tático focado na qualidade
                order="relevance" 
            )
            response = request.execute()
            
            comments = []
            for item in response.get('items', []):
                comment_data = item['snippet']['topLevelComment']['snippet']
                text = comment_data['textOriginal']
                likes = comment_data['likeCount']
                
                # FILTRO DE ELITE: Ignora comentários vazios de valor (ex: "Legal!", "Muito bom")
                # Se tem menos de 15 caracteres, não tem dor (Job-To-Be-Done) a ser mapeada.
                if len(text) > 15:
                    comments.append({"text": text, "likes": likes})
                    
            return comments
        except HttpError as e:
            # Comentários desativados pelo canal
            return []

    def run_deep_interrogation(self, tenant_id: int):
        print(f"\n🕵️‍♂️ [O INTERROGADOR] Iniciando Extração Profunda no YouTube para Tenant: {tenant_id}")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant or not tenant.keywords:
            print(" ⚠️ Missão abortada: Cliente não encontrado ou sem Keywords configuradas.")
            self.db.close()
            return

        keywords = [k.strip() for k in tenant.keywords.split(',')]
        if not keywords: return

        core_keyword = keywords[0]
        scripts_salvos = 0
        insights_salvos = 0

        for market in self.markets:
            print(f"\n 🌍 [MERCADO: {market['name'].upper()}] Radares Ativos para: '{core_keyword}'")
            
            # 1. Encontra os Vídeos Virais Recentes
            videos = self._get_viral_videos(core_keyword, market['gl'])
            print(f"  🎯 {len(videos)} vídeos virais identificados. Iniciando extração.")

            for video in videos:
                vid_id = video['video_id']
                
                # [IDEMPOTÊNCIA] Verifica se já roubámos este roteiro antes
                existente = self.db.query(SwipeFile).filter(
                    SwipeFile.tenant_id == tenant_id,
                    SwipeFile.source_url == video['url']
                ).first()
                
                if existente:
                    print(f"  ⏭️ Vídeo '{video['title'][:30]}...' já interrogado anteriormente. Saltando.")
                    continue

                print(f"  🎙️ Transcrevendo: {video['title'][:40]}...")
                
                # 2. Extrai Roteiro (Bypass de Custo)
                transcript = self._extract_transcript(vid_id, market['lang_codes'])
                
                # 3. Extrai Dores (Comentários)
                comments = self._extract_confessions(vid_id)

                # --- PERSISTÊNCIA: A BIBLIOTECA DE OURO ---
                try:
                    # Salva o Roteiro se ele existir
                    if transcript:
                        script_breakdown = {
                            "market": market['name'],
                            "channel": video['channel'],
                            "title": video['title']
                        }
                        novo_swipe = SwipeFile(
                            tenant_id=tenant_id,
                            category='YouTube Script',
                            content=f"TÍTULO: {video['title']}\n\nROTEIRO INTEGRAL:\n{transcript[:15000]}", # Limite seguro para o banco
                            source_url=video['url'],
                            performance_score=100, # Vídeo validado no último mês
                            ai_breakdown=script_breakdown
                        )
                        self.db.add(novo_swipe)
                        scripts_salvos += 1

                    # Salva as dores no Ouvidor Social
                    for c in comments:
                        insight = SocialInsight(
                            tenant_id=tenant_id,
                            platform="YouTube",
                            quote=c['text'],
                            category="Comentário",
                            intensity=str(c['likes']) # Guardamos o número de likes como "Intensidade"
                        )
                        self.db.add(insight)
                        insights_salvos += 1

                    self.db.commit()
                    print(f"    ✅ Arquivado: Roteiro capturado e {len(comments)} Dores mapeadas.")
                except SQLAlchemyError as e:
                    self.db.rollback()
                    print(f"    ❌ [CRÍTICO] Falha ao injetar inteligência de {vid_id}: {e}")
                    
                # Evasão Básica para APIs do Google
                time.sleep(1)

        self.db.close()
        print(f"\n🏁 [O INTERROGADOR] Operação Finalizada.")
        print(f" 🏆 Roteiros Modelados no Swipe File: {scripts_salvos}")
        print(f" 🧠 Dores Sociais Extraídas para o Córtex: {insights_salvos}")

# =====================================================================
# BLOCO DE TESTE ISOLADO
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = YoutubeInterrogatorWorker()
    worker.run_deep_interrogation(tenant_id=1)