import json
import os
import sys
import time
import random
import instaloader

# Ajuste de PATH para encontrar os módulos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from modules.auth.session_manager import SessionManager

class InternalScraper:
    def __init__(self, config_file='config/profiles.json'):
        self.config = self._load_config(config_file)
        self.system_settings = self.config.get('system_settings', {})
        self.clients = self.config.get('clients', [])

    def _load_config(self, filepath):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        full_path = os.path.join(base_dir, filepath)
        
        if not os.path.exists(full_path):
            print(f"❌ Configuração não encontrada: {full_path}")
            sys.exit(1)
            
        with open(full_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def human_delay(self):
        min_d = self.system_settings.get('global_request_delay_min', 5)
        max_d = self.system_settings.get('global_request_delay_max', 12)
        time.sleep(random.uniform(min_d, max_d))

    def process_client(self, client_data):
        """Processa a coleta de UM cliente individualmente."""
        target_username = client_data['username']
        print(f"\n🚀 --- INICIANDO CLIENTE: {target_username} ---")

        # Inicializa Sessão Específica
        # O SessionManager já injeta sessionid E csrftoken (se configurado no JSON)
        session_manager = SessionManager(client_data, self.system_settings)
        loader = session_manager.get_loader()

        try:
            print(f"🔍 Validando acesso a {target_username}...")
            
            # Validação do Cookie e Teste Inicial
            try:
                profile = instaloader.Profile.from_username(loader.context, target_username)
            except instaloader.ConnectionException as e:
                msg = str(e)
                if "401" in msg or "Login required" in msg:
                    print(f"🛑 ACESSO NEGADO para {target_username}. Cookie expirado ou bloqueado.")
                    return None
                elif "403" in msg or "Expecting value" in msg:
                    print(f"🛑 ERRO 403/REDIRECT: Falta CSRF Token ou IP Bloqueado.")
                    print("   Verifique se o 'csrftoken' está correto no profiles.json")
                    return None
                raise e

            print(f"📊 Acesso confirmado! Seguidores: {profile.followers}")
            
            # WARM-UP: Pausa vital antes de pedir a lista de posts (evita o erro 403 imediato)
            print("⏳ Aguardando warm-up de segurança...")
            self.human_delay()

            posts_collected = []
            count = 0
            limit = 20 

            print("📸 Escaneando posts...")
            
            # Iteração protegida contra erros de query
            try:
                for post in profile.get_posts():
                    if count >= limit: break
                    
                    media_type = "Imagem"
                    if post.typename == 'GraphVideo': media_type = "Reels/Video"
                    elif post.typename == 'GraphSidecar': media_type = "Carrossel"

                    post_info = {
                        "id": post.shortcode,
                        "data": post.date_local.strftime("%Y-%m-%d"),
                        "tipo": media_type,
                        "likes": post.likes,
                        "comentarios": post.comments,
                        "views": post.video_view_count if post.is_video else 0,
                        "url": f"https://www.instagram.com/p/{post.shortcode}/"
                    }
                    posts_collected.append(post_info)
                    print(f"   [{count+1}] {post.date_local.strftime('%d/%m')} - {media_type} ({post.likes} likes)")
                    
                    count += 1
                    self.human_delay()
                    
            except instaloader.ConnectionException as e:
                if "Expecting value" in str(e) or "403" in str(e):
                    print("\n🛑 O Instagram bloqueou a listagem de posts (Erro CSRF/Redirect).")
                    print("   DICA: Atualize o 'csrftoken' no JSON e aguarde 15min.")
                else:
                    print(f"❌ Erro de conexão durante o loop: {e}")

            print(f"✅ Finalizado para {target_username}: {len(posts_collected)} posts.")
            return posts_collected

        except Exception as e:
            print(f"❌ Erro ao processar {target_username}: {e}")
            import traceback
            traceback.print_exc()
            return None

    def run_specific(self):
        """Solicita ao usuário qual cliente rodar."""
        print("\n👥 Clientes disponíveis no JSON:")
        for i, client in enumerate(self.clients):
            status = "✅" if client.get('active') else "⏸️"
            print(f"   {i+1}. {client['username']} ({status})")

        target_input = input("\n⌨️  Digite o username exato do cliente que deseja capturar: ").strip()

        # Busca o cliente na lista
        found_client = None
        for client in self.clients:
            if client['username'] == target_input:
                found_client = client
                break
        
        if found_client:
            self.process_client(found_client)
        else:
            print(f"❌ Erro: O cliente '{target_input}' não foi encontrado no arquivo profiles.json.")

if __name__ == "__main__":
    app = InternalScraper()
    # Chama o método que pede input do usuário
    app.run_specific()