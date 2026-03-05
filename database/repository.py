from datetime import datetime
import sys
import os

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import SessionLocal
from database.models import ProfileHistory, Post, PostSnapshot

class OrionRepository:
    def __init__(self):
        self.session = SessionLocal()

    def save_scraping_results(self, raw_data):
        """Recebe o JSON bruto do Apify e distribui nas tabelas relacionais."""
        if not raw_data:
            print("⚠️ Nenhum dado para salvar no banco.")
            return

        print("💾 Iniciando gravação no Banco de Dados Relacional...")
        
        try:
            # 1. Salvar Histórico do Perfil (Usamos os dados do primeiro post como referência)
            first_item = raw_data[0]
            owner_info = first_item.get('owner', {})
            username = owner_info.get('username', 'desconhecido')
            
            history = ProfileHistory(
                username=username,
                date=datetime.now(),
                followers=owner_info.get('followersCount', 0),
                following=owner_info.get('followsCount', 0),
                posts_count=owner_info.get('postsCount', 0)
            )
            self.session.add(history)
            print(f"   📈 Histórico do perfil '{username}' registrado.")

            # 2. Salvar Posts e Snapshots
            novos_posts = 0
            novos_snapshots = 0

            for item in raw_data:
                shortcode = item.get('shortCode')
                if not shortcode:
                    continue

                # A. Verifica se o post já existe na base (Estático)
                existing_post = self.session.query(Post).filter(Post.shortcode == shortcode).first()
                
                if not existing_post:
                    # Determina o tipo de mídia
                    media_type = item.get('type', 'Image')
                    if item.get('videoUrl'): media_type = 'Reels/Video'
                    
                    # Tenta converter a data do Instagram para formato datetime
                    try:
                        pub_date = datetime.strptime(item.get('timestamp', '')[:19], "%Y-%m-%dT%H:%M:%S")
                    except:
                        pub_date = datetime.now()

                    new_post = Post(
                        shortcode=shortcode,
                        username=item.get('ownerUsername', username),
                        published_at=pub_date,
                        media_type=media_type,
                        caption=item.get('caption', ''),
                        url=item.get('url', '')
                    )
                    self.session.add(new_post)
                    novos_posts += 1

                # B. SEMPRE cria um novo Snapshot (Dinâmico)
                snapshot = PostSnapshot(
                    post_shortcode=shortcode,
                    date=datetime.now(),
                    likes=item.get('likesCount', 0),
                    comments=item.get('commentsCount', 0),
                    views=item.get('videoViewCount', 0)
                )
                self.session.add(snapshot)
                novos_snapshots += 1

            # 3. Confirma a transação (Commit)
            self.session.commit()
            print(f"✅ Sucesso! Inseridos: {novos_posts} novos posts e {novos_snapshots} atualizações de métricas.")

        except Exception as e:
            self.session.rollback() # Se der erro, desfaz tudo para não corromper o banco
            print(f"❌ Erro Crítico ao salvar no banco: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.session.close() # Libera a conexão