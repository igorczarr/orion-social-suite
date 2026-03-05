# scheduler.py
import sys
import os
import time
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

# Garante que o Python encontra os módulos na estrutura de pastas
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Carrega as chaves secretas do .env (Local) ou do Environment (Render)
load_dotenv()

# =====================================================================
# CONFIGURAÇÃO DE VARIÁVEIS (Nomes padronizados para Produção)
# =====================================================================
TOKEN_APIFY = os.getenv("APIFY_TOKEN")
KEY_GEMINI = os.getenv("GEMINI_API_KEY")
KEY_YOUTUBE = os.getenv("YOUTUBE_API_KEY")

# =====================================================================
# IMPORTAÇÕES SEGURAS
# =====================================================================
try:
    # Importando o Worker que conserta a Matriz Analítica (30 posts)
    # Nota: Verifique se o nome do arquivo é apify_worker.py ou organic_scraper.py
    try:
        from modules.workers.apify_worker import OrionWorker as OrganicWorker
    except ImportError:
        from modules.workers.organic_scraper import OrganicScraper as OrganicWorker
        
    from modules.workers.worker_scout import YouTubeScoutRadar
    from modules.workers.vortex_scraper import VortexInfiltrator
    
    # Importação dinâmica da Arena (Worker 2)
    try:
        from modules.workers.worker_ads import ArenaAnalyzer as AdsWorker
    except ImportError:
        from modules.workers.worker_ads import AdLibrarySpy as AdsWorker
except ImportError as e:
    print(f"❌ ERRO DE IMPORTAÇÃO: Verifique se os arquivos estão na pasta modules/workers/. Erro: {e}")
    sys.exit(1)

# =====================================================================
# FUNÇÕES DE EXECUÇÃO
# =====================================================================

def run_organic_scraper():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🟢 WORKER 1: Rastreador Orgânico")
    try:
        if not TOKEN_APIFY: raise ValueError("APIFY_TOKEN ausente.")
        # Instancia e roda
        worker = OrganicWorker(TOKEN_APIFY)
        worker.run()
    except Exception as e:
        print(f"❌ ERRO no Rastreador Orgânico: {e}")

def run_worker_ads():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] ⚔️ WORKER 2: Analisador da Arena")
    try:
        if not KEY_GEMINI: raise ValueError("GEMINI_API_KEY ausente.")
        worker = AdsWorker(KEY_GEMINI)
        # Verifica se o método é run_arena_cycle ou run_ad_scan
        if hasattr(worker, 'run_arena_cycle'):
            worker.run_arena_cycle()
        else:
            import asyncio
            asyncio.run(worker.run_ad_scan())
    except Exception as e:
        print(f"❌ ERRO na Arena: {e}")

def run_worker_scout():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 📡 WORKER 3: Radar Scout (YouTube)")
    try:
        if not KEY_YOUTUBE or not KEY_GEMINI: 
            print("⚠️ Chaves de API ausentes para o Scout. Pulando...")
            return
        worker = YouTubeScoutRadar(KEY_YOUTUBE, KEY_GEMINI)
        worker.run_radar_cycle()
    except Exception as e:
        print(f"❌ ERRO no Scout: {e}")

def run_vortex_scraper():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🌀 WORKER 4: Infiltrador Vórtex")
    try:
        if not TOKEN_APIFY or not KEY_GEMINI: raise ValueError("Tokens ausentes para o Vórtex.")
        worker = VortexInfiltrator(TOKEN_APIFY, KEY_GEMINI)
        # Ajuste o nome do método conforme o seu ficheiro vortex_scraper.py
        if hasattr(worker, 'run_infiltration_cycle'):
            worker.run_infiltration_cycle()
        else:
            worker.run()
    except Exception as e:
        print(f"❌ ERRO no Vórtex: {e}")

# =====================================================================
# ORQUESTRADOR
# =====================================================================

def start_orchestrator():
    print("\n" + "="*60)
    print("🧠 ORION SYSTEM - ORQUESTRADOR DE INTELIGÊNCIA ATIVADO 24/7")
    print("="*60)
    
    scheduler = BlockingScheduler()

    # Agendamento Noturno (Horários escalonados para não sobrecarregar a CPU e API)
    # 00:00 - Coleta dados das contas
    scheduler.add_job(run_organic_scraper, 'cron', hour=0, minute=0)
    # 01:30 - Estuda anúncios dos concorrentes
    scheduler.add_job(run_worker_ads, 'cron', hour=1, minute=30)
    # 03:00 - Escuta o YouTube em busca de dores
    scheduler.add_job(run_worker_scout, 'cron', hour=3, minute=0)
    # 05:00 - Busca alvos no Vórtex
    scheduler.add_job(run_vortex_scraper, 'cron', hour=5, minute=0)

    # EXECUÇÃO DE ARRANQUE (Apenas se for local ou primeiro deploy)
    # Se você quiser que ele rode tudo assim que ligar, descomente abaixo:
    print("\n🚀 [STARTUP] Iniciando ciclo de aquecimento de dados...")
    run_organic_scraper()
    # run_worker_ads()
    # run_worker_scout()

    print(f"\n✅ Agendador pronto. Próxima execução programada: 00:00")
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("\n🛑 Orquestrador desligado.")

if __name__ == "__main__":
    start_orchestrator()