from apify_client import ApifyClient
import json
import os

class CloudScraper:
    def __init__(self, api_token):
        self.client = ApifyClient(api_token)

    def scrape_profiles(self, usernames):
        """
        Coleta dados completos de perfis usando a infraestrutura do Apify.
        Transforma usernames em URLs diretas para garantir a coleta.
        """
        print(f"🚀 Enviando solicitação para nuvem (Apify) para: {usernames}")
        
        # TRANSFORMAÇÃO DE DADOS: Gera URLs completas
        # O robô do Apify funciona melhor com links diretos
        direct_urls = [f"https://www.instagram.com/{u}/" for u in usernames]
        
        # Configuração do Actor (Robô)
        run_input = {
            "directUrls": direct_urls,  # <--- CORREÇÃO AQUI
            "resultsType": "posts", 
            "resultsLimit": 5, # Limite de posts por URL
            "searchType": "hashtag", # Padrão para evitar busca genérica
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"] 
            }
        }

        print(f"📡 Payload configurado: {len(direct_urls)} alvos.")
        print("⏳ Aguardando processamento remoto (isso pode levar 1-3 minutos)...")
        
        try:
            # Chama o Actor e espera ele terminar (síncrono)
            run = self.client.actor("shu8hvrXbJbY3Eb9W").call(run_input=run_input)
        except Exception as e:
            print(f"❌ Erro na comunicação com Apify: {e}")
            return []

        if not run:
            print("❌ O Actor falhou ao iniciar.")
            return []

        print(f"✅ Processamento concluído (Status: {run.get('status')})! Baixando dados...")
        
        try:
            # Pega os itens do dataset gerado
            dataset_items = self.client.dataset(run["defaultDatasetId"]).list_items().items
            return dataset_items
        except Exception as e:
            print(f"❌ Erro ao baixar dataset: {e}")
            return []

    def save_results(self, data):
        if not data:
            print("⚠️ Nenhum dado retornado para salvar.")
            return

        output_path = 'data/reports/apify_results.json'
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Dados salvos em: {output_path}")

# --- EXECUÇÃO ---
if __name__ == "__main__":
    # SEU TOKEN REAL (Mantive o que você enviou, pois estamos testando)
    MY_APIFY_TOKEN = os.getenv("APIFY_TOKEN")
    
    # Validação simples
    if not MY_APIFY_TOKEN or "SEU_TOKEN" in MY_APIFY_TOKEN:
        print("❌ Erro: Token inválido.")
    else:
        scraper = CloudScraper(MY_APIFY_TOKEN)
        
        # Teste com o perfil alvo
        targets = ["sofs.valentini"]
        
        results = scraper.scrape_profiles(targets)
        
        # Filtragem Básica (Remove itens vazios ou de erro)
        valid_results = [item for item in results if item.get('url')]
        
        scraper.save_results(valid_results)
        
        # Preview
        print(f"\n📊 Resumo: {len(valid_results)} itens VÁLIDOS capturados.")
        if valid_results:
            first = valid_results[0]
            print(f"--- Post Recente ---")
            print(f"Link: {first.get('url')}")
            print(f"Tipo: {first.get('type')}")
            print(f"Likes: {first.get('likesCount')}")
            print(f"Comentários: {first.get('commentsCount')}")
            print(f"Legenda: {first.get('caption', '')[:60]}...")