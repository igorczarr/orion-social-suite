# modules/workers/worker_arena.py
import sys
import os
import re
import time
from datetime import datetime, timezone
from dotenv import load_dotenv

# Ajuste de PATH para garantir importações corretas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal, init_db
from database.models import Tenant, TrackedProfile, Post, PostSnapshot, CompetitorAd
from sqlalchemy import desc
from modules.analytics.ai_engine import AIEngine

class ArenaAnalyzer:
    def __init__(self, gemini_api_key: str):
        self.db = SessionLocal()
        self.ai = AIEngine(gemini_api_key)

    def clean_db_username(self, name: str) -> str:
        """Limpeza universal Sênior para garantir que o Match com o banco ocorra."""
        if not name: return ""
        cleaned = name.replace('https://www.instagram.com/', '').replace('https://instagram.com/', '').replace('@', '').replace('/', '').strip().lower()
        return re.sub(r'[^a-zA-Z0-9_.-]', '', cleaned)

    def get_competitors_top_posts(self, competitor_username: str, limit=4):
        """
        Busca no nosso próprio cofre os posts com maior tração deste concorrente.
        USANDO ILIKE: Encontra o post mesmo que a tabela tenha sujeiras do passado.
        """
        comp_limpo = self.clean_db_username(competitor_username)
        
        posts = self.db.query(Post).filter(
            Post.username.ilike(f"%{comp_limpo}%")
        ).order_by(desc(Post.published_at)).limit(limit).all()
        
        return posts

    def generate_ad_intel(self, post: Post):
        """
        Transforma um Post Viral num Estudo de Caso (Ad Intel) usando o Gemini.
        Refatorado com iteração (sem recursão perigosa) e Fail-Fast para o limite Diário.
        """
        now_utc = datetime.now(timezone.utc)
        post_date = post.published_at
        
        if post_date.tzinfo is None:
            post_date = post_date.replace(tzinfo=timezone.utc)
            
        dias_ativo = (now_utc - post_date).days
        if dias_ativo < 1: dias_ativo = 1

        prompt = f"""
        Aja como um Estrategista Sênior de Tráfego Pago e Copywriting.
        Analise a seguinte publicação de um concorrente nosso:
        
        Mídia: {post.media_type}
        Legenda original: "{post.caption[:500]}"
        
        Se fôssemos transformar esse post num Anúncio, qual seria o Gancho Primário (Hook)?
        Identifique o Gatilho em 1 frase curta (máx 10 palavras).
        
        Responda APENAS o Hook, nada mais.
        Exemplo: "O tecido que não amassa na mala." ou "3 erros ao usar linho no inverno."
        """
        
        max_attempts = 3
        for attempt in range(1, max_attempts + 1):
            try:
                # Chama o Gemini usando a interface padronizada
                hook_extraido = self.ai.model.generate_content(prompt).text.strip().replace('"', '')
                
                # Trava de segurança para o tamanho da coluna no banco
                if len(hook_extraido) > 180:
                    hook_extraido = hook_extraido[:177] + "..."
                
                # Lógica de Classificação Tática
                if dias_ativo > 30: status = "Vencedor"
                elif dias_ativo > 7: status = "Escalando"
                else: status = "Teste"
                    
                return {
                    "format": post.media_type,
                    "hook_text": hook_extraido, 
                    "days_active": dias_ativo,
                    "status": status
                }
                
            except Exception as e:
                error_msg = str(e)
                # Análise profunda do erro do Google (429)
                if "429" in error_msg or "Quota exceeded" in error_msg:
                    # Se esgotou a cota DIÁRIA, não adianta tentar de novo. Aborta a operação.
                    if "PerDay" in error_msg:
                        print(f"   🚨 ALERTA VERMELHO: Cota DIÁRIA do Gemini esgotada (Max 20/dia no Free Tier).")
                        return "QUOTA_EXHAUSTED"
                    
                    # Se esgotou a cota por MINUTO, o sistema dorme e tenta de novo.
                    else:
                        if attempt < max_attempts:
                            print(f"   ⚠️ Rate Limit por Minuto atingido. Pausa de 30s (Tentativa {attempt}/{max_attempts})...")
                            time.sleep(30)
                            continue
                        else:
                            print(f"   ❌ Limite de tentativas atingido para este post.")
                            return None
                else:
                    print(f"   ❌ Erro genérico na IA: {e}")
                    return None
                    
        return None

    def run_arena_cycle(self, target_tenant_id=None):
        print("\n⚔️ ========================================================")
        print("⚔️ INICIANDO MOTOR ARENA (Estudo Tático de Concorrentes)")
        print("⚔️ ========================================================\n")
        
        query = self.db.query(Tenant)
        if target_tenant_id:
            query = query.filter(Tenant.id == target_tenant_id)
            
        tenants = query.all()
        
        if not tenants:
            print("⚠️ Nenhum cliente cadastrado/encontrado no cofre.")
            self.db.close()
            return
    
        for tenant in tenants:
            print(f"\n🎯 Preparando Arena para: {tenant.name}")
            
            competitors = self.db.query(TrackedProfile).filter(
                TrackedProfile.tenant_id == tenant.id, 
                TrackedProfile.is_client_account == False
            ).all()
            
            if not competitors:
                print("  ⚠️ Sem concorrentes cadastrados.")
                continue

            for comp in competitors:
                print(f"\n  🕵️‍♂️ Dissecando a estratégia de @{comp.username}...")
                
                top_posts = self.get_competitors_top_posts(comp.username, limit=4)
                
                if not top_posts:
                    print(f"    ⚠️ O Worker de Scrape não possui posts para @{comp.username}.")
                    continue
                
                # Limpa os registros antigos deste concorrente
                self.db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == comp.id).delete()
                self.db.commit() 
                
                salvos = 0
                for post in top_posts:
                    intel = self.generate_ad_intel(post)
                    
                    # Trata o bloqueio diário do Google
                    if intel == "QUOTA_EXHAUSTED":
                        print("\n🛑 PARADA DE EMERGÊNCIA: Operação cancelada para preservar o banco de dados. Atualize o plano do Gemini.")
                        self.db.commit()
                        self.db.close()
                        return # Mata a função run_arena_cycle inteira
                        
                    elif intel:
                        novo_ad = CompetitorAd(
                            tracked_profile_id=comp.id,
                            format=intel['format'],
                            hook_text=intel['hook_text'],
                            days_active=intel['days_active'],
                            status=intel['status'],
                            last_seen_at=datetime.now(timezone.utc)
                        )
                        self.db.add(novo_ad)
                        salvos += 1
                        print(f"    ✅ Hook extraído: '{intel['hook_text']}' ({intel['status']})")
                    
                    # FREIO DE MÃO SÊNIOR: Espera 13s entre cada requisição.
                    # 60 segundos / 13 = ~4.6 requests por minuto. 
                    # Nunca bateremos no limite de 5 requests por minuto do Free Tier!
                    time.sleep(13)
                
                self.db.commit()
                print(f"    💾 {salvos} criativos mapeados e salvos para a Arena.")

        print("\n🔒 Ciclo Arena finalizado. Frontend atualizado.")
        self.db.close()

if __name__ == "__main__":
    load_dotenv()
    
    try:
        init_db()
    except Exception as e:
        pass
    
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not GEMINI_API_KEY:
        print("❌ Erro: GEMINI_API_KEY não configurada no .env")
    else:
        worker = ArenaAnalyzer(GEMINI_API_KEY)
        worker.run_arena_cycle()