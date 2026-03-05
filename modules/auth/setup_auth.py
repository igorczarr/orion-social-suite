import instaloader
import browser_cookie3
import os
import sys

# Configuração do Usuário Alvo
TARGET_USERNAME = "sofs.valentini"  # <--- CONFIRME SE O USUÁRIO ESTÁ CERTO
SESSION_FILE = f"data/sessions/{TARGET_USERNAME}.session"

def setup_session_from_browser():
    print(f"🔧 INICIANDO EXTRAÇÃO DE SESSÃO PARA: {TARGET_USERNAME}")
    print("------------------------------------------------")
    print("⚠️  IMPORTANTE: Para isso funcionar, você deve estar logado no Instagram")
    print("    pelo navegador (Chrome, Edge ou Firefox) neste computador.")
    print("⚠️  DICA: Se usar Chrome/Edge, FECHE O NAVEGADOR COMPLETAMENTE antes de continuar")
    print("    (O banco de dados de cookies fica travado se o navegador estiver aberto).")
    print("------------------------------------------------")
    
    input("Pressione ENTER quando estiver pronto (Navegador fechado e logado anteriormente)...")

    loader = instaloader.Instaloader()
    
    cookies = None
    browser_name = ""

    # Tenta extrair de diferentes navegadores
    try:
        print("🦊 Tentando Firefox...")
        cookies = browser_cookie3.firefox(domain_name='.instagram.com')
        browser_name = "Firefox"
    except:
        try:
            print("⚪ Tentando Chrome (Pode falhar se estiver aberto)...")
            cookies = browser_cookie3.chrome(domain_name='.instagram.com')
            browser_name = "Chrome"
        except:
            try:
                print("🔵 Tentando Edge...")
                cookies = browser_cookie3.edge(domain_name='.instagram.com')
                browser_name = "Edge"
            except Exception as e:
                print(f"❌ Não foi possível extrair cookies automaticamente: {e}")
                return False

    if not cookies:
        print("❌ Nenhum cookie do Instagram encontrado. Você logou no navegador?")
        return False

    # Injeta os cookies no Instaloader
    print(f"✅ Cookies encontrados no {browser_name}!")
    
    # Configura a sessão do requests dentro do instaloader
    loader.context._session.cookies = cookies
    
    # Verifica se realmente estamos logados
    try:
        print("📡 Testando validade da sessão...")
        username = loader.test_login()
        if not username:
            print("❌ Os cookies existem, mas não estão autenticados. Faça login no navegador novamente.")
            return False
            
        print(f"🎉 SUCESSO! Logado como: {username}")
        
        # Salva o arquivo .session oficial
        loader.save_session_to_file(filename=SESSION_FILE)
        print(f"💾 Arquivo de sessão gerado em: {SESSION_FILE}")
        print("Agora você pode rodar o 'internal_scraper.py' sem pedir senha.")
        return True

    except Exception as e:
        print(f"❌ Erro ao validar sessão: {e}")
        return False

if __name__ == "__main__":
    setup_session_from_browser()