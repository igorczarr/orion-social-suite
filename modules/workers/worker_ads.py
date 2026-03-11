# modules/workers/worker_arena.py
import sys
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv # Adicionado para carregar o .env

# Ajuste de PATH para garantir importações corretas
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, TrackedProfile, Post, PostSnapshot, CompetitorAd
from sqlalchemy import func, desc
from modules.analytics.ai_engine import AIEngine

class ArenaAnalyzer:
    def __init__(self, gemini_api_key: str):
        self.db = SessionLocal()
        self.ai = AIEngine(gemini_api_key)

    def get_competitors_top_posts(self, competitor_username: str, limit=4):
        """
        Busca no nosso próprio cofre os posts com maior tração deste concorrente.
        O Worker 1 já fez o trabalho duro de baixar isso.
        """
        # Puxa os posts recentes do concorrente ordenados pela data
        posts = self.db.query(Post).filter(
            Post.username == competitor_username
        ).order_by(desc(Post.published_at)).limit(limit).all()
        
        return posts

    def generate_ad_intel(self, post: Post):
        """
        Transforma um Post Viral num Estudo de Caso (Ad Intel) usando o Gemini.
        A IA vai ler a legenda e deduzir qual é o "Hook" e a Estratégia.
        """
        dias_ativo = (datetime.utcnow() - post.published_at).days
        if dias_ativo < 1:
            dias_ativo = 1

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
        
        try:
            # Chama o Gemini para extrair o Ouro
            hook_extraido = self.ai.model.generate_content(prompt).text.strip().replace('"', '')
            
            # Lógica de Classificação Tática para o Frontend
            # Se for antigo e viral = Vencedor. Novo = Teste.
            if dias_ativo > 30:
                status = "Vencedor"
            elif dias_ativo > 7:
                status = "Escalando"
            else:
                status = "Teste"
                
            return {
                "format": post.media_type,
                "hook_text": hook_extraido[:200], # Limite do banco de dados
                "days_active": dias_ativo,
                "status": status
            }
        except Exception as e:
            print(f"   ❌ Erro de IA no post {post.shortcode}: {e}")
            return None

    def run_arena_cycle(self, target_tenant_id=None): # <-- Adicionado parâmetro
        print("\n⚔️ ========================================================")
        print("⚔️ INICIANDO MOTOR ARENA (Estudo Tático de Concorrentes)")
        print("⚔️ ========================================================\n")
        
        # Filtragem Sênior: Foca em um cliente se o botão for clicado, ou em todos se for madrugada
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
            
            # Puxa APENAS os concorrentes deste cliente
            competitors = self.db.query(TrackedProfile).filter(
                TrackedProfile.tenant_id == tenant.id, 
                TrackedProfile.is_client_account == False
            ).all()
            
            if not competitors:
                print("  ⚠️ Sem concorrentes cadastrados.")
                continue

            for comp in competitors:
                print(f"\n  🕵️‍♂️ Dissecando a estratégia de @{comp.username}...")
                
                # 1. Pega os melhores posts do banco de dados
                top_posts = self.get_competitors_top_posts(comp.username, limit=4)
                
                if not top_posts:
                    print(f"    ⚠️ O Worker 1 ainda não baixou posts para @{comp.username}.")
                    continue
                
                # 2. Limpa os registros antigos deste concorrente na tabela CompetitorAd
                self.db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == comp.id).delete()
                
                # 3. Transforma cada post num "Estudo de Criativo"
                salvos = 0
                for post in top_posts:
                    intel = self.generate_ad_intel(post)
                    
                    if intel:
                        novo_ad = CompetitorAd(
                            tracked_profile_id=comp.id,
                            format=intel['format'],
                            hook_text=intel['hook_text'],
                            days_active=intel['days_active'],
                            status=intel['status'],
                            last_seen_at=datetime.utcnow()
                        )
                        self.db.add(novo_ad)
                        salvos += 1
                        print(f"    ✅ Hook extraído: '{intel['hook_text']}' ({intel['status']})")
                
                self.db.commit()
                print(f"    💾 {salvos} criativos mapeados e salvos para a Arena.")

        print("\n🔒 Ciclo Arena finalizado. Frontend atualizado.")
        self.db.close()

if __name__ == "__main__":
    # PADRONIZAÇÃO SÊNIOR: Carrega variáveis do ambiente
    load_dotenv()
    
    # Nome da variável idêntico ao do .env e main.py
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not GEMINI_API_KEY:
        print("❌ Erro: GEMINI_API_KEY não configurada no .env")
    else:
        worker = ArenaAnalyzer(GEMINI_API_KEY)
        worker.run_arena_cycle()