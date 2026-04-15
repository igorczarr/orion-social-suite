# modules/generation/copy_chief/generators/gen_vsl.py
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

class VSLGenerator:
    """
    O ARQUITETO DE VSLs (Video Sales Letter de 8-Dígitos).
    Forja Roteiros Cinematográficos de Alta Tensão baseados no Método RMBC e Empatia Sombria.
    Inclui direções visuais para o Editor de Vídeo.
    Agora equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA CINEMATOGRÁFICO DE CONVERSÃO (Teleprompter Ready)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "vsl_metadata": {
                    "type": "OBJECT",
                    "properties": {
                        "the_big_idea": {"type": "STRING", "description": "A premissa única e contraintuitiva deste vídeo."},
                        "estimated_runtime_minutes": {"type": "INTEGER"}
                    }
                },
                "script_blocks": {
                    "type": "OBJECT",
                    "properties": {
                        "1_the_lead": {
                            "type": "STRING", 
                            "description": "Os primeiros 60 segundos. Pattern Interrupt, Promessa Absurda, Qualificação (quem NÃO deve assistir) e o Open Loop (O Segredo)."
                        },
                        "2_the_status_quo_shatter": {
                            "type": "STRING", 
                            "description": "Ataque frontal ao Inimigo Institucional. Por que tudo o que o mercado ensinou até hoje é uma mentira (A transferência de culpa)."
                        },
                        "3_the_origin_story": {
                            "type": "STRING", 
                            "description": "O fundo do poço. O momento de dor onde o Criador descobriu o Novo Mecanismo (Oceano Azul)."
                        },
                        "4_the_unique_mechanism": {
                            "type": "STRING", 
                            "description": "A revelação científica/lógica do Mecanismo Único. Como ele funciona de forma diferente do mercado."
                        },
                        "5_the_paradigm_shift": {
                            "type": "STRING", 
                            "description": "A epifania final que faz a Persona pensar: 'Se isso é verdade, eu sou obrigado a comprar'."
                        },
                        "6_the_pitch_and_stack": {
                            "type": "STRING", 
                            "description": "Transição suave para o Produto. Ancoragem de preço, apresentação dos Bónus que matam objeções e Garantia Condicional Extrema."
                        },
                        "7_the_crossroads_close": {
                            "type": "STRING", 
                            "description": "O fechamento da encruzilhada (Você tem duas opções...). Escassez lógica e CTA urgente."
                        }
                    }
                },
                "visual_cues": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Instruções críticas (B-Roll) para o editor de vídeo não deixar a tela monótona."
                }
            },
            "required": ["vsl_metadata", "script_blocks", "visual_cues"]
        })

        # Temperature 0.5: Para uma VSL, precisamos de narrativa fluida (Storytelling).
        # A INJEÇÃO DA ALMA: system_instruction aciona a persona global.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.5, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_vsl_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """A Injeção do Vírus Narrativo."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Fracasso total.")
        secret_shame = persona.get("jungian_shadow", {}).get("secret_shame", "Sensação de insuficiência.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Sistema.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O Novo Mecanismo")
        status_quo_illusion = ocean.get("the_status_quo_illusion", "As mentiras do mercado.")
        
        return f"""
        Sua missão operacional agora é escrever um roteiro de vídeo letal (VSL), palavra por palavra, pronto para ser lido no teleprompter.
        Este vídeo fará o espectador sentir-se absolutamente compreendido na sua dor e convencido matematicamente a comprar.

        1. O OBJETIVO DO VÍDEO (Produto/Oferta):
        {brief}

        2. A BÍBLIA DO NOSSO CULTO:
        - A Dor Oculta/Vergonha Secreta da Audiência: {secret_shame}
        - O Inimigo que vamos apedrejar juntos: {institutional_enemy}
        - A Mentira que o mercado conta: {status_quo_illusion}
        - O Nosso Mecanismo de Salvação: {mechanism}
        - O nosso Vocabulário Exclusivo: {us_words}
        - Parâmetros Extras: {json.dumps(parameters)}

        3. TELEMETRIA (O que funciona neste nicho):
        {memory_context}

        REGRAS DE OURO DA VSL DE ELITE:
        - O Roteiro deve usar a técnica de '[B-ROLL: descrição]' no meio do texto para instruir o editor de vídeo. (Ex: "A verdade é que você está cansado [B-ROLL: Homem exausto no escritório]").
        - TRANSFERÊNCIA DE CULPA: Nos blocos iniciais, você DEVE dizer explicitamente à Persona que a culpa dela ter falhado até hoje NÃO É DELA. A culpa é do '{institutional_enemy}'. Ajoelhe-se na empatia.
        - FRASES CURTAS. Fale como um humano respira. Nada de parágrafos académicos.
        - TRANSIÇÃO DE PITCH: O momento de venda não deve parecer uma venda. Deve parecer um "convite para um grupo restrito que tem acesso ao mecanismo".

        Escreva a VSL definitiva. Destrua o status quo.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """A execução da arma de conversão em massa. Acionado pelo chief_orchestrator."""
        print(f"    🎬 [GERADOR: VSL] Rodando as câmeras... Forjando roteiro de alta retenção com Persona Mestre...")
        
        prompt = self._build_vsl_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Roteiro retornou um script em branco.")

                vsl_json = json.loads(response.text)
                print("    ✅ VSL Finalizada. O Teleprompter está carregado.")
                
                # Monta a versão final (Apresentável) para o FrontEnd.
                blocks = vsl_json.get("script_blocks", {})
                presentation_body = "=== SCRIPT DE VSL DE ALTA CONVERSÃO ===\n\n"
                presentation_body += f"💡 BIG IDEA: {vsl_json.get('vsl_metadata', {}).get('the_big_idea', '')}\n"
                presentation_body += f"⏱️ TEMPO ESTIMADO: ~{vsl_json.get('vsl_metadata', {}).get('estimated_runtime_minutes', '')} min\n\n"
                
                # Ordena os blocos pelo nome (que propositadamente tem números 1_, 2_, 3_)
                for key in sorted(blocks.keys()):
                    title = key.replace("_", " ").title()[2:]
                    presentation_body += f"[{title.upper()}]\n{blocks[key]}\n\n"

                return {
                    "status": "success",
                    "asset_type": "vsl",
                    "copy_body": presentation_body,
                    "structured_data": vsl_json, 
                    "ai_reasoning": f"Estrutura linear baseada na destruição do Inimigo Institucional e ancoragem do Mecanismo Único."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Erro na renderização do roteiro: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de VSL falhou ao processar a carga narrativa."
        }