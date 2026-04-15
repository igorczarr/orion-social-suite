# modules/generation/copy_chief/generators/gen_big_ideas.py
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

class BigIdeaGenerator:
    """
    O LABORATÓRIO DE ÂNGULOS (Big Idea Specialist).
    Gera Premissas Contraintuitivas e Ângulos de Venda baseados nos Níveis 
    de Consciência de Eugene Schwartz e na escola da Agora Financial.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE EXTRAÇÃO DE BIG IDEAS (Mapeamento de Ângulos)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "market_sophistication_diagnosis": {
                    "type": "STRING",
                    "description": "Qual o nível de sofisticação do mercado atual (Nível 1 a 5 de Schwartz) e por que abordagens diretas não funcionam mais."
                },
                "the_big_ideas": {
                    "type": "ARRAY",
                    "description": "3 a 4 Grandes Ideias (Ângulos) radicalmente diferentes entre si para vender o mesmo produto.",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "angle_name": {
                                "type": "STRING", 
                                "description": "O nome tático da tese (Ex: 'A Traição Institucional', 'O Paradoxo do Esforço', 'A Ameaça Invisível')."
                            },
                            "core_thesis": {
                                "type": "STRING", 
                                "description": "A premissa intelectualmente fascinante em 2 frases. Deve ser contraintuitiva (Ex: 'Não é que você come muito, é que seu corpo foi programado pela indústria para estocar toxinas como gordura')."
                            },
                            "the_villain": {
                                "type": "STRING",
                                "description": "Quem leva a culpa pela dor do cliente nesta tese exata."
                            },
                            "the_unique_mechanism_twist": {
                                "type": "STRING",
                                "description": "Como o produto do cliente se encaixa como a única solução lógica para esta tese específica."
                            },
                            "headline_example": {
                                "type": "STRING",
                                "description": "Uma manchete matadora (Fórmula: Benefício Oculto + Mecanismo + Sem a dor)."
                            },
                            "primary_emotion": {
                                "type": "STRING",
                                "description": "Qual a emoção primária que este ângulo ataca (Ex: Injustiça, Medo, Ganância, Preguiça/Desejo de Atalho)."
                            }
                        }
                    }
                }
            },
            "required": ["market_sophistication_diagnosis", "the_big_ideas"]
        })

        # Temperature 0.7: Para Big Ideas, precisamos de alta latência criativa. 
        # É a fase de "Brainstorming" de Elite.
        # A INJEÇÃO DA ALMA: system_instruction aciona a persona global.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.7, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_big_idea_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Brainstorming Direcionado."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Fracasso.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Sistema.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O Nosso Método")
        
        return f"""
        Sua missão operacional agora é atuar como o "Head de Estratégia" e gerar as "Big Ideas" (As Grandes Ideias) para uma nova campanha.
        Você não vai escrever o copy final agora. Você vai gerar as TESES CONTRAINTUITIVAS que vão sustentar a copy.

        1. O PRODUTO A SER VENDIDO:
        {brief}

        2. A BÍBLIA IDENTITÁRIA DO NOSSO CULTO:
        - O Maior Inimigo: {institutional_enemy}
        - O Medo Central (Onde devemos bater): {core_fear}
        - A Nossa Arma (O Mecanismo Único): {mechanism}
        - Filtros Extras: {json.dumps(parameters)}

        3. TELEMETRIA E HISTÓRICO:
        {memory_context}

        REGRAS PARA UMA BIG IDEA DE 8 DÍGITOS:
        - A Regra da Novidade: O cérebro humano ignora o que já viu. Não pode ser "Como emagrecer", tem que ser "A molécula que destrava o emagrecimento noturno".
        - A Regra da Contraintuição: Diga à audiência que o que eles acreditam ser verdade é, na realidade, a causa do problema deles.
        - Os 4 Grandes Ângulos: Eu quero ideias baseadas nestas emoções: 1 (Medo de perder o que tem), 2 (Ganância de obter lucro rápido), 3 (Raiva/Injustiça contra o sistema), 4 (Preguiça/O caminho mais fácil).
        - Diagnóstico de Sofisticação: Avalie se o mercado está saturado de promessas e se precisaremos focar puramente no "Mecanismo Único".

        Gere os ângulos de ataque. Traga-me as Teses.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """A execução laboratorial. Acionado pelo chief_orchestrator."""
        print(f"    💡 [GERADOR: BIG IDEAS] Entrando no Laboratório... Destilando premissas de alta conversão...")
        
        prompt = self._build_big_idea_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Ideias colapsou e não trouxe as teses.")

                ideas_json = json.loads(response.text)
                print("    ✅ Big Ideas Forjadas. A fundação intelectual da campanha está pronta.")
                
                # Monta a versão formatada para o FrontEnd (Apresentação Estratégica)
                presentation_body = "=== MAPA ESTRATÉGICO DE BIG IDEAS ===\n\n"
                presentation_body += f"📊 DIAGNÓSTICO DO MERCADO (Eugene Schwartz):\n{ideas_json.get('market_sophistication_diagnosis', '')}\n"
                presentation_body += "="*60 + "\n"
                
                for i, idea in enumerate(ideas_json.get("the_big_ideas", [])):
                    presentation_body += f"\n💡 ÂNGULO {i+1}: {idea.get('angle_name').upper()} (Emoção Alvo: {idea.get('primary_emotion')})\n"
                    presentation_body += f"⚠️ Tese Central: {idea.get('core_thesis')}\n"
                    presentation_body += f"🦹 O Vilão: {idea.get('the_villain')}\n"
                    presentation_body += f"🔑 A Virada do Mecanismo: {idea.get('the_unique_mechanism_twist')}\n"
                    presentation_body += f"📰 Exemplo de Manchete: \"{idea.get('headline_example')}\"\n"
                    presentation_body += "-"*60 + "\n"

                return {
                    "status": "success",
                    "asset_type": "big_ideas",
                    "copy_body": presentation_body,
                    "structured_data": ideas_json, 
                    "ai_reasoning": "Geração de múltiplos ângulos focada em contraintuição e emoções primitivas, ideal para testes A/B na fundação da campanha."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Brainstorming: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Big Ideas falhou ao estabelecer uma premissa lógica."
        }

# =====================================================================
# BLOCO DE TESTE (Mockado)
# =====================================================================
if __name__ == "__main__":
    dummy_brand = {
        "persona": {
            "pain_and_friction": {"3am_nightmare": "Passar a vida inteira a trabalhar para os outros e nunca enriquecer."},
            "enemy_matrix": {"institutional_enemy": "Bancos e corretoras que cobram taxas ocultas."}
        },
        "cult": {"lexicon": {"us_words": ["Patrimônio Soberano", "A Fuga da Matrix", "Capital Anônimo"]}},
        "blue_ocean": {"category_design": {"new_category_name": "Protocolo de Arbitragem Oculta"}}
    }
    dummy_memory = "Abordagens de 'Fique Rico Rápido' falham neste público. Eles preferem abordagens de 'Proteção de Patrimônio e Raiva contra Bancos'."
    briefing = "Quero vender uma comunidade de investimentos não convencionais e criptografia por $1.000 ao ano."
    
    generator = BigIdeaGenerator(db_session=None)
    # res = generator.generate(dummy_brand, dummy_memory, briefing)
    # print(json.dumps(res, indent=2, ensure_ascii=False))