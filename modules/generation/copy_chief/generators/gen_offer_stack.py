# modules/generation/copy_chief/generators/gen_offer_stack.py
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

class OfferStackGenerator:
    """
    O ARQUITETO DE OFERTAS IRRESISTÍVEIS (8-Figure Stack).
    Não escreve apenas texto; inventa Bónus que matam objeções, 
    ancora preços de forma desleal e cria Garantias Insanas (Risk Reversal).
    Agora equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO # Fallback
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE EXTRAÇÃO BRUTAL (A Matemática da Persuasão)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "the_vehicle": {
                    "type": "OBJECT",
                    "properties": {
                        "renamed_product": {"type": "STRING", "description": "O nome sexy do produto (Ex: Em vez de 'Curso de Vendas', 'Protocolo Black Card')."},
                        "core_promise": {"type": "STRING", "description": "A promessa nua e crua de ROI ou Transformação."}
                    }
                },
                "objection_crushing_bonuses": {
                    "type": "ARRAY",
                    "description": "Exatamente 3 a 4 bónus. Cada um DEVE resolver uma objeção que o produto principal cria (Tempo, Dinheiro, Habilidade, Esforço).",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "bonus_name": {"type": "STRING"},
                            "objection_killed": {"type": "STRING", "description": "A desculpa do cliente que este bónus destrói."},
                            "perceived_value": {"type": "INTEGER", "description": "Valor monetário ancorado alto (Ex: 997)."}
                        }
                    }
                },
                "insane_guarantee": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING", "description": "Ex: Garantia 'Sua Renda ou Seu Aluguel Pago'."},
                        "the_terms": {"type": "STRING", "description": "Os termos assimétricos onde o nosso cliente assume 100% do risco e o comprador 0%."}
                    }
                },
                "price_anchoring": {
                    "type": "OBJECT",
                    "properties": {
                        "total_value": {"type": "INTEGER", "description": "A soma do produto + bónus (Valor Absurdo)."},
                        "drop_down_logic": {"type": "STRING", "description": "A narrativa que justifica baixar o preço de R$10.000 para R$997 sem parecer desespero."},
                        "final_price": {"type": "INTEGER", "description": "O preço real de venda."}
                    }
                },
                "the_stack_presentation": {
                    "type": "STRING",
                    "description": "O texto final em bullet points, persuasivo, agressivo, pronto para ser colado na página de Checkout ou VSL final."
                }
            },
            "required": ["the_vehicle", "objection_crushing_bonuses", "insane_guarantee", "price_anchoring", "the_stack_presentation"]
        })

        # Temperature 0.4: Foco extremo em matemática e lógica de conversão. 
        # A INJEÇÃO DA ALMA: system_instruction aciona a persona global.
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

    def _build_offer_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """A Planta Arquitetural enviada à IA."""
        
        # Extração inteligente do Dossiê para dar contexto
        persona_fear = brand_identity.get("persona", {}).get("pain_and_friction", {}).get("failed_solutions", "Medo de perder dinheiro.")
        cult_words = ", ".join(brand_identity.get("cult", {}).get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é construir uma Oferta Irresistível (Grand Slam Offer) 
        que faça o cliente sentir-se um idiota absoluto se não sacar do cartão de crédito AGORA.

        1. O BRIEFING DO CLIENTE (O que estamos vendendo):
        {brief}

        2. A IDENTIDADE DA NOSSA MARCA E PERSONA:
        - O Maior Medo deles/Por que falharam antes: {persona_fear}
        - O Nosso Léxico Sagrado (Use estas palavras no texto): {cult_words}
        - Instruções Especiais de Parâmetros: {json.dumps(parameters)}

        3. TELEMETRIA E MEMÓRIA DE CAMPANHAS PASSADAS:
        {memory_context}

        DIRETRIZES DE ENGENHARIA DE 8-DÍGITOS:
        - BÓNUS: Se o produto é sobre "Tráfego", o bónus deve ser sobre "Edição/Design" (matar a próxima objeção logística). O Bónus não pode ser "Mais do mesmo". Tem de ser "A peça que falta".
        - GARANTIA: Proibido usar "Garantia Incondicional de 7 dias" (isso é a lei, não é marketing). Crie uma Garantia Condicional Extrema (Ex: "Mostre-me que você aplicou, e se não lucrar, eu pago X").
        - ANCORAGEM: Justifique o desconto. (Ex: "Eu cobraria 10 mil numa mentoria, mas decidi escalar isto em software por 97"). Não dê desconto sem uma "Razão Porquê" forte.

        Destrua a resistência. Gere o Empilhamento de Oferta.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Executa a síntese da Oferta. 
        Este método é chamado pelo 'chief_orchestrator.py'.
        """
        print(f"    🎯 [GERADOR: OFFER STACK] Desenhando a armadilha psicológica com Persona Mestre...")
        
        prompt = self._build_offer_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA colapsou durante a formulação da oferta.")

                offer_json = json.loads(response.text)
                print("    ✅ Oferta Irresistível empilhada. O Risco foi revertido.")
                
                # Formatando a saída padronizada para o Orquestrador
                return {
                    "status": "success",
                    "asset_type": "offer_stack",
                    "copy_body": offer_json.get("the_stack_presentation", ""),
                    "structured_data": offer_json, # Devolvemos o JSON quebrado para o Frontend poder montar botões/grids
                    "ai_reasoning": f"Ancorou o valor em ${offer_json.get('price_anchoring', {}).get('total_value', 'Alto')} e usou a garantia {offer_json.get('insane_guarantee', {}).get('name')} para matar o risco."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Erro de cálculo de ancoragem: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Ofertas falhou ao encontrar uma matemática lucrativa."
        }

# =====================================================================
# BLOCO DE TESTE (Mockado)
# =====================================================================
if __name__ == "__main__":
    # Teste isolado para provar a letalidade do código
    dummy_brand = {
        "persona": {"pain_and_friction": {"failed_solutions": "Já gastaram fortunas em gestores de tráfego que não deram ROI."}},
        "cult": {"lexicon": {"us_words": ["Capital Autônomo", "O Algoritmo de Ouro", "Matrix do Tráfego"]}}
    }
    dummy_memory = "Nenhum histórico."
    briefing = "Quero vender o meu Software de Automação de WhatsApp. Preço final: 497 reais."
    
    generator = OfferStackGenerator(db_session=None) # Mock db
    # res = generator.generate(dummy_brand, dummy_memory, briefing)
    # print(json.dumps(res, indent=2, ensure_ascii=False))