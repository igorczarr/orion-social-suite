# modules/generation/copy_chief/generators/gen_advertorials.py
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

class AdvertorialGenerator:
    """
    O ARQUITETO DE INFILTRAÇÃO (Advertorial & Pre-Sell Specialist).
    Forja artigos que parecem matérias jornalísticas ou relatos científicos.
    Baixa a guarda do leitor, educa sobre o problema e vende o 'clique' para a VSL.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE CAMUFLAGEM (Estrutura Jornalística de Conversão)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "advertorial_metadata": {
                    "type": "OBJECT",
                    "properties": {
                        "article_angle": {"type": "STRING", "description": "O ângulo da notícia (Ex: 'A descoberta científica', 'O escândalo do mercado', 'A nova tendência de Wall Street')."},
                        "fake_author_persona": {"type": "STRING", "description": "Quem supostamente escreveu isso? (Ex: 'Repórter Investigativo de Tecnologia', 'Ex-funcionário da Indústria')."}
                    }
                },
                "the_headline": {
                    "type": "STRING",
                    "description": "A Manchete. Deve parecer 100% com uma notícia bombástica e curiosa, NUNCA com um anúncio."
                },
                "the_subheadline": {
                    "type": "STRING",
                    "description": "O sutiã/linha de apoio da matéria. Reforça a manchete e adiciona credibilidade."
                },
                "article_blocks": {
                    "type": "OBJECT",
                    "properties": {
                        "1_the_lead": {
                            "type": "STRING", 
                            "description": "O parágrafo de abertura. Estabelece o cenário, o escândalo ou a tendência atual de forma neutra/jornalística."
                        },
                        "2_the_problem_agitation": {
                            "type": "STRING", 
                            "description": "Mostra como o 'Inimigo Institucional' está a prejudicar as pessoas (O leitor deve sentir-se a vítima da matéria)."
                        },
                        "3_the_discovery": {
                            "type": "STRING", 
                            "description": "A virada de chave. A introdução do 'Novo Mecanismo' como uma solução bizarra, nova ou polêmica."
                        },
                        "4_the_proof_and_logic": {
                            "type": "STRING", 
                            "description": "Explicação pseudocientífica ou puramente lógica de porquê este mecanismo funciona onde o resto falhou."
                        },
                        "5_the_transition": {
                            "type": "STRING", 
                            "description": "A ponte. 'A nossa equipe tentou entrar em contato com os criadores deste método...' O autor endossa o produto de forma passiva."
                        }
                    }
                },
                "the_bridge_cta": {
                    "type": "OBJECT",
                    "properties": {
                        "cta_text": {"type": "STRING", "description": "O texto do botão/link. (Ex: 'Clique aqui para assistir ao documentário oficial / apresentação enquanto ainda está no ar')."},
                        "urgency_justification": {"type": "STRING", "description": "Por que o leitor tem de clicar agora? (Ex: 'A indústria está a tentar censurar este vídeo')."}
                    }
                },
                "visual_directives": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Instruções de imagens para o designer colocar ao longo do artigo para aumentar a credibilidade (Ex: 'Gráfico em vermelho a cair', 'Foto desfocada de um laboratório')."
                }
            },
            "required": ["advertorial_metadata", "the_headline", "the_subheadline", "article_blocks", "the_bridge_cta", "visual_directives"]
        })

        # Temperature 0.5: Tom sério, jornalístico e persuasivo.
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

    def _build_advertorial_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex do Jornalismo de Resposta Direta."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Fracasso total.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Sistema.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O Novo Mecanismo")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é criar um "Advertorial" (Página de Pré-Venda). 
        Você não é um vendedor agora. Você é o editor de um grande portal de notícias ou blog de nicho. Você está "relatando" uma descoberta chocante.

        1. O OBJETIVO FINAL (Para onde o artigo vai mandar o leitor no final):
        {brief}

        2. A BÍBLIA DO NOSSO CULTO:
        - O Inimigo Institucional (Quem a matéria vai denunciar/expor): {institutional_enemy}
        - O Medo que o leitor tem (A matéria deve provar que esse medo é real): {core_fear}
        - A Solução/Descoberta (O que a matéria vai elogiar no final): {mechanism}
        - Jargões a serem inseridos sutilmente: {us_words}
        - Filtros Extras: {json.dumps(parameters)}

        3. TELEMETRIA (O que funciona neste nicho):
        {memory_context}

        REGRAS DE OURO DO ADVERTORIAL DE ELITE:
        - TOM JORNALÍSTICO: Não diga "Nós criamos o produto X". Diga "Uma pequena empresa de São Paulo acabou de revelar o produto X, e isso está causando pânico na indústria."
        - A CABEÇA DO ARTIGO: O título DEVE soar como uma manchete do G1, UOL ou Forbes. Absolutamente sem cara de anúncio.
        - TERCEIRA PESSOA: Use a terceira pessoa do singular ou plural ("Especialistas afirmam...", "Foi descoberto que...").
        - O CALL TO ACTION: A chamada para ação não é "Compre agora". É "Assista à apresentação completa que detalha esse método". O objetivo do advertorial é vender o CLIQUE para a VSL, não vender o produto em si.

        Escreva a matéria. Camufle a intenção. Venda o clique.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """A execução da página de pré-venda. Acionado pelo chief_orchestrator."""
        print(f"    📰 [GERADOR: ADVERTORIAL] Infiltrando a mensagem... Forjando Cavalo de Troia com Persona Mestre...")
        
        prompt = self._build_advertorial_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Advertorial retornou um texto em branco.")

                adv_json = json.loads(response.text)
                print("    ✅ Advertorial Finalizado. A camuflagem está perfeita.")
                
                # Monta a versão final (Apresentável) para o FrontEnd.
                blocks = adv_json.get("article_blocks", {})
                presentation_body = "=== ADVERTORIAL DE ALTA CONVERSÃO (PRE-SELL) ===\n\n"
                presentation_body += f"📐 ÂNGULO DA MATÉRIA: {adv_json.get('advertorial_metadata', {}).get('article_angle', '')}\n"
                presentation_body += f"✍️ AUTOR FAKE: {adv_json.get('advertorial_metadata', {}).get('fake_author_persona', '')}\n\n"
                
                presentation_body += f"📰 MANCHETE: {adv_json.get('the_headline', '')}\n"
                presentation_body += f"📝 SUBTÍTULO: {adv_json.get('the_subheadline', '')}\n\n"
                
                presentation_body += "--- CORPO DO ARTIGO ---\n"
                for key in sorted(blocks.keys()):
                    presentation_body += f"{blocks[key]}\n\n"

                presentation_body += "--- CALL TO ACTION (A PONTE) ---\n"
                cta = adv_json.get("the_bridge_cta", {})
                presentation_body += f"🔥 Urgência: {cta.get('urgency_justification', '')}\n"
                presentation_body += f"🔗 Botão: [{cta.get('cta_text', '')}]\n\n"
                
                presentation_body += "--- SUGESTÕES VISUAIS PARA O DESIGNER ---\n"
                for i, img_dir in enumerate(adv_json.get("visual_directives", [])):
                    presentation_body += f"📸 Imagem {i+1}: {img_dir}\n"

                return {
                    "status": "success",
                    "asset_type": "advertorial",
                    "copy_body": presentation_body,
                    "structured_data": adv_json, 
                    "ai_reasoning": "Estrutura jornalística aplicada para quebrar a 'cegueira de anúncios' e endossar a oferta via validação de terceiros (Falsa Imparcialidade)."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Erro na renderização do artigo: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Advertorial falhou ao processar a camuflagem."
        }