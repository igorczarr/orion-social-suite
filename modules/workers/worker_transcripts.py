# modules/workers/worker_transcripts.py
import sys
import os
from datetime import datetime, timezone
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal
from database.models import Tenant, SocialInsight

class TranscriptExtractorWorker:
    """
    ESQUADRÃO 3: O Analista Semântico.
    Extrai as palavras exatas (Transcrições) de vídeos virais do YouTube.
    Não usa Apify. Usa bibliotecas nativas para bypass e economia de 100%.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.formatter = TextFormatter()

    def extract_video_transcript(self, video_id: str) -> str:
        """Puxa a legenda completa do vídeo."""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Tenta pegar em Português primeiro, se não, pega a autogerada ou traduzida
            try:
                transcript = transcript_list.find_transcript(['pt', 'pt-BR'])
            except:
                transcript = transcript_list.find_generated_transcript(['pt'])
                
            raw_text = self.formatter.format_transcript(transcript.fetch())
            
            # Limpa quebras de linha excessivas
            clean_text = " ".join(raw_text.split())
            return clean_text
        except Exception as e:
            print(f" ⚠️ Sem legenda disponível para o vídeo {video_id}: {e}")
            return ""

    def run_transcript_extraction(self, tenant_id: int, video_ids: list):
        print(f"\n📜 [ESQUADRÃO 3] Iniciando Extração de Transcrições para Tenant ID: {tenant_id}")
        
        insights_batch = []
        
        for vid in video_ids:
            print(f" 🎧 Transcrevendo vídeo: {vid}...")
            text = self.extract_video_transcript(vid)
            
            if text:
                # Se a transcrição for muito longa, dividimos em blocos de contexto ricos (ex: 2000 chars)
                chunk = text[:2000] 
                
                insights_batch.append(
                    SocialInsight(
                        tenant_id=tenant_id,
                        platform="YouTube Transcript",
                        quote=f"[SCRIPT VIRAL] {chunk}",
                        category="Modelagem de Script",
                        intensity="Crítica",
                        created_at=datetime.now(timezone.utc)
                    )
                )

        if insights_batch:
            self.db.add_all(insights_batch)
            self.db.commit()
            print(f"  💾 {len(insights_batch)} Transcrições injetadas no banco de dados para Modelagem da IA.")
            
        self.db.close()