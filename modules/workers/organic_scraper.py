# modules/workers/organic_scraper.py
import sys
import os
from datetime import datetime
from apify_client import ApifyClient

# Ajuste de PATH para garantir que o Python encontre a raiz do projeto (models e connection)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import TrackedProfile, ProfileHistory, Post, PostSnapshot

class OrganicScraper:
    def __init__(self, apify_token: str):
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()

    def get_active_profiles(self):
        """Busca no Banco de Dados a lista de TODOS os perfis ativos (Clientes e Concorrentes)."""
        return self.db.query(TrackedProfile).filter(TrackedProfile.is_active == True).all()

    def run(self):
        """Orquestra a coleta massiva usando a Nuvem."""
        print("\n⚙️ --- INICIANDO WORKER 1: RASTREADOR ORGÂNICO (APIFY) ---")
        
        profiles = self.get_active_profiles()
        
        if not profiles:
            print("⚠️ Nenhum perfil ativo encontrado na base de dados.")
            self.db.close()
            return

        usernames = [p.username for p in profiles]
        print(f"🎯 Alvos identificados no Cofre ({len(usernames)}): {usernames}")

        # Prepara a missão para os servidores do Apify
        # Transforma os @usernames em URLs diretas para garantir a coleta
        direct_urls = [f"https://www.instagram.com/{u.replace('@', '')}/" for u in usernames]
        
        run_input = {
            "directUrls": direct_urls,
            "resultsType": "posts",
            "resultsLimit": 5, # Pega os 5 posts mais recentes para ver a tendência
            "proxy": {
                "useApifyProxy": True, 
                "apifyProxyGroups": ["RESIDENTIAL"] # Usa proxy residencial para não ser bloqueado
            }
        }

        print("⏳ Disparando satélites (Apify)... Isso pode levar de 1 a 3 minutos.")
        
        try:
            # Chama o Robô de Scraping da Apify (O mesmo ID que você usava com sucesso)
            actor_run = self.apify_client.actor("shu8hvrXbJbY3Eb9W").call(run_input=run_input)
            dataset_items = self.apify_client.dataset(actor_run["defaultDatasetId"]).list_items().items
            
            print(f"✅ Download da nuvem concluído! {len(dataset_items)} itens capturados.")
            
            # Manda os dados crus para serem lapidados e guardados no PostgreSQL
            self.process_and_save(dataset_items, profiles)
            
        except Exception as e:
            print(f"❌ Erro fatal na comunicação com o Apify: {e}")
        finally:
            self.db.close()
            print("🔒 Conexão com o banco de dados encerrada.")

    def process_and_save(self, items, db_profiles):
        """Pega no JSON caótico do Instagram e guarda organizadamente nas nossas 3 tabelas."""
        print("💾 Injetando dados no Banco Relacional (PostgreSQL)...")
        
        novos_posts = 0
        novos_snapshots = 0
        
        # Controle para não duplicar o histórico de seguidores no mesmo dia
        processed_profiles = set()

        try:
            for item in items:
                shortcode = item.get('shortCode')
                username = item.get('ownerUsername')
                
                if not shortcode or not username:
                    continue
                
                # Garante que o username capturado bate com o formato salvo no BD (com ou sem '@')
                db_profile = next((p for p in db_profiles if p.username.replace('@', '') == username), None)
                
                # 1. Salvar o "Retrato de Saúde" do Perfil (Seguidores Hoje)
                if username not in processed_profiles:
                    owner = item.get('owner', {})
                    history = ProfileHistory(
                        username=db_profile.username if db_profile else username,
                        date=datetime.now(),
                        followers=owner.get('followersCount', 0),
                        following=owner.get('followsCount', 0),
                        posts_count=owner.get('postsCount', 0)
                    )
                    self.db.add(history)
                    processed_profiles.add(username)
                    
                    # Atualiza a data de última raspagem no perfil
                    if db_profile:
                        db_profile.last_scraped_at = datetime.now()

                # 2. Salvar o Post Físico (Se for a primeira vez que o vemos)
                post_existente = self.db.query(Post).filter(Post.shortcode == shortcode).first()
                
                if not post_existente:
                    media_type = 'Reels/Video' if item.get('videoUrl') else item.get('type', 'Imagem')
                    
                    # Formata a data de publicação
                    try:
                        pub_date_str = item.get('timestamp', '')[:19]
                        pub_date = datetime.strptime(pub_date_str, "%Y-%m-%dT%H:%M:%S")
                    except:
                        pub_date = datetime.now()

                    novo_post = Post(
                        shortcode=shortcode,
                        username=db_profile.username if db_profile else username,
                        published_at=pub_date,
                        media_type=media_type,
                        caption=item.get('caption', ''),
                        url=item.get('url', f"https://instagram.com/p/{shortcode}")
                    )
                    self.db.add(novo_post)
                    novos_posts += 1

                # 3. Criar o Snapshot de Desempenho Atual (Para a Matriz Analítica)
                # Fazemos isto sempre, mesmo que o post seja antigo, para ver se os likes subiram
                snapshot = PostSnapshot(
                    post_shortcode=shortcode,
                    date=datetime.now(),
                    likes=item.get('likesCount', 0),
                    comments=item.get('commentsCount', 0),
                    views=item.get('videoViewCount', 0),
                    saves=0 # O Apify não puxa saves públicos, a IA no Dashboard vai calcular uma estimativa
                )
                self.db.add(snapshot)
                novos_snapshots += 1

            # Salva toda a operação de uma só vez (Transação Segura)
            self.db.commit()
            print(f"🚀 SUCESSO! Injetados: {novos_posts} Novos Posts | {novos_snapshots} Atualizações de Métricas.")
        
        except Exception as e:
            self.db.rollback() # Se der erro, cancela tudo para não corromper o banco
            print(f"❌ Erro ao salvar dados no PostgreSQL: {e}")

if __name__ == "__main__":
    # A sua Chave Oficial do Apify
    MY_APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    
    worker = OrganicScraper(MY_APIFY_TOKEN)
    worker.run()