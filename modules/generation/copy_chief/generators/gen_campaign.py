# modules/generation/copy_chief/generators/gen_campaign.py
import sys
import os
import json
from typing import Dict, Any
import google.generativeai as genai
from google.generativeai.types import content_types
from sqlalchemy.orm import Session

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')))

from config.settings import settings

# A Importação da Alma da Máquina
from modules.generation.copy_chief.master_persona import EightFigureCopywriterPersona

class CampaignGenerator:
    """
    O GENERAL DO FUNIL (Omnichannel Campaign Architect).
    Não cria peças isoladas; cria o "Master Blueprint". O fio condutor lógico e 
    emocional que liga o Topo do Funil (Ads) ao Fundo do Funil (VSL, E-mails e WA).
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DA MÁQUINA DE GUERRA (A Planta do Ecossistema)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "campaign_metadata": {
                    "type": "OBJECT",
                    "properties": {
                        "operation_name": {"type": "STRING", "description": "Nome de código militar da campanha (Ex: 'Operação Fenda Algorítmica')."},
                        "core_thesis": {"type": "STRING", "description": "A 'Big Idea' unificada que sustenta todos os ativos do funil."}
                    }
                },
                "funnel_architecture": {
                    "type": "OBJECT",
                    "properties": {
                        "phase_1_traffic": {
                            "type": "STRING", 
                            "description": "O ângulo mestre para os Meta/TikTok Ads. Como vamos parar o scroll e roubar o clique?"
                        },
                        "phase_2_infiltrator": {
                            "type": "STRING", 
                            "description": "A estratégia do Advertorial/Página de Captura. Como vamos aquecer o lead antes de vender?"
                        },
                        "phase_3_conversion": {
                            "type": "STRING", 
                            "description": "A premissa da VSL. Qual é o exato momento de epifania que fará o lead sacar do cartão?"
                        },
                        "phase_4_retention": {
                            "type": "STRING", 
                            "description": "O arco narrativo da Soap Opera Sequence (5 e-mails). Qual será a história de fundo usada para recuperar quem não comprou?"
                        },
                        "phase_5_sniper_close": {
                            "type": "STRING", 
                            "description": "A estratégia de WhatsApp para os abandonos de carrinho. Qual objeção final vamos esmagar no 1-a-1?"
                        }
                    }
                },
                "congruence_check": {
                    "type": "STRING",
                    "description": "A justificativa tática de como todas estas 5 fases se conectam sem parecerem peças aleatórias de marketing."
                }
            },
            "required": ["campaign_metadata", "funnel_architecture", "congruence_check"]
        })

        # Temperature 0.3: Estratégia pura de alto nível. Requer extrema coesão lógica.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.3, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_campaign_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex do General de Campo."""
        
        persona = brand_identity.get("persona", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Estagnação.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O nosso protocolo")
        
        return f"""
        Sua missão operacional agora é atuar como o Arquiteto-Chefe de uma campanha Omnicanal completa.
        Não escreva as copys completas. Desenhe o "Master Blueprint" (A Planta-Baixa) que ditará a estratégia de todos os redatores abaixo de você.

        1. O OBJETIVO DO FUNIL (O que estamos vendendo no final):
        {brief}

        2. A FUNDAÇÃO DA MARCA:
        - A Dor que o Funil Inteiro deve resolver: {core_fear}
        - O Mecanismo Único que é a estrela do show: {mechanism}
        - Diretrizes Específicas do Cliente: {json.dumps(parameters)}

        3. TELEMETRIA E MEMÓRIA DE CAMPANHAS:
        {memory_context}

        REGRAS DE CONGRUÊNCIA DE 8 DÍGITOS:
        - Se o Anúncio promete X, o Advertorial deve provar X logicamente, a VSL deve vender a ferramenta que executa X, os E-mails devem contar a história de quem duvidou de X, e o WhatsApp deve fechar quem tem medo de X.
        - Não pode haver quebra de expectativa. A transição entre as fases deve ser um escorregador lubrificado.

        Gere a Planta do Ecossistema.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Orquestra o Master Blueprint. Acionado pelo chief_orchestrator."""
        print(f"    🗺️ [GERADOR: CAMPAIGN GENERAL] Desenhando a Planta do Ecossistema Omnicanal...")
        
        prompt = self._build_campaign_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA colapsou ao gerar a visão macro da campanha.")

                campaign_json = json.loads(response.text)
                print("    ✅ Master Blueprint forjado. Funil perfeitamente alinhado.")
                
                # Monta a versão final (Apresentável) para o FrontEnd.
                meta = campaign_json.get("campaign_metadata", {})
                arch = campaign_json.get("funnel_architecture", {})
                
                presentation_body = "=== MASTER BLUEPRINT DA CAMPANHA OMNICANAL ===\n\n"
                presentation_body += f"⚔️ NOME DA OPERAÇÃO: {meta.get('operation_name', '').upper()}\n"
                presentation_body += f"🧠 BIG IDEA UNIFICADA: {meta.get('core_thesis', '')}\n"
                presentation_body += "="*60 + "\n\n"
                
                presentation_body += "[FASE 1: TRÁFEGO PAGO (ADS)]\n"
                presentation_body += f"🎯 Ângulo de Ataque: {arch.get('phase_1_traffic', '')}\n\n"
                
                presentation_body += "[FASE 2: INFILTRAÇÃO (PRE-SELL/OPT-IN)]\n"
                presentation_body += f"📰 Estratégia: {arch.get('phase_2_infiltrator', '')}\n\n"
                
                presentation_body += "[FASE 3: CONVERSÃO (VSL/OFERTA)]\n"
                presentation_body += f"🎬 Core Premise: {arch.get('phase_3_conversion', '')}\n\n"
                
                presentation_body += "[FASE 4: RETENÇÃO (SOAP OPERA)]\n"
                presentation_body += f"📧 Arco Narrativo: {arch.get('phase_4_retention', '')}\n\n"
                
                presentation_body += "[FASE 5: FECHAMENTO (WHATSAPP)]\n"
                presentation_body += f"📱 Sniper Angle: {arch.get('phase_5_sniper_close', '')}\n\n"
                
                presentation_body += "="*60 + "\n"
                presentation_body += f"🛡️ VERIFICAÇÃO DE CONGRUÊNCIA:\n{campaign_json.get('congruence_check', '')}\n"

                return {
                    "status": "success",
                    "asset_type": "full_campaign_blueprint",
                    "copy_body": presentation_body,
                    "structured_data": campaign_json, 
                    "ai_reasoning": "Campanha estruturada de forma top-down para garantir que não haja vazamentos no funil devido a desconexões de copy."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex General: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto Macro falhou ao desenhar o funil."
        }