# modules/generation/copy_chief/chief_orchestrator.py
import sys
import os
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, BrandDossier

# Importação da Memória (Lóbulo Ativado)
from modules.generation.copy_chief.memory_cortex import MemoryCortex

# Importações do Arsenal Bélico (Os 15 Geradores Oficiais)
from modules.generation.copy_chief.generators.gen_offer_stack import OfferStackGenerator
from modules.generation.copy_chief.generators.gen_ads_meta import MetaAdsGenerator
from modules.generation.copy_chief.generators.gen_ads_video import VideoAdsGenerator
from modules.generation.copy_chief.generators.gen_advertorials import AdvertorialGenerator
from modules.generation.copy_chief.generators.gen_big_ideas import BigIdeaGenerator
from modules.generation.copy_chief.generators.gen_vsl import VSLGenerator
from modules.generation.copy_chief.generators.gen_emails_soap import SoapOperaGenerator
from modules.generation.copy_chief.generators.gen_emails_seinfeld import SeinfeldSequenceGenerator
from modules.generation.copy_chief.generators.gen_emails import PromoEmailGenerator
from modules.generation.copy_chief.generators.gen_optin import OptinGenerator
from modules.generation.copy_chief.generators.gen_funnel_oto import OTOFunnelGenerator
from modules.generation.copy_chief.generators.gen_webinar import WebinarGenerator
from modules.generation.copy_chief.generators.gen_naming_mechanisms import NamingMechanismGenerator
from modules.generation.copy_chief.generators.gen_campaign import CampaignGenerator
from modules.generation.copy_chief.generators.gen_hooks import HooksGenerator
from modules.generation.copy_chief.generators.gen_whatsapp_sniper import WhatsAppSniperGenerator

