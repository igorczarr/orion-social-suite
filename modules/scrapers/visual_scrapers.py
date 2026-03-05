import json
import os
import time
import random
from playwright.sync_api import sync_playwright

class VisualScraper:
    def __init__(self, config_file='config/profiles.json'):
        self.config = self._load_config(config_file)
        self.clients = self.config.get('clients', [])
        # Configurações globais
        self.headless = self.config.get('system_settings', {}).get('headless_mode', False)
        
    def _load_config(self, filepath):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        full_path = os.path.join(base_dir, filepath)
        with open(full_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def human_delay(self, min_s=2, max_s=5):
        time.sleep(random.uniform(min_s, max_s))

    def run_specific(self):
        """Menu para selecionar o cliente."""
        print("\n👥 Clientes Visual Scraper:")
        for i, client in enumerate(self.clients):
            print(f"   {i+1}. {client['username']}")

        target_input = input("\n⌨️  Digite o username exato: ").strip()
        
        found_client = next((c for c in self.clients if c['username'] == target_input), None)
        if found_client:
            self.start_scraping(found_client)
        else:
            print("❌ Cliente não encontrado.")

    def start_scraping(self, client_data):
        username = client_data['username']
        session_id = client_data['auth'].get('sessionid')
        
        if not session_id:
            print("❌ SessionID não encontrado no JSON.")
            return

        print(f"🚀 Iniciando Playwright para: {username}")

        with sync_playwright() as p:
            # Lança o navegador (Headless=False para você ver acontecendo no teste)
            browser = p.chromium.launch(headless=False, slow_mo=500) 
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                locale="pt-BR" # Força português para garantir os nomes dos botões
            )
            
            # 1. Injeção de Cookies (O Pulo do Gato)
            context.add_cookies([{
                'name': 'sessionid',
                'value': session_id,
                'domain': '.instagram.com',
                'path': '/'
            }])
            
            page = context.new_page()
            
            try:
                # 2. Acessar Perfil
                print("epg🔍 Acessando perfil...")
                page.goto(f"https://www.instagram.com/{username}/", timeout=60000)
                self.human_delay(3, 6)

                # Verifica se logou
                if "Entrar" in page.title():
                    print("🛑 Erro: O cookie não funcionou. O Instagram pediu login.")
                    return

                # 3. Capturar Seguidores/Seguindo (Stats)
                # Seletores genéricos baseados em posição ou texto
                try:
                    stats = page.locator("ul li").all_inner_texts()
                    # Geralmente vem: ["5 posts", "100 seguidores", "50 seguindo"]
                    print(f"📊 Stats do Perfil: {stats}")
                except:
                    print("⚠️ Não foi possível ler os stats do topo.")

                # 4. Entrar no Grid (Primeiro Post)
                print("📸 Abrindo primeiro post...")
                # O seletor de grid geralmente é um 'article' com links 'a' dentro
                page.locator("article a").first.click()
                self.human_delay(4, 7)

                # LOOP DE POSTS (Captura X posts)
                posts_limit = 5 
                for i in range(posts_limit):
                    print(f"\n--- Processando Post {i+1} ---")
                    
                    post_data = {
                        "url": page.url,
                        "insights": {},
                        "comments": [],
                        "likes_list": []
                    }

                    # A. CAPTURAR INSIGHTS
                    # Procura botão "Ver insights" ou "View insights"
                    try:
                        insights_btn = page.locator("role=button[name='Ver insights']")
                        if insights_btn.is_visible():
                            print("   📈 Abrindo Insights...")
                            insights_btn.click()
                            page.wait_for_timeout(3000) # Espera animação
                            
                            # Captura todo o texto do modal de insights
                            # O modal geralmente tem um role="dialog" ou é uma div flutuante
                            # Vamos pegar o texto bruto por enquanto para não quebrar com classes
                            insights_text = page.locator("div[role='dialog']").inner_text()
                            post_data['insights'] = insights_text
                            print("      ✅ Insights capturados.")
                            
                            # Fecha insights (geralmente clicando fora ou no botão voltar/fechar)
                            # Tentativa de clicar no botão "x" ou voltar
                            close_btn = page.locator("div[role='dialog'] >> role=button").first
                            close_btn.click()
                            page.wait_for_timeout(2000)
                        else:
                            print("   ⚠️ Botão 'Ver Insights' não disponível (pode ser vídeo antigo ou Reels).")
                    except Exception as e:
                        print(f"   ❌ Erro ao pegar insights: {e}")

                    # B. CAPTURAR COMENTÁRIOS
                    # Os comentários ficam na lateral direita (desktop)
                    try:
                        print("   💬 Lendo comentários visíveis...")
                        # Pega os elementos de lista de comentários (ul)
                        comments_area = page.locator("article ul").first
                        if comments_area.is_visible():
                             post_data['comments'] = comments_area.inner_text().split('\n')
                    except:
                        pass

                    # C. CAPTURAR CURTIDAS (Lista de quem curtiu)
                    # Clica no "curtido por X e outras pessoas"
                    try:
                        # Tenta achar o link que diz "curtido por" ou "likes"
                        likes_link = page.locator("a[href*='liked_by']")
                        if likes_link.count() > 0 and likes_link.first.is_visible():
                            print("   ❤️ Abrindo lista de curtidas...")
                            likes_link.first.click()
                            page.wait_for_timeout(3000)
                            
                            # Captura usuários na lista (modal de likes)
                            likes_modal = page.locator("div[role='dialog']")
                            users_liked = likes_modal.locator("span").all_inner_texts()
                            # Filtra lista simples
                            post_data['likes_list'] = [u for u in users_liked if len(u) > 2][:20] # Pega os primeiros 20
                            
                            # Fecha modal de likes
                            page.keyboard.press("Escape")
                            page.wait_for_timeout(2000)
                        else:
                            print("   ℹ️ Lista de curtidas não clicável ou oculta.")
                    except Exception as e:
                        print(f"   ❌ Erro em curtidas: {e}")

                    print(f"   ✅ Dados coletados do post {i+1}")
                    
                    # D. NAVEGAR PARA O PRÓXIMO
                    # Busca a seta da direita
                    try:
                        next_arrow = page.locator("svg[aria-label='Avançar']").locator("..") # Sobe para o pai (botão)
                        if not next_arrow.is_visible():
                             # Tenta seletor alternativo comum
                             next_arrow = page.locator("button[aria-label='Avançar']")
                        
                        if next_arrow.is_visible():
                            next_arrow.click()
                            self.human_delay(3, 5)
                        else:
                            print("🏁 Fim do feed alcançado (sem seta 'Próximo').")
                            break
                    except:
                        print("🏁 Não foi possível encontrar botão Próximo.")
                        break

            except Exception as e:
                print(f"❌ Erro fatal no fluxo: {e}")
                import traceback
                traceback.print_exc()
            
            finally:
                print("🔒 Fechando navegador...")
                browser.close()

if __name__ == "__main__":
    bot = VisualScraper()
    bot.run_specific()