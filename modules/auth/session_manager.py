import instaloader
import sys
import urllib.parse

class SessionManager:
    """
    Gerencia a sessão de UM cliente específico.
    Recebe os dados do cliente (dicionário) e configura o Instaloader.
    """
    def __init__(self, client_data, system_settings):
        self.username = client_data['username']
        self.auth_data = client_data['auth']
        
        # Define o User-Agent: Usa o do sistema ou um padrão se não houver
        user_agent = system_settings.get('user_agent_default', 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Inicializa Instaloader com configurações robustas
        self.loader = instaloader.Instaloader(
            user_agent=user_agent,
            request_timeout=30,
            max_connection_attempts=3,
            sleep=True
        )

    def get_loader(self):
        """
        Configura a sessão injetando o cookie vindo do JSON.
        """
        session_id = self.auth_data.get('sessionid')
        
        if not session_id or session_id == "COLE_O_SESSION_ID_AQUI_DO_NAVEGADOR":
            print(f"❌ [ERRO CRÍTICO] SessionID não configurado para {self.username}.")
            print("   Edite o arquivo config/profiles.json e cole o cookie correto.")
            sys.exit(1)

        # Tratamento: Decodifica URL se necessário
        if "%" in session_id:
            session_id = urllib.parse.unquote(session_id)

        try:
            # Injeta o cookie na memória
            self.loader.context._session.cookies.update({"sessionid": session_id})
            
            # Força o status de logado
            self.loader.context._is_logged_in = True
            self.loader.context._username = self.username
            
            return self.loader
            
        except Exception as e:
            print(f"❌ Falha ao configurar sessão para {self.username}: {e}")
            sys.exit(1)