class CopyChiefOrchestrator:
    """
    O DIRETOR DE COPY (Copy Chief Central).
    Onipresente no sistema. Recebe requisições do Frontend, carrega o Dossiê da Marca,
    lê o Histórico de Métricas do cliente e aciona o gerador especializado correto.
    Toda a operação passa por este funil de delegação.
    """
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session or SessionLocal()
        
        # O Córtex de Memória ATIVADO
        self.memory = MemoryCortex(self.db)
        
        # O Arsenal de Geradores (Mapeamento de Rotas)
        self.generators = {
            "offer_stack": OfferStackGenerator(self.db),
            "meta_ads": MetaAdsGenerator(self.db),
            "video_ads": VideoAdsGenerator(self.db),
            "advertorial": AdvertorialGenerator(self.db),
            "big_ideas": BigIdeaGenerator(self.db),
            "vsl": VSLGenerator(self.db),
            "soap_opera": SoapOperaGenerator(self.db),
            "seinfeld_emails": SeinfeldSequenceGenerator(self.db),
            "promo_emails": PromoEmailGenerator(self.db),
            "optin_page": OptinGenerator(self.db),
            "funnel_oto": OTOFunnelGenerator(self.db),
            "webinar": WebinarGenerator(self.db),
            "naming_ip": NamingMechanismGenerator(self.db),
            "full_campaign": CampaignGenerator(self.db),
            "hooks": HooksGenerator(self.db),
            "whatsapp_sniper": WhatsAppSniperGenerator(self.db)
        }

    def _load_brand_identity(self, tenant_id: int) -> Dict[str, Any]:
        """Carrega a Bíblia da Marca (Persona, Culto e Oceano Azul)."""
        dossier = self.db.query(BrandDossier).filter(BrandDossier.tenant_id == tenant_id).first()
        if not dossier:
            raise ValueError("Brand Lock ausente. O Copy Chief recusa-se a escrever às cegas. Rode o módulo de Identidade primeiro.")
            
        return {
            "persona": dossier.persona_profile,
            "cult": dossier.cult_branding,
            "blue_ocean": dossier.errc_matrix
        }

    def execute_request(self, tenant_id: int, request_type: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        O Ponto de Entrada Único (Single Point of Entry) para o Frontend.
        
        :param tenant_id: O ID do cliente.
        :param request_type: A chave do gerador ("vsl", "hooks", "meta_ads", etc).
        :param brief: O contexto direto do utilizador (Ex: "Quero vender a minha mentoria de $5k").
        :param parameters: Filtros táticos (Ex: {"emotion": "medo", "length": "short"}).
        """
        print(f"\n👔 [COPY CHIEF] Comando recebido. Alvo tático: [{request_type.upper()}] | Tenant: {tenant_id}")
        
        try:
            # 1. Carrega a Identidade Inquebrável (O "Quem somos")
            brand_identity = self._load_brand_identity(tenant_id)
            print("    ✅ Dossiê de Marca acoplado. O Diretor sabe a linguagem da tribo.")
            
            # 2. Consulta o Córtex de Memória (O "O que já sabemos que funciona")
            memory_context = self.memory.get_historical_context(tenant_id, request_type)
            print("    ✅ Telemetria histórica processada e enviada para a linha de frente.")
            
            # 3. Delegação Balística (Aciona a Arma Correta)
            generator = self.generators.get(request_type)
            if not generator:
                raise NotImplementedError(f"O Copy Chief não possui um arquiteto na matriz para o comando: '{request_type}'. Verifique as chaves disponíveis.")
            
            # 4. Execução da Geração Neural de 8 Dígitos
            print(f"    ⏳ Iniciando síntese neural de conversão através de [{generator.__class__.__name__}]...")
            final_copy = generator.generate(brand_identity, memory_context, brief, parameters)
            
            # 5. Fechamento de Ciclo (Registro na Memória)
            if final_copy.get("status") == "success":
                log_id = self.memory.log_generation(
                    tenant_id=tenant_id,
                    asset_type=request_type,
                    briefing=brief,
                    generated_copy=final_copy.get("copy_body", ""),
                    ai_reasoning=final_copy.get("ai_reasoning", "Execução Padrão")
                )
                final_copy["log_id"] = log_id
                print(f" 🏆 [COPY CHIEF] Peça forjada com sucesso e registrada na memória. Log ID: {log_id}")
            else:
                print(f" ⚠️ [COPY CHIEF] Aviso da matriz: {final_copy.get('message')}")
                
            return final_copy
            
        except ValueError as ve:
            print(f" ❌ [ERRO DE ESTRATÉGIA MESTRE]: {ve}")
            return {"status": "error", "message": str(ve)}
        except NotImplementedError as nie:
            print(f" ❌ [ERRO DE ROTEAMENTO]: {nie}")
            return {"status": "error", "message": str(nie)}
        except Exception as e:
            print(f" ❌ [FALHA CRÍTICA NO CÓRTEX]: {e}")
            return {"status": "error", "message": "O Copy Chief colapsou durante a formulação tática."}
        finally:
            self.db.close()

# =====================================================================
# BLOCO DE TESTE DO ECOSSISTEMA (Mockado)
# =====================================================================
if __name__ == "__main__":
    # Teste rápido para validar o mapeamento e roteamento do Orquestrador
    class MockDB:
        def query(self, *args): return self
        def filter(self, *args): return self
        def first(self):
            class DummyDossier:
                persona_profile = {"pain_and_friction": {"3am_nightmare": "Ficar pobre"}}
                cult_branding = {"lexicon": {"us_words": ["Elite", "Lucro Líquido"]}}
                errc_matrix = {"category_design": {"new_category_name": "Software Automático"}}
            return DummyDossier()
        def order_by(self, *args): return self
        def limit(self, *args): return self
        def all(self): return []
        def add(self, obj):
            obj.id = 999 # Simula o ID retornado pelo banco
        def commit(self): pass
        def refresh(self, obj): pass
        def rollback(self): pass
        def close(self): pass

    chief = CopyChiefOrchestrator(db_session=MockDB())
    
    # Exemplo: Frontend pedindo ganchos para vídeos do TikTok
    # resposta = chief.execute_request(
    #     tenant_id=1, 
    #     request_type="hooks", 
    #     brief="Vídeo curto ensinando a não usar agências de tráfego tradicionais."
    # )
    # print(json.dumps(resposta, indent=2, ensure_ascii=False))