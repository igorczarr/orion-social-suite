# modules/generation/copy_chief/generators/gen_webinar.py
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

class WebinarGenerator:
    """
    O ARQUITETO DE WEBINARS (Live Event & Pitch Specialist).
    Gera roteiros para eventos ao vivo ou gravados (Evergreen).
    Focado em Doutrinação, Quebra de Objeções em tempo real e Pitch de Alta Tensão.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DO PITCH MESTRE (Estrutura de Webinar de 60-90 min)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "webinar_strategy": {
                    "type": "STRING",
                    "description": "A tese do evento. Como vamos quebrar a maior crença limitante da audiência nos primeiros 15 minutos?"
                },
                "script_sections": {
                    "type": "OBJECT",
                    "properties": {
                        "1_the_hook_and_promise": {
                            "type": "STRING", 
                            "description": "Os primeiros 5-10 min. A promessa do que será revelado e o suborno para ficarem até ao fim."
                        },
                        "2_the_authority_bond": {
                            "type": "STRING", 
                            "description": "História de Origem focada em vulnerabilidade e descoberta do Mecanismo Único. Por que devem ouvi-lo."
                        },
                        "3_the_content_indoctrination": {
                            "type": "STRING", 
                            "description": "O 'Conteúdo'. Não é uma aula, é a destruição do método antigo. Apresentação dos 3 segredos que provam que o nosso método é o único que funciona."
                        },
                        "4_the_transition_to_pitch": {
                            "type": "STRING", 
                            "description": "O momento da 'Permissão'. Como passar do conteúdo para a venda sem baixar a energia da sala."
                        },
                        "5_the_full_offer_stack": {
                            "type": "STRING", 
                            "description": "Apresentação do Produto + Bónus + Garantia Condicional. O momento de empilhar o valor até parecer absurdo."
                        },
                        "6_the_q_and_a_objection_crusher": {
                            "type": "STRING", 
                            "description": "Roteiro para perguntas e respostas. Como transformar dúvidas comuns em motivos para comprar agora."
                        }
                    }
                },
                "interaction_prompts": {
                    "type": "ARRAY",
                    "description": "Comandos para o chat. Como manter a audiência digitando para aumentar o engajamento e a prova social.",
                    "items": {"type": "STRING"}
                },
                "visual_slides_guide": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Diretrizes de que imagens ou frases devem estar no slide em cada fase para reforçar a autoridade."
                }
            },
            "required": ["webinar_strategy", "script_sections", "interaction_prompts", "visual_slides_guide"]
        })

        # Temperature 0.6: Equilíbrio entre storytelling cativante e rigor lógico no pitch.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.6, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_webinar_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Doutrinação ao Vivo."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        secret_shame = persona.get("jungian_shadow", {}).get("secret_shame", "Fracasso escondido.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Sistema.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O Nosso Protocolo")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é criar o roteiro mestre para um Webinar (Evento ao Vivo) de altíssima conversão.
        O objetivo não é apenas ensinar; é transformar a audiência em seguidores do {mechanism}.

        1. O PRODUTO QUE SERÁ VENDIDO NO PITCH FINAL:
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - O Inimigo a ser desmascarado: {institutional_enemy}
        - A Vergonha Secreta que o lead sente e que vamos curar: {secret_shame}
        - O Mecanismo de Salvação: {mechanism}
        - Jargões do Culto: {us_words}
        - Diretrizes Extras: {json.dumps(parameters)}

        3. TELEMETRIA E HISTÓRICO:
        {memory_context}

        REGRAS DE OURO DO WEBINAR DE 8 DÍGITOS:
        - O CONTEÚDO É A VENDA: Cada 'dica' dada deve, secretamente, provar que o seu produto é necessário.
        - A TRANSIÇÃO: Use a técnica do "Caminho Curto vs Caminho Longo". Mostre que eles podem tentar sozinhos (Longo) ou usar o seu {mechanism} (Curto).
        - INTERAÇÃO: Crie momentos onde o mestre pede para digitarem "EU QUERO" ou "CHEGA" no chat para ancorar a emoção.
        - A GARANTIA: Deve ser apresentada como um desafio de confiança mútua.

        Gere o roteiro completo. Transforme espectadores em compradores.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Gera o roteiro de webinar. Acionado pelo chief_orchestrator."""
        print(f"    🎤 [GERADOR: WEBINAR] Orquestrando o evento ao vivo com Persona Mestre...")
        
        prompt = self._build_webinar_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Webinar falhou ao estruturar o evento.")

                webinar_json = json.loads(response.text)
                print("    ✅ Roteiro de Webinar finalizado. O palco está pronto.")
                
                # Formatação para o FrontEnd
                sections = webinar_json.get("script_sections", {})
                presentation_body = "=== ROTEIRO MESTRE PARA WEBINAR / EVENTO AO VIVO ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA DO EVENTO: {webinar_json.get('webinar_strategy', '')}\n"
                presentation_body += "="*60 + "\n\n"
                
                for key in sorted(sections.keys()):
                    title = key.replace("_", " ").title()[2:]
                    presentation_body += f"[{title.upper()}]\n{sections[key]}\n\n"
                
                presentation_body += "--- COMANDOS PARA O CHAT (INTERAÇÃO) ---\n"
                for i, cmd in enumerate(webinar_json.get("interaction_prompts", [])):
                    presentation_body += f"💬 Interação {i+1}: {cmd}\n"
                
                presentation_body += "\n--- GUIA DE SLIDES (VISUAL) ---\n"
                for i, slide in enumerate(webinar_json.get("visual_slides_guide", [])):
                    presentation_body += f"🖼️ Slide {i+1}: {slide}\n"

                return {
                    "status": "success",
                    "asset_type": "webinar_script",
                    "copy_body": presentation_body,
                    "structured_data": webinar_json, 
                    "ai_reasoning": "Aplicação de Doutrinação Narrativa e Inversão de Autoridade para conversão de audiência fria/morna em compradores de ticket médio/alto."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex do Webinar: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Webinar falhou ao estruturar o roteiro do evento."
        }