# modules/swipefile/orchestrator.py
import sys
import os
import time
import traceback
from datetime import datetime, timezone

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importação do Esquadrão de Extração
from modules.swipefile.worker_titans import TitansHarvesterWorker
from modules.swipefile.worker_clickbank import ClickbankGravityHunter
from modules.swipefile.worker_newsletters import InboxGhostWorker
from modules.swipefile.worker_museums import MuseumCuratorWorker
from modules.swipefile.worker_cro_science import CroScienceWorker
from modules.swipefile.worker_trenches import TrenchSpyWorker

# Importação do Córtex Neural
from modules.swipefile.cognitive_parser import CognitiveParser

class SwipefileOrchestrator:
    """
    O MAESTRO DE INGESTÃO (The Nightly Heist).
    Gerencia a execução de todos os motores de raspagem em sequência e, 
    ao final, aciona a IA para realizar a Autópsia Cognitiva dos dados frescos.
    """
    def __init__(self):
        print("\n" + "="*60)
        print(" 🌐 [ORION SWIPEFILE ORCHESTRATOR] Inicializando Sistemas...")
        print("="*60)

    def execute_nightly_heist(self):
        """
        Executa a Grande Coleta. 
        Desenhado para rodar de madrugada de forma autônoma.
        """
        start_time = time.time()
        report = {"sucessos": [], "falhas": []}

        print(f"\n🕒 Iniciando Operação Global às {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")

        # =================================================================
        # FASE 1: EXTRAÇÃO BRUTA (Os Batedores)
        # =================================================================

        # 1.1: Os Titãs & Medium
        try:
            TitansHarvesterWorker().run_infiltration()
            report["sucessos"].append("TitansHarvesterWorker")
        except Exception as e:
            report["falhas"].append(f"TitansHarvesterWorker: {e}")
            self._log_error("Titans", e)

        # 1.2: A Engenharia Reversa do ClickBank
        try:
            ClickbankGravityHunter().run_clickbank_heist()
            report["sucessos"].append("ClickbankGravityHunter")
        except Exception as e:
            report["falhas"].append(f"ClickbankGravityHunter: {e}")
            self._log_error("ClickBank", e)

        # 1.3: O Fantasma da Caixa de Entrada (E-mails)
        try:
            InboxGhostWorker().extract_emails()
            report["sucessos"].append("InboxGhostWorker")
        except Exception as e:
            report["falhas"].append(f"InboxGhostWorker: {e}")
            self._log_error("Newsletters", e)

        # 1.4: O Museu (Copy Clássica)
        try:
            MuseumCuratorWorker().run_curation()
            report["sucessos"].append("MuseumCuratorWorker")
        except Exception as e:
            report["falhas"].append(f"MuseumCuratorWorker: {e}")
            self._log_error("Museums", e)

        # 1.5: O Laboratório Científico (CRO/UX)
        try:
            CroScienceWorker().run_research()
            report["sucessos"].append("CroScienceWorker")
        except Exception as e:
            report["falhas"].append(f"CroScienceWorker: {e}")
            self._log_error("CRO Science", e)

        # 1.6: O Espião das Trincheiras (Reddit/HN)
        try:
            TrenchSpyWorker().run_infiltration()
            report["sucessos"].append("TrenchSpyWorker")
        except Exception as e:
            report["falhas"].append(f"TrenchSpyWorker: {e}")
            self._log_error("Trenches", e)

        # =================================================================
        # FASE 2: COMPREENSÃO COGNITIVA (A IA Lendo os Dados)
        # =================================================================
        print("\n" + "-"*60)
        print(" 🧠 [TRANSIÇÃO DE FASE] Iniciando Processamento Neural...")
        print("-"*60)
        
        try:
            # O Parser vai olhar para o banco de dados, achar tudo o que os 
            # Batedores trouxeram hoje e que ainda não tem Autópsia (JSON).
            CognitiveParser().process_unparsed_assets()
            report["sucessos"].append("CognitiveParser")
        except Exception as e:
            report["falhas"].append(f"CognitiveParser: {e}")
            self._log_error("Cognitive Parser", e)

        # =================================================================
        # RELATÓRIO TÁTICO FINAL
        # =================================================================
        elapsed_time = round((time.time() - start_time) / 60, 2)
        
        print("\n" + "="*60)
        print(f" 🏁 [ORION HEIST CONCLUÍDO] Tempo de Execução: {elapsed_time} minutos.")
        print(f" ✅ Módulos Operacionais ({len(report['sucessos'])}): {', '.join(report['sucessos'])}")
        
        if report["falhas"]:
            print(f" ⚠️ Módulos Comprometidos ({len(report['falhas'])}):")
            for falha in report["falhas"]:
                print(f"    - {falha}")
        else:
            print(" 🛡️ Integridade do Sistema: 100%. Nenhum erro detetado.")
        print("="*60 + "\n")

    def _log_error(self, module_name: str, exception: Exception):
        """Silenciador de erros críticos. Evita que a pipeline quebre, mas avisa a diretoria."""
        print(f"\n ❌ [ALERTA] Falha Crítica Isolada no Módulo [{module_name}]")
        # Idealmente, num ambiente de produção, isto envia um alerta para um canal de Slack/Discord da vossa equipe.
        # traceback.print_exc() # Descomentar para debug profundo no console

# =====================================================================
# BLOCO DE IGNIÇÃO AUTOMATIZADA
# =====================================================================
if __name__ == "__main__":
    # Garante que as tabelas existem antes de rodar os workers
    from database.connection import init_db
    try:
        init_db()
    except Exception as e:
        print(f"Erro ao inicializar banco: {e}")
        sys.exit(1)
        
    maestro = SwipefileOrchestrator()
    maestro.execute_nightly_heist()