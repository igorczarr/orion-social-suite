# modules/workers/worker_vortex.py
import time
import random
from instagrapi import Client

class GhostOperator:
    """
    O MOTOR FANTASMA (Automação Furtiva).
    Entra no Instagram usando o Session Cookie (sem senha) e age como um humano.
    """
    def __init__(self, session_id: str):
        self.cl = Client()
        self.cl.delay_range = [3, 7] # Jitter humanizado: Atraso aleatório entre ações
        
        # O Pulo do Gato: Injetar o cookie de sessão burla a tela de login e o 2FA
        self.cl.login_by_sessionid(session_id)

    def execute_engagement(self, target_username: str, comment_text: str = None) -> bool:
        """Curte o último post do alvo e deixa um comentário tático."""
        try:
            print(f"🥷 [VORTEX] Infiltrando no perfil: @{target_username}...")
            
            # 1. Puxa o ID do usuário
            user_id = self.cl.user_id_from_username(target_username)
            
            # 2. Puxa os últimos 3 posts do alvo
            medias = self.cl.user_medias(user_id, amount=3)
            if not medias:
                print(f"⚠️ [VORTEX] @{target_username} não tem posts. Abortando.")
                return False

            # Foca no post mais recente
            target_post = medias[0]
            
            # 3. Interação 1: Curtir (Like)
            print(f"   ❤️ Curtindo post: {target_post.id}")
            self.cl.media_like(target_post.id)
            time.sleep(random.uniform(2.5, 5.5)) # Pausa para respirar (burlar anti-bot)

            # 4. Interação 2: Comentar (Copy da IA)
            if comment_text:
                print(f"   💬 Comentando: '{comment_text}'")
                self.cl.media_comment(target_post.id, comment_text)
                
            return True
        except Exception as e:
            print(f"❌ [VORTEX CRASH] O algoritmo do Instagram bloqueou a ação: {e}")
            return False