import sys
import os
from datetime import datetime
from apify_client import ApifyClient

# Ajuste de PATH para garantir que o Python encontre as pastas raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import TrackedProfile, ProfileHistory, Post, PostSnapshot

class OrionWorker:
    def __init__(self, apify_token):
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()

    def get_active_profiles(self):
        """Busca no Banco de Dados a lista de perfis que o sistema deve rastrear."""
        return self.db.query(TrackedProfile).filter(TrackedProfile.is_active == True).all()

    def run(self):
        """Orquestra a coleta completa."""
        print("\n⚙️ --- INICIANDO WORKER AUTÔNOMO ORION ---")
        profiles = self.get_active_profiles()
        
        if not profiles:
            print("⚠️ Nenhum perfil ativo encontrado na base de dados (Sala de Comando vazia).")
            self.db.close()
            return

        # LIMPEZA CRÍTICA: Remove o '@' dos usernames para evitar falhas no Apify
        usernames = [p.username.replace('@', '').strip() for p in profiles]
        print(f"🎯 Alvos identificados ({len(usernames)}): {usernames}")

        # Prepara a missão para o Apify (Usando o scraper de perfil)
        run_input = {
            "usernames": usernames,
            "resultsLimit": 30, # Pega até 30 posts por perfil
        }

        print("⏳ Enviando missão para a nuvem (Apify) - Extraindo histórico profundo...")
        try:
            actor_run = self.apify_client.actor("apify/instagram-profile-scraper").call(run_input=run_input)
            dataset_items = self.apify_client.dataset(actor_run["defaultDatasetId"]).list_items().items
            print(f"✅ Download concluído! {len(dataset_items)} perfis capturados.")
            
            # Envia para o cérebro processar e salvar
            self.process_and_save(dataset_items)
            
        except Exception as e:
            print(f"❌ Erro fatal na comunicação com o Apify: {e}")
        finally:
            self.db.close()
            print("🔒 Conexão com o banco encerrada. Worker finalizado.")

    def process_and_save(self, items):
        """Injeta a inteligência e salva no Banco de Dados (Lendo o formato aninhado)."""
        print("💾 Processando dados e salvando no Banco Relacional...")
        novos_posts = 0
        novos_snapshots = 0

        try:
            for profile in items:
                # 1. Dados do dono do perfil vêm na raiz do objeto agora
                username = profile.get('username')
                
                if not username:
                    continue
                
                # Salvar Histórico Diário do Perfil
                history = ProfileHistory(
                    username=username,
                    date=datetime.now(),
                    followers=profile.get('followersCount', 0),
                    following=profile.get('followsCount', 0),
                    posts_count=profile.get('postsCount', 0)
                )
                self.db.add(history)
                print(f"   📈 Check-in de seguidores para '{username}' registrado: {profile.get('followersCount', 0)} seg.")

                # 2. Puxar os posts (que agora vêm dentro de 'latestPosts')
                latest_posts = profile.get('latestPosts', [])
                
                for item in latest_posts:
                    shortcode = item.get('shortCode')
                    if not shortcode:
                        continue
                    
                    # Salvar Post Estático (Se for novidade)
                    post = self.db.query(Post).filter(Post.shortcode == shortcode).first()
                    if not post:
                        media_type = 'Reels/Video' if item.get('type') == 'Video' else item.get('type', 'Image')
                        
                        try:
                            pub_date = datetime.strptime(item.get('timestamp', '')[:19], "%Y-%m-%dT%H:%M:%S")
                        except:
                            pub_date = datetime.now()

                        post = Post(
                            shortcode=shortcode,
                            username=username,
                            published_at=pub_date,
                            media_type=media_type,
                            caption=item.get('caption', ''),
                            url=item.get('url', f"https://www.instagram.com/p/{shortcode}/")
                        )
                        self.db.add(post)
                        novos_posts += 1

                    # 3. Criar Snapshot de Desempenho (Radar Contínuo)
                    likes = item.get('likesCount', 0)
                    comments = item.get('commentsCount', 0)
                    views = item.get('videoViewCount', 0)
                    
                    snapshot = PostSnapshot(
                        post_shortcode=shortcode,
                        date=datetime.now(),
                        likes=likes,
                        comments=comments,
                        views=views
                    )
                    self.db.add(snapshot)
                    novos_snapshots += 1

            # Grava tudo de uma vez com segurança
            self.db.commit()
            print(f"🚀 SUCESSO ABSOLUTO! O Banco da VÉRTICE recebeu: {novos_posts} novos posts e {novos_snapshots} atualizações de métricas.")
        
        except Exception as e:
            self.db.rollback() 
            print(f"❌ Erro ao salvar no banco: {e}")

if __name__ == "__main__":
    # O SEU TOKEN DO APIFY
    MY_APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    
    worker = OrionWorker(MY_APIFY_TOKEN)
    worker.run()