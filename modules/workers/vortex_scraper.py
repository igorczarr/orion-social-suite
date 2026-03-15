# modules/workers/vortex_scraper.py
import sys
import os
import unicodedata
from datetime import datetime, timezone
from apify_client import ApifyClient
from dotenv import load_dotenv

# Ajuste de PATH para garantir importações corretas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal, init_db
from database.models import Tenant, TrackedProfile, VortexTarget

class VortexInfiltrator:
    def __init__(self, apify_token: str):
        if not apify_token: raise ValueError("APIFY_TOKEN ausente.")
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()
        # O mesmo actor confiável
        self.apify_actor_id = "shu8hvrXbJbY3Eb9W"

    def _normalize_text(self, text: str) -> str:
        """Limpa acentos e maiúsculas para o motor de busca não falhar."""
        if not text: return ""
        text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
        return text.lower()

    def get_competitors_latest_engagers(self, competitor_username: str, limit=40):
        """
        FASE 1: Extrai quem COMENTOU (Via Expressa) e quem CURTIU (Via Filtrada).
        Lê os últimos 3 posts para garantir volume.
        """
        print(f"  🕵️‍♂️ [Fase 1] Infiltrando os últimos 3 posts de @{competitor_username}...")
        
        run_input = {
            "directUrls": [f"https://www.instagram.com/{competitor_username.replace('@', '')}/"],
            "resultsType": "posts",
            "resultsLimit": 3, # AUMENTADO: Pega os 3 últimos posts para ter volume real
            "proxy": {"useApifyProxy": True, "apifyProxyGroups": ["RESIDENTIAL"]}
        }

        engagers_map = {}

        try:
            run = self.apify_client.actor(self.apify_actor_id).call(run_input=run_input)
            items = self.apify_client.dataset(run["defaultDatasetId"]).list_items().items
            
            if not items:
                print(f"   ⚠️ Nenhum post encontrado para @{competitor_username}.")
                return {}

            for post in items:
                # 1. Pega os Comentaristas (VIA EXPRESSA)
                comments = post.get('latestComments', [])
                for c in comments:
                    username = c.get('ownerUsername')
                    if username:
                        engagers_map[username] = 'commenter'

                # 2. Pega os Curtidores (VIA FILTRADA)
                likers_brutos = post.get('latestLikes', []) or post.get('topLikers', [])
                
                for liker in likers_brutos:
                    username = liker if isinstance(liker, str) else liker.get('ownerUsername')
                    
                    if username:
                        # Se ele já comentou, mantém o status superior (commenter)
                        if username not in engagers_map:
                            engagers_map[username] = 'liker'

            # Limita a lista de extração deste concorrente específico
            selecionados = dict(list(engagers_map.items())[:limit])
            
            total_comentaristas = sum(1 for v in selecionados.values() if v == 'commenter')
            total_curtidores = sum(1 for v in selecionados.values() if v == 'liker')
            
            print(f"   ✅ Separados {len(selecionados)} alvos de @{competitor_username} ({total_comentaristas} comentários, {total_curtidores} curtidas).")
            return selecionados

        except Exception as e:
            print(f"   ❌ Erro na Fase 1 (Apify): {e}")
            return {}

    def get_profiles_dossier(self, usernames: list):
        """FASE 2: Pega a Biografia e Nome Real dos alvos extraídos em lote."""
        if not usernames: return []
            
        print(f"  🔍 [Fase 2] Executando Raio-X em massa de {len(usernames)} perfis...")
        direct_urls = [f"https://www.instagram.com/{u}/" for u in usernames]
        
        run_input = {
            "directUrls": direct_urls,
            "resultsType": "details",
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
            
            print(f"   ✅ Raio-X concluído. {len(dossier)} biografias extraídas com sucesso.")
            return dossier

        except Exception as e:
            print(f"   ❌ Erro na Fase 2: {e}")
            return []

    def process_and_save_target(self, target_data: dict, tenant: Tenant, competitor_username: str, engagement_type: str):
        """
        FASE 3 & 4: Motor de Roteamento (Bypass vs Heurística).
        Retorna "SAVED" se salvou no banco, ou "SKIPPED" se descartou/já existia.
        """
        existente = self.db.query(VortexTarget).filter(
            VortexTarget.tenant_id == tenant.id,
            VortexTarget.username == target_data['username']
        ).first()
        
        if existente:
            return "SKIPPED"
            
        if not target_data.get('bio') and not target_data.get('name'):
            return "SKIPPED"

        primeiro_nome = target_data['name'].split(' ')[0].capitalize() if target_data.get('name') else "tudo bem"
        
        # ROTA 1: COMENTARISTAS (VIA EXPRESSA - SEM FILTRO)
        if engagement_type == 'commenter':
            score = 99
            analise = f"Lead Premium (Bypass). Alto nível de intenção demonstrado ao comentar em @{competitor_username}."
            hook = f"Fala {primeiro_nome}! Tudo certo? Vi seu comentário bem interessante lá na @{competitor_username} e decidi dar um alô. Se curtir {tenant.niche}, dá uma olhada no nosso perfil depois!"
            origin = f"Comentou em @{competitor_username}"

        # ROTA 2: CURTIDORES (VIA HEURÍSTICA - PASSA PELO FILTRO)
        else:
            bio_norm = self._normalize_text(target_data.get('bio', ''))
            tenant_keywords = [self._normalize_text(k.strip()) for k in (tenant.keywords or "").split(',') if k.strip()]
            tenant_personas = [self._normalize_text(p.name) for p in tenant.personas] if hasattr(tenant, 'personas') else []
            arsenal_termos = tenant_keywords + tenant_personas

            score = 45 # Nota base (curtida)
            termos_encontrados = []

            for termo in arsenal_termos:
                if termo and termo in bio_norm:
                    score += 20 # 1 termo = 65 pontos (Aprovado)
                    termos_encontrados.append(termo)

            if score > 99: score = 99

            if score >= 60:
                analise = f"Lead Qualificado por Heurística. Curtiu o concorrente e possui os termos '{', '.join(termos_encontrados)}' na bio."
                hook = f"Oi {primeiro_nome}! Vi que você acompanha a @{competitor_username}. Como notei que sua bio tem a ver com {tenant.niche}, acho que vai adorar nosso conteúdo!"
            else:
                return "SKIPPED" # Aborta o salvamento
                
            origin = f"Curtiu @{competitor_username}"

        # SALVAMENTO NO BANCO
        try:
            novo_alvo = VortexTarget(
                tenant_id=tenant.id,
                username=target_data['username'],
                name=target_data['name'][:100] if target_data['name'] else "Usuário",
                bio=target_data['bio'][:500] if target_data['bio'] else "",
                origin=origin,
                match_score=score,
                ai_analysis=analise[:500], 
                suggested_hook=hook[:500],
                status="pending",
                created_at=datetime.now(timezone.utc)
            )
            self.db.add(novo_alvo)
            self.db.commit()
            print(f"      💾 @{target_data['username']} engatilhado! (Score: {score})")
            return "SAVED"
        except Exception as e:
            self.db.rollback()
            return "SKIPPED"

    def run_infiltration_cycle(self, target_tenant_id=None):
        print("\n🌀 ========================================================")
        print("🌀 INICIANDO MOTOR VÓRTEX DE ESCALA (Varredura em Grade)")
        print("🌀 ========================================================\n")
        
        query = self.db.query(Tenant)
        if target_tenant_id:
            query = query.filter(Tenant.id == target_tenant_id)
            
        tenants = query.all()
        
        if not tenants:
            print("⚠️ Nenhum cliente configurado.")
            self.db.close()
            return

        # META DIÁRIA: 50 Leads Mínimos por Cliente
        META_DIARIA = 50

        for tenant in tenants:
            print(f"\n🎯 Infiltração em Massa Iniciada para Cliente: {tenant.name}")
            
            competitors = self.db.query(TrackedProfile).filter(
                TrackedProfile.tenant_id == tenant.id, 
                TrackedProfile.is_client_account == False
            ).all()
            
            if not competitors:
                print("  ⚠️ Cliente não possui concorrentes mapeados.")
                continue
                 
            alvos_salvos_neste_ciclo = 0

            # O Loop da Varredura: Passa por TODOS os concorrentes até bater a meta
            for comp in competitors:
                if alvos_salvos_neste_ciclo >= META_DIARIA:
                    print(f"  🏁 META ATINGIDA: {META_DIARIA} leads extraídos para {tenant.name}.")
                    break

                # Ampliamos para 40 potenciais por concorrente
                engagers_map = self.get_competitors_latest_engagers(comp.username, limit=40) 
                
                if engagers_map:
                    usernames = list(engagers_map.keys())
                    dossiers = self.get_profiles_dossier(usernames)
                    
                    for target_data in dossiers:
                        engagement_type = engagers_map.get(target_data['username'], 'liker')
                        status = self.process_and_save_target(target_data, tenant, comp.username, engagement_type)
                        
                        if status == "SAVED":
                            alvos_salvos_neste_ciclo += 1
                
                print(f"  📊 Placar Atual para {tenant.name}: {alvos_salvos_neste_ciclo}/{META_DIARIA} leads garantidos.")
                    
        print("\n🔒 Operação Vórtex em Massa Finalizada com sucesso.")
        self.db.close()

if __name__ == "__main__":
    load_dotenv()
    
    try:
        init_db()
    except Exception as e:
        pass

    APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    
    if not APIFY_TOKEN:
        print("❌ Erro: APIFY_TOKEN não configurado no .env")
    else:
        worker = VortexInfiltrator(APIFY_TOKEN)
        worker.run_infiltration_cycle()