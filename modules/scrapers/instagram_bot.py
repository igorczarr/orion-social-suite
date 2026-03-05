import instaloader
import pandas as pd
import time
import random
from datetime import datetime

class OrionBot:
    """
    Classe responsável por interagir com o Instagram.
    Ela encapsula a complexidade do 'Instaloader' e aplica as regras de negócio do Orion.
    """

    def __init__(self, username=None, password=None):
        """
        Inicializa o robô.
        Se username e password forem fornecidos, tenta fazer login (necessário para mais dados).
        Caso contrário, opera em modo anônimo (apenas dados públicos limitados).
        """
        self.loader = instaloader.Instaloader()
        
        # Configurações para evitar detecção (User Agent genérico)
        # Em um cenário real avançado, usaríamos proxies aqui.
        self.is_logged_in = False

        if username and password:
            self.login(username, password)

    def login(self, username, password):
        """Realiza o login de forma segura."""
        print(f"🔐 Tentando login como {username}...")
        try:
            self.loader.login(username, password)
            self.is_logged_in = True
            print(f"✅ Login realizado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao logar: {e}")
            print("⚠️ O Bot continuará em modo anônimo (dados limitados).")

    def get_profile_info(self, target_username):
        """Coleta dados gerais do perfil (Seguidores, Bio, etc)."""
        print(f"🔍 Analisando perfil: {target_username}...")
        try:
            profile = instaloader.Profile.from_username(self.loader.context, target_username)
            
            data = {
                "username": profile.username,
                "followers": profile.followers,
                "followees": profile.followees, # Quem ele segue
                "biography": profile.biography,
                "is_verified": profile.is_verified,
                "external_url": profile.external_url,
                "mediacount": profile.mediacount, # Total de posts
                "coleta_em": datetime.now()
            }
            return data
        except Exception as e:
            print(f"❌ Erro ao acessar perfil {target_username}: {e}")
            return None

    def get_last_posts(self, target_username, limit=10):
        """
        Coleta os últimos X posts do perfil.
        Discrimina: Carrossel vs Estático vs Reels.
        """
        print(f"📸 Baixando os últimos {limit} posts de {target_username}...")
        
        try:
            profile = instaloader.Profile.from_username(self.loader.context, target_username)
            posts_data = []
            
            # Itera sobre os posts do perfil
            for index, post in enumerate(profile.get_posts()):
                if index >= limit:
                    break # Para quando atingir o limite
                
                # Identificação do Tipo de Conteúdo (Lógica Vanguardista)
                post_type = "Estatico"
                if post.typename == 'GraphVideo':
                    post_type = "Reels/Video"
                elif post.typename == 'GraphSidecar':
                    post_type = "Carrossel"

                # Cálculo básico de Engajamento (Likes + Comentários)
                engagement = post.likes + post.comments
                
                post_info = {
                    "id": post.shortcode, # Código único do post (ex: Cj8x9...)
                    "date": post.date_local,
                    "type": post_type,
                    "likes": post.likes,
                    "comments": post.comments,
                    "views": post.video_view_count if post.is_video else 0, # Só pega views se for vídeo
                    "engagement_abs": engagement,
                    "caption": post.caption, # A legenda (importante para IA depois)
                    "url": f"https://www.instagram.com/p/{post.shortcode}/"
                }
                
                posts_data.append(post_info)
                
                # 🛑 PAUSA ESTRATÉGICA (Delay)
                # Sênior Tip: O Instagram bloqueia se for muito rápido.
                # Dormimos entre 2 a 5 segundos aleatoriamente entre cada post.
                sleep_time = random.uniform(2, 5)
                print(f"   Using delay: {sleep_time:.2f}s | Post {index+1}/{limit} capturado.")
                time.sleep(sleep_time)

            return posts_data

        except Exception as e:
            print(f"❌ Erro ao coletar posts: {e}")
            return []

# --- ÁREA DE TESTE (Só roda se você executar este arquivo diretamente) ---
if __name__ == "__main__":
    # Instancia o bot (sem login por enquanto para teste seguro)
    bot = OrionBot() 
    
    # Defina um perfil público para teste (ex: 'instagram', 'nasa', ou o seu)
    perfil_alvo = "nasa" 
    
    # 1. Pega infos do perfil
    info = bot.get_profile_info(perfil_alvo)
    print("\n--- DADOS DO PERFIL ---")
    print(info)

    # 2. Pega últimos 5 posts
    posts = bot.get_last_posts(perfil_alvo, limit=5)
    
    # 3. Mostra resultado bonitinho usando Pandas
    if posts:
        df = pd.DataFrame(posts)
        print("\n--- RELATÓRIO DE POSTS (PREVIEW) ---")
        # Mostra apenas colunas principais para caber na tela
        print(df[['date', 'type', 'likes', 'comments', 'views']].to_string())
    else:
        print("Nenhum post coletado.")