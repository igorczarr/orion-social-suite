# modules/ingestion/worker_social.py
import sys
import os
import time
import re
import json
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError
from apify_client import ApifyClient

# Ajuste de PATH para garantir importações a partir da raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import TrackedProfile, ProfileHistory, Post, PostSnapshot
from config.settings import settings
from modules.core.key_manager import apify_balancer

class SocialSurfaceTracker:
    """
    ESQUADRÃO DE TELEMETRIA E ESPIONAGEM (O Olho Que Tudo Vê).
    Atua nos 3 Mercados (BR, US, EU). Extração tática de mídia, parcerias e copy.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.ig_actor = settings.ApifyActors.IG_PROFILE 

    def _get_client(self) -> ApifyClient:
        key = apify_balancer.get_healthy_key()
        if not key:
            raise Exception("🛑 [CRÍTICO] Sistema Cego: Nenhuma chave Apify disponível no Cofre.")
        return ApifyClient(key)

    def clean_username(self, name: str) -> str:
        """Sanitização militar de identificadores."""
        if not name: return ""
        cleaned = name.replace('https://www.instagram.com/', '') \
                      .replace('https://instagram.com/', '') \
                      .replace('@', '').replace('/', '').strip().lower()
        return re.sub(r'[^a-zA-Z0-9_.-]', '', cleaned)

    def extract_spy_metadata(self, caption: str) -> dict:
        """
        [SÊNIOR] Antes de limpar a legenda, o espião extrai a inteligência bruta:
        Quem o concorrente mencionou (Parcerias) e quais Hashtags usou (SEO).
        """
        if not caption: return {"hashtags": [], "mentions": []}
        hashtags = re.findall(r'#\w+', caption)
        mentions = re.findall(r'@\w+', caption)
        return {"hashtags": hashtags, "mentions": mentions}

    def clean_caption(self, caption: str) -> str:
        """Purifica o texto para o nosso LLM ler apenas a arte do Copywriting."""
        if not caption: return ""
        # Removemos os blocos massivos de hashtags no final
        if '#' in caption and caption.index('#') > len(caption) / 2:
            return caption.split('#')[0].strip()
        return caption.strip()

    def sync_network(self, platform: str = "instagram", tenant_id: int = None):
        print(f"\n🛰️ [ESPIONAGEM GLOBAL] Iniciando satélite sobre a rede: {platform.upper()}...")
        
        query = self.db.query(TrackedProfile).filter(TrackedProfile.is_active == True)
        if tenant_id:
            query = query.filter(TrackedProfile.tenant_id == tenant_id)
            
        profiles = query.all()
        if not profiles:
            print(" ⚠️ Nenhum alvo detetado no radar de telemetria.")
            return

        usernames = list(set([self.clean_username(p.username) for p in profiles if p.username]))
        print(f" 🎯 Mira trancada em {len(usernames)} alvos estratégicos.")

        client = self._get_client()

        # Configuração: 30 posts garante um mapa mensal completo do comportamento inimigo
        run_input = {
            "usernames": usernames,
            "resultsType": "details", 
            "resultsLimit": 30, 
        }

        try:
            print(" ⏳ Quebrando a criptografia da rede... Extraindo metadados.")
            run = client.actor(self.ig_actor).call(run_input=run_input)
            dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items
            
            print(f" ✅ Payload Interceptado! ({len(dataset_items)} perfis). Iniciando Decodificação ETL.")
            self._process_and_load(dataset_items)
            
        except Exception as e:
            if "429" in str(e):
                apify_balancer.burn_key(client.token)
                print(" 🔥 [EVASÃO] Rate Limit detetado. Chave obliterada. Rotação automática no próximo ciclo.")
            else:
                print(f" ❌ Erro Crítico de Extração: {e}")
        finally:
            self.db.close()

    def _process_and_load(self, items: list):
        now_utc = datetime.now(timezone.utc)
        perfis_atualizados = 0
        posts_novos = 0
        snapshots_gravados = 0

        for data in items:
            raw_username = data.get('username')
            if not raw_username: continue
            
            username = self.clean_username(raw_username)
            followers = data.get('followersCount', 0) or 0
            following = data.get('followsCount', 0) or 0
            posts_count = data.get('postsCount', 0) or 0
            
            # --- INTELIGÊNCIA DO ALVO ---
            bio = data.get('biography', '')
            bio_link = data.get('externalUrl', '')
            is_business = data.get('isBusinessAccount', False)
            biz_category = data.get('businessCategoryName', 'N/A')
            
            print(f"  👤 Alvo: @{username} | Categoria: {biz_category} | Seguidores: {followers:,} | Link Ativo: {bio_link or 'Nenhum'}")

            # --- HISTÓRICO DE CRESCIMENTO ---
            history = ProfileHistory(
                username=username,
                date=now_utc,
                followers=followers,
                following=following,
                posts_count=posts_count
            )
            self.db.add(history)
            perfis_atualizados += 1

            # --- PROCESSAMENTO DE POSTS E METADADOS ESPIÕES ---
            latest_posts = data.get('latestPosts', [])
            
            for item in latest_posts:
                shortcode = item.get('shortCode')
                if not shortcode: continue

                # Classificação de Mídia e Extração de URL para o Dashboard (Hotlinking)
                item_type = item.get('type', 'Image')
                media_type = 'Video/Reels' if item_type == 'Video' else 'Carrossel' if item_type == 'Sidecar' else 'Foto'
                media_url = item.get('videoUrl') if item_type == 'Video' else item.get('displayUrl', '')
                
                # Mapeamento Geográfico (Onde o concorrente está a focar)
                location = item.get('locationName', 'Global')
                
                # Inteligência de Texto
                raw_caption = item.get('caption', '')
                spy_data = self.extract_spy_metadata(raw_caption)
                spy_data['location'] = location
                spy_data['media_url'] = media_url  # Guardamos no JSON para não quebrar a estrutura do banco

                try:
                    pub_date_str = item.get('timestamp', '')[:19]
                    pub_date = datetime.strptime(pub_date_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
                except ValueError:
                    pub_date = now_utc

                # A. Garante a existência do Post (Idempotência)
                post = self.db.query(Post).filter(Post.shortcode == shortcode).first()
                if not post:
                    clean_cap = self.clean_caption(raw_caption)
                    post = Post(
                        shortcode=shortcode,
                        username=username,
                        published_at=pub_date,
                        media_type=media_type,
                        caption=clean_cap,
                        url=item.get('url', f"https://www.instagram.com/p/{shortcode}/"),
                        hook_strategy=json.dumps(spy_data) # Ocultamos a inteligência espiã e a Media URL aqui
                    )
                    self.db.add(post)
                    self.db.flush() 
                    posts_novos += 1

                # B. Cálculo Tático de KPIs
                likes = item.get('likesCount', 0) or 0
                comments = item.get('commentsCount', 0) or 0
                views = item.get('videoViewCount', 0) or 0
                
                estimated_saves = int(likes * 0.15) 
                er = round(((likes + comments) / followers) * 100, 2) if followers > 0 else 0.0

                # C. Fotografia de Tração Atual
                snapshot = PostSnapshot(
                    post_shortcode=shortcode,
                    date=now_utc,
                    likes=likes,
                    comments=comments,
                    views=views,
                    saves=estimated_saves,
                    engagement_rate=er
                )
                self.db.add(snapshot)
                snapshots_gravados += 1

        try:
            self.db.commit()
            print("\n📊 ================== RELATÓRIO DE OPERAÇÃO ==================")
            print(f" 📈 Contas Rastreadas: {perfis_atualizados}")
            print(f" 📝 Copys/Mídias Interceptadas: {posts_novos}")
            print(f" 📸 Medições de Tração Salvas: {snapshots_gravados}")
            print("==============================================================")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"❌ [CRÍTICO] A transação no banco de dados falhou: {e}")

if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = SocialSurfaceTracker()
    worker.sync_network()