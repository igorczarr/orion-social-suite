# modules/brand_lock/orchestrator.py
import sys
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, BrandDossier

# Importação dos 3 Motores de Elite
from modules.brand_lock.persona_engineer import PersonaEngineer
from modules.brand_lock.cult_branding import CultBrandingEngineer
from modules.brand_lock.blue_ocean import BlueOceanStrategist

class BrandLockOrchestrator:
    """
    O MAESTRO ESTRATÉGICO.
    Encadeia a Persona, o Culto e o Monopólio numa única pipeline neural.
    Salva o Dossiê Inquebrável no banco de dados, servindo como a 'Bíblia' 
    para o motor de geração de Copy.
    """
    def __init__(self):
        self.db = SessionLocal()
        
        # Inicialização dos Motores
        self.persona_engine = PersonaEngineer(self.db)
        self.cult_engine = CultBrandingEngineer(self.db)
        self.ocean_engine = BlueOceanStrategist(self.db)

    def execute_brand_lock(self, tenant_id: int) -> bool:
        """
        Executa a síntese completa da identidade e tranca-a no cofre.
        Retorna True em caso de sucesso absoluto.
        """
        print(f"\n⚡ [ORQUESTRADOR] Iniciando Protocolo BRAND LOCK para Tenant {tenant_id}...")
        start_time = time.time()
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            print(" ❌ [CRÍTICO] Falha na ignição: Cliente (Tenant) inexistente.")
            self.db.close()
            return False

        try:
            # ---------------------------------------------------------
            # FASE 1: DOXXING PSICOLÓGICO
            # ---------------------------------------------------------
            persona_json = self.persona_engine.engineer_persona(tenant_id)
            if not persona_json:
                raise ValueError("O Motor de Persona falhou. A cadeia de montagem foi abortada.")
            
            # ---------------------------------------------------------
            # FASE 2: ENGENHARIA DE CULTO
            # ---------------------------------------------------------
            cult_json = self.cult_engine.forge_cult(tenant_id, persona_json)
            if not cult_json:
                raise ValueError("O Motor de Culto falhou. Não há doutrina para aplicar.")
                
            # ---------------------------------------------------------
            # FASE 3: MONOPÓLIO (CATEGORY DESIGN)
            # ---------------------------------------------------------
            ocean_json = self.ocean_engine.forge_blue_ocean(tenant_id, persona_json, cult_json)
            if not ocean_json:
                raise ValueError("O Motor de Oceano Azul falhou. O mercado não foi mapeado.")

            # ---------------------------------------------------------
            # FASE 4: PERSISTÊNCIA (TRANCAR O COFRE)
            # ---------------------------------------------------------
            print("\n 💾 [ORQUESTRADOR] Compilando Dossiê e gravando no Grafo de Conhecimento...")
            
            # Verifica se já existe um dossiê para este cliente (Update) ou se é novo (Insert)
            dossier = self.db.query(BrandDossier).filter(BrandDossier.tenant_id == tenant_id).first()
            
            if dossier:
                print("    Atualizando Dossiê Existente (Evolução de Marca)...")
                dossier.persona_profile = persona_json
                dossier.cult_branding = cult_json
                dossier.errc_matrix = ocean_json
            else:
                print("    Criando Novo Dossiê Inquebrável (Fundação de Marca)...")
                dossier = BrandDossier(
                    tenant_id=tenant_id,
                    persona_profile=persona_json,
                    cult_branding=cult_json,
                    errc_matrix=ocean_json
                )
                self.db.add(dossier)
                
            self.db.commit()
            
            elapsed = round(time.time() - start_time, 2)
            print(f"\n🛡️ [BRAND LOCK CONCLUÍDO] Dossiê trancado com sucesso em {elapsed} segundos.")
            print(f" 👑 O Tenant {tenant_id} agora possui um Monopólio Tático validado por IA.")
            return True
            
        except ValueError as ve:
            self.db.rollback()
            print(f"\n 🛑 [ABORTADO] O protocolo de encadeamento falhou: {ve}")
            return False
        except SQLAlchemyError as sqle:
            self.db.rollback()
            print(f"\n ❌ [FALHA DE BANCO DE DADOS] Impossível trancar o cofre: {sqle}")
            return False
        except Exception as e:
            self.db.rollback()
            print(f"\n ❌ [ERRO CRÍTICO DESCONHECIDO]: {e}")
            return False
        finally:
            self.db.close()

# =====================================================================
# COMANDO DE IGNIÇÃO TÁTICA (Para Testes Locais)
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    
    # Previne erros caso a tabela já exista
    try: 
        init_db()
    except Exception as db_e:
        print(f"Aviso de DB: {db_e}")
    
    maestro = BrandLockOrchestrator()
    # Executa a linha de montagem para o Cliente ID 1
    # maestro.execute_brand_lock(tenant_id=1)