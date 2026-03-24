# modules/workers/worker_osint.py
import os
import json
from datetime import datetime, timezone
from apify_client import ApifyClient
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Imports do nosso ecossistema
from database.connection import SessionLocal
from database.models import Tenant, TrackedProfile, PersonaDossier, CompetitorWarRoom
from modules.analytics.ai_engine import AIEngine

class OrionOSINT:
    """
    MOTOR DE ESPIONAGEM GLOBAL E NEURO-PERFILAMENTO (FASE 3 MULTI-BRAIN)
    Orquestra atores do Apify para sugar Data Lakes do TikTok e Instagram,
    processa via Agentes de Elite (Gemini) e salva no banco de dados da VRTICE.
    """
    def __init__(self, apify_token: str, key_sociologo: str, key_espiao: str):
        if not apify_token:
            raise ValueError("⚠️ [CRÍTICO] APIFY_TOKEN ausente. O Motor OSINT requer o Apify para raspagem militar.")
        
        self.apify = ApifyClient(apify_token)
        
        # 🧠 ARQUITETURA MULTI-BRAIN: Criando agentes independentes com chaves distintas
        self.ai_sociologo = AIEngine(key_sociologo) if key_sociologo else None
        self.ai_espiao = AIEngine(key_espiao) if key_espiao else None
        
        # Atores (Actors) oficiais e homologados do Apify para OSINT
        self.actor_ig_comments = "apify/instagram-comment-scraper"
        self.actor_ig_posts = "apify/instagram-scraper"
        self.actor_tiktok = "clockworks/tiktok-scraper" # Ator premium para buscas massivas no TikTok

    def run_full_recon(self, tenant_id: int):
        """Inicia a operação de reconhecimento total (OODA Loop) para um cliente."""
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            if not tenant:
                print(f"❌ [OSINT] Abortando. Cliente {tenant_id} não encontrado.")
                return

            print(f"\n{'='*60}")
            print(f"🚀 INICIANDO PROTOCOLO ORION OSINT (MULTI-BRAIN) PARA: {tenant.name}")
            print(f"{'='*60}")

            # 1. Aciona a Câmara do Sociólogo (Perfilamento de Massa)
            if self.ai_sociologo:
                self._execute_sociologist_module(db, tenant)
            else:
                print("⚠️ Chave do Sociólogo ausente. Pulando Perfilamento.")

            # 2. Aciona a Câmara do Espião (Tear-down Competitivo)
            if self.ai_espiao:
                self._execute_spy_module(db, tenant)
            else:
                print("⚠️ Chave do Espião ausente. Pulando Cartografia.")

            print(f"\n✅ [OSINT] Reconhecimento concluído para {tenant.name}. Dados guardados no cofre.")
        except Exception as e:
            print(f"❌ [OSINT CRASH] Falha sistêmica durante o rastreamento: {e}")
        finally:
            db.close()

    def _execute_sociologist_module(self, db: Session, tenant: Tenant):
        """
        MÓDULO 1: O Sociólogo.
        Extrai comentários do IG dos concorrentes + Busca keywords no TikTok.
        """
        print("\n🧠 [MÓDULO 1: O SOCIÓLOGO] Minerando a psique do mercado...")
        raw_data_lake = []

        competitors = db.query(TrackedProfile).filter(
            TrackedProfile.tenant_id == tenant.id, 
            TrackedProfile.is_client_account == False
        ).all()

        # --- A. RASPAGEM DE COMENTÁRIOS DO INSTAGRAM ---
        if competitors:
            comp_usernames = [c.username for c in competitors]
            print(f"   📡 Infiltrando no Instagram dos concorrentes: {comp_usernames}")
            
            run_input_ig = {
                "usernames": comp_usernames,
                "resultsLimit": 500, # Limite de comentários para não estourar tokens
            }
            
            try:
                # Dispara o scraper de comentários (CORRIGIDO NAMERROR)
                run_ig = self.apify.actor(self.actor_ig_comments).call(run_input=run_input_ig)
                for item in self.apify.dataset(run_ig["defaultDatasetId"]).iterate_items():
                    text = item.get("text")
                    if text and len(text) > 10: # Ignora emojis e "top"
                        raw_data_lake.append(f"[IG @{item.get('ownerUsername')}] {text}")
            except Exception as e:
                print(f"   ⚠️ Falha ao raspar comentários do IG: {e}")

        # --- B. RASPAGEM DO TIKTOK VIA KEYWORDS ---
        if tenant.keywords:
            keywords_list = [k.strip() for k in tenant.keywords.split(",")]
            print(f"   📡 Varrendo TikTok pelas Keywords: {keywords_list}")
            
            run_input_tk = {
                "searchQueries": keywords_list,
                "resultsPerPage": 20, # Traz os 20 vídeos mais virais de cada palavra
                "shouldDownloadVideos": False
            }
            
            try:
                run_tk = self.apify.actor(self.actor_tiktok).call(run_input=run_input_tk)
                for item in self.apify.dataset(run_tk["defaultDatasetId"]).iterate_items():
                    desc = item.get("text", "")
                    raw_data_lake.append(f"[TikTok Trend] {desc}")
            except Exception as e:
                print(f"   ⚠️ Falha ao raspar TikTok: {e}")

        # --- C. PROCESSAMENTO NEURAL E VALIDAÇÃO ---
        if not raw_data_lake:
            print("   ⚠️ Data Lake vazio. O Sociólogo não tem dados para analisar.")
            return

        print(f"   🌊 Data Lake formado com {len(raw_data_lake)} amostras. Injetando no Motor de IA...")
        
        # Limita o array para os 2.000 mais densos para evitar sobrecarga de contexto
        dossier_json = self.ai_sociologo.execute_sociologist_profiling(tenant.niche, raw_data_lake[:2000])

        if dossier_json:
            print("   ✅ Neuro-Perfilamento concluído. Salvando no Dossiê da Persona...")
            
            # Substitui o dossiê antigo pelo novo (Mantém o banco limpo e atualizado)
            db.query(PersonaDossier).filter(PersonaDossier.tenant_id == tenant.id).delete()
            
            new_dossier = PersonaDossier(
                tenant_id=tenant.id,
                macro_sentiment=dossier_json.get("macro_sentiment", "N/A"),
                core_desire=dossier_json.get("core_desire", "N/A"),
                hidden_objection=dossier_json.get("hidden_objection", "N/A"),
                awareness_level=dossier_json.get("awareness_level", "N/A"),
                golden_quotes=dossier_json.get("golden_quotes", [])
            )
            db.add(new_dossier)
            db.commit()
        else:
            print("   ❌ A IA falhou ao gerar a estrutura JSON do Dossiê.")

    def _execute_spy_module(self, db: Session, tenant: Tenant):
        """
        MÓDULO 2: O Espião.
        Rastreia concorrentes individualmente, extrai a mídia original e faz a Engenharia Reversa (OODA Loop).
        """
        print("\n🥷 [MÓDULO 2: O ESPIÃO] Iniciando Shadow Tracking de Concorrentes...")
        
        competitors = db.query(TrackedProfile).filter(
            TrackedProfile.tenant_id == tenant.id, 
            TrackedProfile.is_client_account == False
        ).all()

        if not competitors:
            print("   ⚠️ Nenhum alvo (concorrente) detectado no radar.")
            return

        # O Espião varre 1 por 1
        for comp in competitors:
            print(f"   🎯 Fixando mira no alvo: @{comp.username}")
            
            run_input = {
                "search": comp.username,
                "searchType": "user",
                "resultsLimit": 3 # Pega as 3 últimas campanhas/posts para engenharia reversa
            }
            
            try:
                run_spy = self.apify.actor(self.actor_ig_posts).call(run_input=run_input)
                dataset = list(self.apify.dataset(run_spy["defaultDatasetId"]).iterate_items())
                
                # Se não tem posts na raspagem, pula pro próximo
                if not dataset:
                    continue
                
                # Limpa a Sala de Guerra antiga deste concorrente para atualizar
                db.query(CompetitorWarRoom).filter(CompetitorWarRoom.tracked_profile_id == comp.id).delete()

                for post in dataset:
                    caption = post.get("caption", "")
                    if not caption: continue

                    format_type = "Vídeo/Reels" if post.get("isVideo") else "Imagem/Carrossel"
                    
                    # OSINT: Extrai a URL real da mídia para dar PLAY na Dashboard
                    media_url = post.get("videoUrl") if post.get("isVideo") else post.get("displayUrl")
                    post_url = post.get("url", "")
                    
                    print(f"      ⚙️ Analisando campanha: {post_url}")
                    
                    # Aciona o OODA Loop da IA
                    war_room_json = self.ai_espiao.execute_spy_ooda_loop(comp.username, caption, format_type)
                    
                    if war_room_json:
                        new_intel = CompetitorWarRoom(
                            tracked_profile_id=comp.id,
                            campaign_url=media_url or post_url,
                            detected_hook=war_room_json.get("detected_hook", "Não detectado"),
                            cialdini_trigger=war_room_json.get("cialdini_trigger", "Desconhecido"),
                            market_gap=war_room_json.get("market_gap", "N/A"),
                            counter_strategy=war_room_json.get("counter_strategy", "N/A")
                        )
                        db.add(new_intel)
                
                db.commit()
                print(f"      ✅ Ficha Criminal de @{comp.username} arquivada na War Room.")
                
            except Exception as e:
                print(f"   ⚠️ Falha ao espionar @{comp.username}: {e}")

# =====================================================================
# ÁREA DE TESTE ISOLADO (Execução Manual do Worker)
# =====================================================================
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    KEY_SOC = os.getenv("GEMINI_KEY_SOCIOLOGO")
    KEY_ESP = os.getenv("GEMINI_KEY_ESPIAO")
    
    # ID de um Tenant real no seu banco de dados para teste
    TEST_TENANT_ID = 1 
    
    if not APIFY_TOKEN or not KEY_SOC or not KEY_ESP:
        print("⚠️ Chaves de API não configuradas no .env")
    else:
        worker = OrionOSINT(apify_token=APIFY_TOKEN, key_sociologo=KEY_SOC, key_espiao=KEY_ESP)
        worker.run_full_recon(tenant_id=TEST_TENANT_ID)