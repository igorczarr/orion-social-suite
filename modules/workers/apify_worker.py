import sys
import os
import time
from datetime import datetime, timezone
from apify_client import ApifyClient
from dotenv import load_dotenv

# Ajuste de PATH para garantir que o Python encontre as pastas raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import TrackedProfile, ProfileHistory, Post, PostSnapshot

class OrionWorker:
    def __init__(self, apify_token: str):
        if not apify_token:
            raise ValueError("APIFY_TOKEN ausente. O rastreamento não pode iniciar.")
        self.apify_client = ApifyClient(apify_token)
        self.db = SessionLocal()

    def clean_user(self, name: str) -> str:
        """
        [SÊNIOR] Normalização de Dados:
        Remove arrobas, links e espaços para garantir o match perfeito no Dashboard.
        """
        if not name: return ""
        return name.replace('https://www.instagram.com/', '') \
                   .replace('https://instagram.com/', '') \
                   .replace('@', '') \
                   .replace('/', '') \
                   .strip().lower()

    def run(self, target_tenant_id=None):
        """Orquestra a coleta de inteligência em profundidade."""
        print("\n⚙️ --- INICIANDO WORKER AUTÔNOMO ORION (MODO SÊNIOR) ---")
        
        # Filtragem Tática: Define se varre a base toda (Madrugada) ou apenas um cliente (Botão do Dashboard)
        query = self.db.query(TrackedProfile).filter(TrackedProfile.is_active == True)
        if target_tenant_id:
            query = query.filter(TrackedProfile.tenant_id == target_tenant_id)
            print(f"🎯 [FOCO] Rastreador direcionado exclusivamente para o Tenant ID: {target_tenant_id}")
            
        profiles = query.all()
        
        if not profiles:
            print("⚠️ Operação cancelada: Nenhum perfil ativo encontrado na base de dados para este escopo.")
            self.db.close()
            return

        # Limpeza e Deduplicação dos alvos (Usa a função Sênior)
        usernames = list(set([self.clean_user(p.username) for p in profiles if p.username]))
        print(f"🎯 Alvos validados e limpos ({len(usernames)}): {usernames}")

        # Configuração Estratégica do Scraper
        run_input = {
            "usernames": usernames,
            "resultsType": "details", # FORÇA o Apify a trazer os dados completos do perfil
            "resultsLimit": 30, # Profundidade ideal para capturar o último mês
        }

        print("⏳ Infiltrando servidores da Meta via Apify. Isso pode levar alguns minutos...")
        
        try:
            # Chama o Ator Sênior da Apify
            actor_run = self.apify_client.actor("apify/instagram-profile-scraper").call(run_input=run_input)
            
            print("✅ Missão concluída. Baixando Payload de Inteligência...")
            dataset_items = self.apify_client.dataset(actor_run["defaultDatasetId"]).list_items().items
            
            self.process_and_save(dataset_items)
            
        except Exception as e:
            print(f"❌ Falha Crítica de Conexão com Apify: {e}")
        finally:
            self.db.close()
            print("🔒 Conexões encerradas. Cérebro de volta ao repouso.")

    def process_and_save(self, items: list):
        """Processamento de Dados e Triagem Sênior (Rich Media)."""
        print("💾 Iniciando Triagem e Gravação no Cofre (Banco Relacional)...")
        novos_posts = 0
        novos_snapshots = 0
        alvos_atualizados = 0

        try:
            for profile in items:
                raw_username = profile.get('username')
                if not raw_username:
                    continue
                
                # Normaliza o username recebido do Apify para alinhar com o nosso banco
                username = self.clean_user(raw_username)
                
                # 1. Snapshot Diário de KPIs do Perfil
                history = ProfileHistory(
                    username=username,
                    date=datetime.now(timezone.utc),
                    followers=profile.get('followersCount', 0) or 0,
                    following=profile.get('followsCount', 0) or 0,
                    posts_count=profile.get('postsCount', 0) or 0
                )
                self.db.add(history)
                alvos_atualizados += 1
                print(f"  📈 KPI Atualizado | @{username}: {history.followers} seguidores.")

                # 2. Mapeamento Profundo do Conteúdo (Rich Media)
                latest_posts = profile.get('latestPosts', [])
                
                for item in latest_posts:
                    shortcode = item.get('shortCode')
                    if not shortcode:
                        continue
                    
                    # Tenta extrair a data real (Tratamento de Exceção)
                    try:
                        timestamp_str = item.get('timestamp', '')[:19]
                        pub_date = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S")
                    except ValueError:
                        pub_date = datetime.now(timezone.utc)

                    # Classificação Estrita de Formato
                    item_type = item.get('type', 'Image')
                    media_type = 'Video/Reels' if item_type == 'Video' else 'Carrossel' if item_type == 'Sidecar' else 'Foto'
                    
                    # Recupera a Mídia Real para a UI da Arena
                    display_url = item.get('displayUrl') or item.get('videoUrl') or ''
                    raw_caption = item.get('caption') or ''
                    
                    # Limpa a legenda para guardar apenas a "Copy" real (remove enxame de hashtags)
                    clean_caption = raw_caption.split('#')[0].strip() if '#' in raw_caption and raw_caption.index('#') > len(raw_caption)/2 else raw_caption

                    # Grava o Post (Se for Inédito)
                    post = self.db.query(Post).filter(Post.shortcode == shortcode).first()
                    if not post:
                        post = Post(
                            shortcode=shortcode,
                            username=username, # Salva o username limpo!
                            published_at=pub_date,
                            media_type=media_type,
                            caption=clean_caption,
                            url=item.get('url', f"https://www.instagram.com/p/{shortcode}/")
                        )
                        self.db.add(post)
                        # Flush avisa o banco da existência deste post antes de salvar o Snapshot associado
                        self.db.flush() 
                        novos_posts += 1

                    # 3. Snapshot de Tração (Radar Contínuo)
                    snapshot = PostSnapshot(
                        post_shortcode=shortcode,
                        date=datetime.now(timezone.utc),
                        likes=item.get('likesCount', 0) or 0,
                        comments=item.get('commentsCount', 0) or 0,
                        views=item.get('videoViewCount', 0) or 0
                    )
                    self.db.add(snapshot)
                    novos_snapshots += 1

            # Comita tudo em uma única transação limpa
            self.db.commit()
            print("\n============================================================")
            print(f"🏆 SUCESSO DE INTELIGÊNCIA:")
            print(f"   • {alvos_atualizados} Perfis Monitorados")
            print(f"   • {novos_posts} Novos Conteúdos Estratégicos")
            print(f"   • {novos_snapshots} Atualizações de Tração")
            print("============================================================")
        
        except Exception as e:
            self.db.rollback() 
            print(f"\n❌ ERRO FATAL de Banco de Dados: Revertendo alterações. Motivo: {e}")

if __name__ == "__main__":
    # Carrega as chaves do cofre (.env)
    load_dotenv()
    
    API_KEY = os.getenv("APIFY_TOKEN")
    
    if API_KEY:
        worker = OrionWorker(API_KEY)
        worker.run()
    else:
        print("❌ Operação abortada: Chave APIFY_TOKEN não foi detectada no ambiente.")