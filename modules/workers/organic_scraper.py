# modules/workers/organic_scraper.py
import sys
import os
import re
from datetime import datetime, timezone
from apify_client import ApifyClient
from dotenv import load_dotenv

# Ajuste de PATH para garantir que o Python encontre a raiz do projeto (models e connection)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import TrackedProfile, ProfileHistory, Post, PostSnapshot

class OrganicScraper:
    def __init__(self, apify_token: str):
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()

    def clean_db_username(self, name: str) -> str:
        """[SÊNIOR] Limpeza Universal para match perfeito no Banco de Dados."""
        if not name: return ""
        cleaned = name.replace('https://www.instagram.com/', '').replace('https://instagram.com/', '').replace('@', '').replace('/', '').strip().lower()
        return re.sub(r'[^a-zA-Z0-9_.-]', '', cleaned)

    def get_active_profiles(self):
        """Busca no Banco de Dados a lista de TODOS os perfis ativos."""
        return self.db.query(TrackedProfile).filter(TrackedProfile.is_active == True).all()

    def run(self):
        """Orquestra a coleta massiva usando a Nuvem."""
        print("\n⚙️ --- INICIANDO WORKER 1: RASTREADOR ORGÂNICO (APIFY) ---")
        
        profiles = self.get_active_profiles()
        
        if not profiles:
            print("⚠️ Nenhum perfil ativo encontrado na base de dados.")
            self.db.close()
            return

        # Limpeza blindada dos alvos
        usernames = list(set([self.clean_db_username(p.username) for p in profiles if p.username]))
        print(f"🎯 Alvos identificados no Cofre ({len(usernames)}): {usernames}")

        direct_urls = [f"https://www.instagram.com/{u}/" for u in usernames]
        
        run_input = {
            "directUrls": direct_urls,
            "resultsType": "posts",
            "resultsLimit": 30, # CORREÇÃO: Aumentado para 30 para dar inteligência à IA
            "proxy": {
                "useApifyProxy": True, 
                "apifyProxyGroups": ["RESIDENTIAL"] 
            }
        }

        print("⏳ Disparando satélites (Apify)... Isso pode levar de 1 a 3 minutos.")
        
        try:
            actor_run = self.apify_client.actor("shu8hvrXbJbY3Eb9W").call(run_input=run_input)
            dataset_items = self.apify_client.dataset(actor_run["defaultDatasetId"]).list_items().items
            
            print(f"✅ Download da nuvem concluído! {len(dataset_items)} itens capturados.")
            self.process_and_save(dataset_items, profiles)
            
        except Exception as e:
            print(f"❌ Erro fatal na comunicação com o Apify: {e}")
        finally:
            self.db.close()
            print("🔒 Conexão com o banco de dados encerrada.")

    def process_and_save(self, items, db_profiles):
        print("💾 Injetando dados no Banco Relacional (PostgreSQL)...")
        
        novos_posts = 0
        novos_snapshots = 0
        processed_profiles = set()

        try:
            for item in items:
                shortcode = item.get('shortCode')
                raw_username = item.get('ownerUsername')
                
                if not shortcode or not raw_username:
                    continue
                
                # CORREÇÃO: O username que vai pro banco SEMPRE será limpo
                username_limpo = self.clean_db_username(raw_username)
                
                # Encontra o perfil original para atualizar a data de raspagem
                db_profile = next((p for p in db_profiles if self.clean_db_username(p.username) == username_limpo), None)
                
                # 1. Salvar KPIs do Perfil
                if username_limpo not in processed_profiles:
                    owner = item.get('owner', {})
                    history = ProfileHistory(
                        username=username_limpo,
                        date=datetime.now(timezone.utc), # CORREÇÃO: UTC universal
                        followers=owner.get('followersCount', 0) or 0,
                        following=owner.get('followsCount', 0) or 0,
                        posts_count=owner.get('postsCount', 0) or 0
                    )
                    self.db.add(history)
                    processed_profiles.add(username_limpo)
                    
                    if db_profile:
                        db_profile.last_scraped_at = datetime.now(timezone.utc)

                # 2. Salvar o Post Físico
                post_existente = self.db.query(Post).filter(Post.shortcode == shortcode).first()
                
                if not post_existente:
                    media_type = 'Reels/Video' if item.get('videoUrl') else item.get('type', 'Imagem')
                    
                    try:
                        pub_date_str = item.get('timestamp', '')[:19]
                        pub_date = datetime.strptime(pub_date_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
                    except:
                        pub_date = datetime.now(timezone.utc)

                    # CORREÇÃO: Limpa a legenda de hashtags poluidoras
                    raw_caption = item.get('caption', '')
                    clean_caption = raw_caption.split('#')[0].strip() if '#' in raw_caption and raw_caption.index('#') > len(raw_caption)/2 else raw_caption

                    novo_post = Post(
                        shortcode=shortcode,
                        username=username_limpo,
                        published_at=pub_date,
                        media_type=media_type,
                        caption=clean_caption,
                        url=item.get('url', f"https://instagram.com/p/{shortcode}")
                    )
                    self.db.add(novo_post)
                    self.db.flush() # Informa o banco antes do snapshot
                    novos_posts += 1

                # 3. Criar o Snapshot de Desempenho
                snapshot = PostSnapshot(
                    post_shortcode=shortcode,
                    date=datetime.now(timezone.utc),
                    likes=item.get('likesCount', 0) or 0,
                    comments=item.get('commentsCount', 0) or 0,
                    views=item.get('videoViewCount', 0) or 0,
                    saves=0
                )
                self.db.add(snapshot)
                novos_snapshots += 1

            self.db.commit()
            print(f"🚀 SUCESSO! Injetados: {novos_posts} Novos Posts | {novos_snapshots} Atualizações de Métricas.")
        
        except Exception as e:
            self.db.rollback() 
            print(f"❌ Erro ao salvar dados no PostgreSQL: {e}")

if __name__ == "__main__":
    load_dotenv()
    MY_APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    if MY_APIFY_TOKEN:
        worker = OrganicScraper(MY_APIFY_TOKEN)
        worker.run()
    else:
        print("❌ Operação abortada: Chave APIFY_TOKEN não foi detectada no ambiente.")