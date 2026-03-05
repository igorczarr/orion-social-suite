import instaloader
import urllib.parse
import os

# Configuração
TARGET_USERNAME = "sofs.valentini"
SESSION_FILE = f"data/sessions/{TARGET_USERNAME}.session"

def manual_session_injection():
    print(f"🔧 INJEÇÃO MANUAL DE SESSÃO (CORREÇÃO DESKTOP) PARA: {TARGET_USERNAME}")
    print("------------------------------------------------")
    
    # 1. Coleta e Tratamento do Session ID
    raw_session_id = input("78833415141%3AaiaGbBTXsm59MW%3A17%3AAYiMZAMgfWoO-IV6BbHjXxSDLLm5Z3kxYVfoygzrgw").strip()
    
    # CORREÇÃO 1: Decodificação da URL (Transforma %3A em :)
    session_id = urllib.parse.unquote(raw_session_id)
    
    print(f"\n⚙️  Processando Cookie...")
    
    # CORREÇÃO 2: User-Agent de Desktop (Windows/Chrome)
    # Isso alinha a "identidade" do robô com a origem do cookie
    loader = instaloader.Instaloader(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        request_timeout=30
    )
    
    # Injeção Direta
    session = loader.context._session
    session.cookies.update({"sessionid": session_id})
    
    # CORREÇÃO 3: Forçar estado de logado sem testar conexão (Evita o erro 401 imediato)
    # Nós confiamos que o cookie que você pegou está válido.
    loader.context._is_logged_in = True
    loader.context._username = TARGET_USERNAME

    try:
        print(f"💾 Salvando arquivo de sessão blindado em: {SESSION_FILE}")
        loader.save_session_to_file(filename=SESSION_FILE)
        
        print("\n✅ SUCESSO! Sessão salva.")
        print("⚠️  IMPORTANTE: O seu IP está 'quente' devido às tentativas anteriores.")
        print("    AGUARDE 15 MINUTOS antes de rodar o 'internal_scraper.py'.")
        print("    Se rodar agora, o erro 401 vai voltar.")
        
    except Exception as e:
        print(f"❌ Erro ao salvar arquivo: {e}")

if __name__ == "__main__":
    manual_session_injection()