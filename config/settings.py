# config/settings.py
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env antes de qualquer outra operação
load_dotenv()

# =====================================================================
# CONFIGURAÇÕES DE INFRAESTRUTURA BASE
# =====================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# =====================================================================
# ROTEADOR CENTRAL (SINGLETON)
# =====================================================================
class Settings:
    """
    O Cérebro de Configurações do Orion Growth OS.
    Mapeamento 1:1 com o arquivo .env de Grau Militar.
    """
    PROJECT_NAME = "Orion Growth OS"
    VERSION = "2.0.0"

    class Database:
        # Tenta conectar ao DB em nuvem. Se falhar, usa SQLite local como fallback tático.
        URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DATA_DIR, 'orion_data.db')}")

    class Security:
        SECRET_KEY = os.getenv("SECRET_KEY", "chave_fallback_insegura_substitua_no_env")

    class AI:
        """Córtex Neural Segmentado (Evita colisão de Rate Limits)"""
        # Agentes Gemini
        GEMINI_KEY_SOCIOLOGO = os.getenv("GEMINI_KEY_SOCIOLOGO")
        GEMINI_KEY_ESPIAO = os.getenv("GEMINI_KEY_ESPIAO")
        GEMINI_KEY_TRENDS = os.getenv("GEMINI_KEY_TRENDS")
        GEMINI_KEY_COPY = os.getenv("GEMINI_KEY_COPY")
        GEMINI_KEY_CMO = os.getenv("GEMINI_KEY_CMO")
        
        # Google Cloud NLP
        GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    class ApifyActors:
        """Roteamento dos Esquadrões de Ingestão e Scraping"""
        # Esquadrão 1: O Antropólogo (Scout & Persona)
        IG_COMMENTS = os.getenv("APIFY_ACTOR_IG_COMMENTS", "apify/instagram-comment-scraper")
        TIKTOK_COMMENTS = os.getenv("APIFY_ACTOR_TIKTOK_COMMENTS", "clockworks/tiktok-comments-scraper")
        REDDIT = os.getenv("APIFY_ACTOR_REDDIT", "trudax/reddit-scraper")
        FB_GROUPS = os.getenv("APIFY_ACTOR_FB_GROUPS", "apify/facebook-groups-scraper")

        # Esquadrão 2: Follow the Money (Arena & Concorrentes)
        META_ADS = os.getenv("APIFY_ACTOR_META_ADS", "apify/facebook-ads-scraper")
        IG_PROFILE = os.getenv("APIFY_ACTOR_IG_PROFILE", "apify/instagram-profile-scraper")
        LINKEDIN_POSTS = os.getenv("APIFY_ACTOR_LINKEDIN_POSTS", "apimaestro/linkedin-profile-posts")

        # Esquadrão 3: O Oráculo (Trends & Hijacking)
        TWITTER = os.getenv("APIFY_ACTOR_TWITTER", "apidojo/twitter-scraper-lite")
        TIKTOK_TRENDS = os.getenv("APIFY_ACTOR_TIKTOK_TRENDS", "clockworks/tiktok-scraper")

    class ExternalAPIs:
        """Sistemas de Inteligência de Mercado, SEO e Alternativos"""
        # Vídeos e Redes Sociais Alternativas
        YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
        SOCIALDATA_API_KEY = os.getenv("SOCIALDATA_API_KEY")
        REDDIT_API_KEY = os.getenv("REDDIT_API_KEY")

        # Conversão de Páginas Web e VSLs para a IA
        FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
        
        # Busca Web em Tempo Real e Pesquisa Avançada
        TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
        SERPER_API_KEY = os.getenv("SERPER_API_KEY")

        # SEO e Estimativa de Tráfego de Mercado
        DATAFORSEO_LOGIN = os.getenv("DATAFORSEO_LOGIN")
        DATAFORSEO_PASSWORD = os.getenv("DATAFORSEO_PASSWORD")

# Instância Singleton pronta para importação
settings = Settings()

print(f"[{settings.PROJECT_NAME}] Configurações de Infraestrutura alinhadas com o .env.")