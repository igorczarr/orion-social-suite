# scheduler.py
import sys
import os
import time
import asyncio
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

# Garante que o Python encontra os módulos na estrutura de pastas raiz
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
# IMPORTAÇÕES ESTRITAS (Sem adivinhações - Caminhos definitivos)
# =====================================================================
try:
    # Worker 1: O Extrator Orgânico (Corrigido com limpeza de arroba)
    from modules.workers.apify_worker import OrionWorker as OrganicWorker
    
    # Worker 2: O Analisador de Arena (Gera os Hooks)
    from modules.workers.worker_ads import ArenaAnalyzer as AdsWorker
    
    # Worker 3: O Radar Scout (Lê o YouTube para as dores)
    from modules.workers.worker_scout import YouTubeScoutRadar
    
    # Worker 4: O Vórtex (Sniper de leads)
    from modules.workers.vortex_scraper import VortexInfiltrator
    
except ImportError as e:
    print(f"❌ [CRÍTICO] Falha de Importação no Orquestrador: {e}")
    sys.exit(1)

# =====================================================================
# FUNÇÕES DE EXECUÇÃO INDIVIDUAIS
# =====================================================================

def run_organic_scraper():
    """Worker 1: Puxa os dados brutos e KPIs do Instagram."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🟢 WORKER 1: Rastreador Orgânico")
    try:
        if not TOKEN_APIFY: raise ValueError("APIFY_TOKEN ausente.")
        worker = OrganicWorker(TOKEN_APIFY)
        worker.run()
    except Exception as e:
        print(f"❌ ERRO no Rastreador Orgânico: {e}")

def run_worker_ads():
    """Worker 2: Lê as legendas salvas e gera os Ganchos de Arena via IA."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] ⚔️ WORKER 2: Analisador da Arena")
    try:
        if not KEY_GEMINI: raise ValueError("GEMINI_API_KEY ausente.")
        worker = AdsWorker(KEY_GEMINI)
        worker.run_arena_cycle()
    except Exception as e:
        print(f"❌ ERRO na Arena: {e}")

def run_worker_scout():
    """Worker 3: Mapeia o Oceano Azul e dores da Persona."""
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
    """Worker 4: Infiltração em concorrentes e qualificação de leads."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 🌀 WORKER 4: Infiltrador Vórtex")
    try:
        if not TOKEN_APIFY or not KEY_GEMINI: raise ValueError("Tokens ausentes para o Vórtex.")
        worker = VortexInfiltrator(TOKEN_APIFY, KEY_GEMINI)
        worker.run_infiltration_cycle()
    except Exception as e:
        print(f"❌ ERRO no Vórtex: {e}")

# =====================================================================
# A CASCATA DE INTELIGÊNCIA (O Segredo do Painel Cheio)
# =====================================================================
def run_full_intelligence_cycle():
    """
    Roda os workers essenciais em cadeia. 
    Garante que a Arena só rode DEPOIS que o Orgânico trouxer os posts.
    """
    print("\n" + "="*60)
    print(f"🌊 INICIANDO CASCATA DE INTELIGÊNCIA [{datetime.now().strftime('%H:%M:%S')}]")
    print("="*60)
    
    run_organic_scraper()
    
    print("\n⏳ Aguardando gravação de disco (10s)...")
    time.sleep(10) # Dá tempo para o banco Neon confirmar as transações
    
    run_worker_ads()
    
    print("\n🌊 Cascata finalizada. Dashboard pronta para leitura.")

# =====================================================================
# ORQUESTRADOR (CRONOGRAMA)
# =====================================================================

def start_orchestrator():
    print("\n" + "="*60)
    print("🧠 ORION SYSTEM - ORQUESTRADOR DE INTELIGÊNCIA ATIVADO 24/7")
    print("="*60)
    
    scheduler = BlockingScheduler()

    # Agendamento Noturno Otimizado
    # Em vez de espaçar tanto, rodamos a CASCATA à meia-noite
    scheduler.add_job(run_full_intelligence_cycle, 'cron', hour=0, minute=0)
    
    # O Scout (YouTube) roda depois, pois usa outras APIs
    scheduler.add_job(run_worker_scout, 'cron', hour=2, minute=0)
    
    # O Vortex (Sniper) roda de madrugada para não competir com a API principal
    scheduler.add_job(run_vortex_scraper, 'cron', hour=4, minute=0)

    print(f"\n✅ Agendador pronto. Sistema em repouso aguardando cronograma ou gatilho manual.")
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("\n🛑 Orquestrador desligado.")

if __name__ == "__main__":
    # Removemos a execução síncrona forçada no boot para não travar o servidor
    start_orchestrator()