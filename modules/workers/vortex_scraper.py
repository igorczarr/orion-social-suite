# modules/workers/vortex_scraper.py
import sys
import os
import time
from datetime import datetime
from apify_client import ApifyClient
from dotenv import load_dotenv # Adicionado para carregar .env

# Ajuste de PATH para garantir importações corretas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, TrackedProfile, VortexTarget
from modules.analytics.ai_engine import AIEngine

class VortexInfiltrator:
    def __init__(self, apify_token: str, gemini_api_key: str):
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()
        self.ai = AIEngine(gemini_api_key)
        # O mesmo actor confiável que usamos no Worker 1
        self.apify_actor_id = "shu8hvrXbJbY3Eb9W"

    def get_competitors_latest_engagers(self, competitor_username: str, limit=5):
        """
        FASE 1: Vai ao perfil do concorrente, pega o último post e extrai quem comentou.
        """
        print(f"🕵️‍♂️ [Fase 1] Infiltrando último post de @{competitor_username}...")
        
        run_input = {
            "directUrls": [f"https://www.instagram.com/{competitor_username.replace('@', '')}/"],
            "resultsType": "posts",
            "resultsLimit": 1, # Só precisamos do post mais recente e bombado
            "proxy": {"useApifyProxy": True, "apifyProxyGroups": ["RESIDENTIAL"]}
        }

        try:
            run = self.apify_client.actor(self.apify_actor_id).call(run_input=run_input)
            items = self.apify_client.dataset(run["defaultDatasetId"]).list_items().items
            
            if not items:
                print(f"⚠️ Nenhum post encontrado para @{competitor_username}.")
                return []

            post = items[0]
            comments = post.get('latestComments', [])
            
            # Extrai apenas os usernames únicos de quem comentou
            engagers = list(set([c.get('ownerUsername') for c in comments if c.get('ownerUsername')]))
            
            # Limita a extração para não queimar todos os créditos da Apify num só ciclo
            selecionados = engagers[:limit]
            print(f"✅ Encontrados {len(comments)} comentários. Separando {len(selecionados)} alvos para Raio-X.")
            return selecionados

        except Exception as e:
            print(f"❌ Erro na Fase 1 (Apify): {e}")
            return []

    def get_profiles_dossier(self, usernames: list):
        """
        FASE 2: Faz um Raio-X profundo nos alvos extraídos para pegar a Biografia e Nome Real.
        """
        if not usernames:
            return []
            
        print(f"🔍 [Fase 2] Executando Raio-X em {len(usernames)} alvos...")
        
        direct_urls = [f"https://www.instagram.com/{u}/" for u in usernames]
        
        run_input = {
            "directUrls": direct_urls,
            "resultsType": "details", # MUDANÇA CRUCIAL: Pede os detalhes do perfil, não os posts
            "proxy": {"useApifyProxy": True, "apifyProxyGroups": ["RESIDENTIAL"]}
        }

        try:
            run = self.apify_client.actor(self.apify_actor_id).call(run_input=run_input)
            profiles = self.apify_client.dataset(run["defaultDatasetId"]).list_items().items
            
            dossier = []
            for p in profiles:
                dossier.append({
                    "username": p.get("username"),
                    "name": p.get("fullName", ""),
                    "bio": p.get("biography", ""),
                    "followers": p.get("followersCount", 0)
                })
            
            print(f"✅ Raio-X concluído. {len(dossier)} biografias extraídas.")
            return dossier

        except Exception as e:
            print(f"❌ Erro na Fase 2 (Apify): {e}")
            return []

    def process_and_save_target(self, target_data: dict, tenant: Tenant, competitor_username: str):
        """
        FASE 3 & 4: IA analisa o perfil e salva no PostgreSQL se for qualificado.
        """
        # Proteção contra duplicatas
        existente = self.db.query(VortexTarget).filter(
            VortexTarget.tenant_id == tenant.id,
            VortexTarget.username == target_data['username']
        ).first()
        
        if existente:
            print(f"   ⏭️ @{target_data['username']} já está na nossa base. Pulando.")
            return

        personas = [p.name for p in tenant.personas]
        personas_str = ", ".join(personas) if personas else "Público Geral"

        prompt = f"""
        Você é um estrategista de aquisição orgânica para a marca '{tenant.name}' (Nicho: {tenant.niche}).
        Nossas personas alvo são: {personas_str}.
        
        Avalie este usuário que acabou de interagir com nosso concorrente (@{competitor_username}):
        - Nome: {target_data['name']}
        - Username: @{target_data['username']}
        - Bio: {target_data['bio']}
        
        TAREFAS EXATAS:
        1. SCORE: Dê uma nota de 0 a 100 baseada no quanto a Bio bate com nossas personas.
        2. ANALISE: Uma frase justificando a nota.
        3. HOOK: Se a nota for >= 70, escreva um comentário de 1 frase focado. Se não, 'N/A'.
        
        Responda ESTRITAMENTE neste formato:
        SCORE: [numero]
        ANALISE: [texto]
        HOOK: [texto]
        """

        try:
            response = self.ai.model.generate_content(prompt).text
            
            # Parse seguro da resposta da IA
            score = 0
            analise = "Análise indisponível."
            hook = "N/A"
            
            for linha in response.split('\n'):
                linha = linha.strip()
                if linha.startswith("SCORE:"):
                    try: score = int(linha.replace("SCORE:", "").strip())
                    except: score = 0
                elif linha.startswith("ANALISE:"):
                    analise = linha.replace("ANALISE:", "").strip()
                elif linha.startswith("HOOK:"):
                    hook = linha.replace("HOOK:", "").strip()

            print(f"   🧠 @{target_data['username']} | Score IA: {score}")

            if score >= 60:
                novo_alvo = VortexTarget(
                    tenant_id=tenant.id,
                    username=target_data['username'],
                    name=target_data['name'],
                    bio=target_data['bio'],
                    origin=f"Comentou em @{competitor_username}",
                    match_score=score,
                    ai_analysis=analise[:500],
                    suggested_hook=hook[:500],
                    status="pending",
                    created_at=datetime.utcnow()
                )
                self.db.add(novo_alvo)
                self.db.commit()
                print(f"     💾 Alvo salvo com sucesso na fila do Terminal Sniper!")
            else:
                print(f"     🗑️ Descartado (Score baixo).")

        except Exception as e:
            print(f"   ❌ Erro na Análise de IA para @{target_data['username']}: {e}")
            self.db.rollback()

    def run_infiltration_cycle(self):
        print("\n🌀 ========================================================")
        print("🌀 INICIANDO MOTOR VÓRTEX (Lookalike & Infiltração Real)")
        print("🌀 ========================================================\n")
        
        tenants = self.db.query(Tenant).all()
        
        if not tenants:
            print("⚠️ Nenhum cliente (Tenant) configurado.")
            self.db.close()
            return

        for tenant in tenants:
            print(f"\n🎯 Operação Iniciada para Cliente: {tenant.name}")
            
            competitors = self.db.query(TrackedProfile).filter(
                TrackedProfile.tenant_id == tenant.id, 
                TrackedProfile.is_client_account == False
            ).all()
            
            if not competitors:
                 continue
                 
            alvo_concorrente = competitors[0].username 
            engagers_usernames = self.get_competitors_latest_engagers(alvo_concorrente, limit=5)
            
            if engagers_usernames:
                dossiers = self.get_profiles_dossier(engagers_usernames)
                for target_data in dossiers:
                    self.process_and_save_target(target_data, tenant, alvo_concorrente)
                    time.sleep(1) 
                    
        print("\n🔒 Operação Vórtex Finalizada.")
        self.db.close()

if __name__ == "__main__":
    # PADRONIZAÇÃO SÊNIOR: Carrega variáveis do ambiente
    load_dotenv()
    
    # Nomes idênticos ao .env e main.py
    APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not APIFY_TOKEN or not GEMINI_API_KEY:
        print("❌ Erro: APIFY_TOKEN ou GEMINI_API_KEY não configurados no .env")
    else:
        worker = VortexInfiltrator(APIFY_TOKEN, GEMINI_API_KEY)
        worker.run_infiltration_cycle()