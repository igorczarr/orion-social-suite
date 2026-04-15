# modules/generation/copy_chief/generators/gen_funnel_oto.py
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

class OTOFunnelGenerator:
    """
    O ARQUITETO DE UPSELLS (OTO - One Time Offer Specialist).
    Focado em maximizar o LTV (Ticket Médio) através de ofertas de 1-Clique.
    Gera estratégias de Upsell (Velocidade/Facilidade) e Downsell (Remoção de barreira).
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE MAXIMIZAÇÃO DE LUCRO (Upsell/Downsell Architecture)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "upsell_strategy": {
                    "type": "OBJECT",
                    "properties": {
                        "the_logic": {"type": "STRING", "description": "Por que esta oferta faz sentido agora? (Velocidade, Facilidade, ou Próximo Problema)."},
                        "congruency_link": {"type": "STRING", "description": "Como conectamos o produto que ele acabou de comprar com este novo."}
                    }
                },
                "oto_copy_blocks": {
                    "type": "OBJECT",
                    "properties": {
                        "wait_stop_headline": {"type": "STRING", "description": "Headline de interrupção (Ex: 'ESPERE! Não feche esta página ou seu pedido ficará incompleto')."},
                        "the_congratulations": {"type": "STRING", "description": "Validação da compra anterior (Dopamina)."},
                        "the_problem_reveal": {"type": "STRING", "description": "A revelação de que o produto anterior cria um novo desafio ou pode ser acelerado."},
                        "the_one_click_offer": {"type": "STRING", "description": "A apresentação do Upsell como a solução definitiva de 1-clique."},
                        "scarcity_logic": {"type": "STRING", "description": "Por que o preço é 70% menor APENAS nesta página?"}
                    }
                },
                "downsell_variant": {
                    "type": "OBJECT",
                    "properties": {
                        "the_pivot": {"type": "STRING", "description": "Se ele recusar o Upsell, o que oferecemos? (Ex: Versão digital mais barata, ou parcelamento estendido)."},
                        "rejection_handler": {"type": "STRING", "description": "Texto que aborda a recusa (Ex: 'Eu entendo, talvez o investimento agora seja alto, por isso fiz isto...')."}
                    }
                },
                "call_to_action_buttons": {
                    "type": "OBJECT",
                    "properties": {
                        "yes_button": {"type": "STRING", "description": "Texto de confirmação agressiva (Ex: 'SIM! Adicione o Acelerador ao meu pedido por apenas R$X')."},
                        "no_link": {"type": "STRING", "description": "O link de recusa (Ex: 'Não, eu prefiro demorar mais para ter resultados e pagar o preço cheio depois')."}
                    }
                }
            },
            "required": ["upsell_strategy", "oto_copy_blocks", "downsell_variant", "call_to_action_buttons"]
        })

        # Temperature 0.4: Foco em lógica de funil e conversão transacional.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.4, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_oto_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Otimização de Margem."""
        
        persona = brand_identity.get("persona", {})
        mechanism = brand_identity.get("blue_ocean", {}).get("category_design", {}).get("new_category_name", "Nosso Método")
        
        return f"""
        Sua missão operacional agora é criar a estratégia e a copy de um OTO (One Time Offer) - Upsell e Downsell.
        O cliente acabou de comprar o produto principal. Ele está com o cartão na mão e o sangue quente.
        Não ofereça "mais do mesmo". Ofereça o ATALHO ou a SOLUÇÃO para o próximo problema que o primeiro produto vai criar.

        1. O QUE ELE ACABOU DE COMPRAR (Contexto):
        {brief}

        2. A IDENTIDADE DA MARCA:
        - Nosso Mecanismo Único: {mechanism}
        - Perfil da Persona: {json.dumps(persona)}
        - Parâmetros da Oferta: {json.dumps(parameters)}

        3. TELEMETRIA DE CHECKOUT:
        {memory_context}

        DIRETRIZES DE 8 DÍGITOS PARA OTO:
        - A HEADLINE: Deve ser um choque. "PARE!" ou "ESPERE!". Queremos que ele pare de tentar fechar a aba.
        - A LÓGICA: Se ele comprou um curso de anúncios, venda os templates prontos. Se comprou um software, venda a implementação VIP.
        - O BOTÃO DE NÃO: Deve ser um "Link de Rejeição Negativa". Ele deve sentir que está a tomar uma decisão estúpida ao clicar em "Não".
        - O DOWNSELL: Se ele disser não ao Upsell de R$497, ofereça o mesmo produto sem os bônus por R$197, ou apenas uma parte dele que seja irresistível.

        Construa a estrutura que dobra o lucro da operação.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Gera o funil de pós-venda. Acionado pelo chief_orchestrator."""
        print(f"    📈 [GERADOR: OTO FUNNEL] Calculando maximização de LTV com Persona Mestre...")
        
        prompt = self._build_oto_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Upsell não conseguiu calcular a oferta.")

                oto_json = json.loads(response.text)
                print("    ✅ Estratégia de Upsell/Downsell finalizada. Lucratividade potencial aumentada.")
                
                # Formatação para o FrontEnd
                blocks = oto_json.get("oto_copy_blocks", {})
                presentation_body = "=== ESTRATÉGIA DE UPSELL (OTO) DE ALTA CONVERSÃO ===\n\n"
                presentation_body += f"🧠 LÓGICA DA OFERTA: {oto_json.get('upsell_strategy', {}).get('the_logic', '')}\n"
                presentation_body += f"🔗 CONGRUÊNCIA: {oto_json.get('upsell_strategy', {}).get('congruency_link', '')}\n"
                presentation_body += "="*60 + "\n\n"
                
                presentation_body += f"🛑 HEADLINE: {blocks.get('wait_stop_headline')}\n\n"
                presentation_body += f"🎉 VALIDAÇÃO: {blocks.get('the_congratulations')}\n\n"
                presentation_body += f"⚠️ O PROBLEMA OCULTO: {blocks.get('the_problem_reveal')}\n\n"
                presentation_body += f"💎 A SOLUÇÃO IMEDIATA: {blocks.get('the_one_click_offer')}\n\n"
                presentation_body += f"⏳ POR QUE AGORA?: {blocks.get('scarcity_logic')}\n\n"
                
                presentation_body += "--- BOTÕES DE AÇÃO ---\n"
                btns = oto_json.get("call_to_action_buttons", {})
                presentation_body += f"✅ Botão Sim: {btns.get('yes_button')}\n"
                presentation_body += f"❌ Link Não: {btns.get('no_link')}\n\n"
                
                presentation_body += "--- ESTRATÉGIA DE DOWNSELL (Caso ele recuse) ---\n"
                ds = oto_json.get("downsell_variant", {})
                presentation_body += f"🔄 O Pivot: {ds.get('the_pivot')}\n"
                presentation_body += f"💬 Handler: {ds.get('rejection_handler')}\n"

                return {
                    "status": "success",
                    "asset_type": "funnel_oto",
                    "copy_body": presentation_body,
                    "structured_data": oto_json, 
                    "ai_reasoning": "Aplicação de 'Next Problem Logic'. Otimização de checkout baseada em redução de fricção e inversão de risco no pós-venda."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Upsell: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Funil falhou ao estruturar a oferta pós-venda."
        }