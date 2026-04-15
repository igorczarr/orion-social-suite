# modules/generation/copy_chief/generators/gen_emails_soap.py
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

class SoapOperaGenerator:
    """
    O ARQUITETO DE RETENÇÃO (Soap Opera Specialist).
    Forja sequências de e-mail de 5 dias baseadas em 'Alto Drama' e 'Open Loops'.
    O objetivo não é informar; é viciar o leitor na narrativa da marca e vender o Mecanismo Único.
    Agora equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE VÍCIO PSICOLÓGICO (5 Dias de Retenção)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "sequence_strategy": {
                    "type": "STRING",
                    "description": "Explicação da IA de como a narrativa foi dividida para manter o open loop durante os 5 dias."
                },
                "emails": {
                    "type": "ARRAY",
                    "description": "A sequência exata e cronológica de 5 e-mails.",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "day": {"type": "INTEGER", "description": "Dia do funil (1 a 5)."},
                            "subject_line": {"type": "STRING", "description": "Assunto do e-mail. Curto, letras minúsculas, parecendo que foi enviado por um amigo. Nunca com cara de marketing."},
                            "preview_text": {"type": "STRING", "description": "O snippet de texto (pré-visualização) que força a abertura na caixa de entrada."},
                            "psychological_goal": {"type": "STRING", "description": "O objetivo tático deste e-mail específico (Ex: 'Apresentar a Epifania', 'Gerar Urgência')."},
                            "body_html": {
                                "type": "STRING", 
                                "description": "O corpo do e-mail em HTML simples (<p>, <br>, <strong>). Parágrafos de no máximo 2 linhas. Alta legibilidade mobile."
                            },
                            "the_cliffhanger": {
                                "type": "STRING",
                                "description": "O 'Open Loop'. A última frase do e-mail que antecipa o segredo do e-mail de amanhã. (No dia 5, isto vira o CTA final)."
                            }
                        }
                    }
                }
            },
            "required": ["sequence_strategy", "emails"]
        })

        # Temperature 0.6: Queremos storytelling puro, drama e cadência emocional.
        # A INJEÇÃO DA ALMA: system_instruction aciona a persona global.
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

    def _build_soap_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex Narrativo que constrói a Novela."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Frustração invisível.")
        secret_shame = persona.get("jungian_shadow", {}).get("secret_shame", "Vergonha de falhar.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        origin_myth = cult.get("origin_myth", {}).get("the_betrayal", "Quando percebemos a mentira do mercado.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "A Nova Categoria")
        
        return f"""
        Sua missão operacional agora é criar uma "Soap Opera Sequence" de exatos 5 Dias.
        Seu objetivo não é ensinar nada. Ensinar não vende. Seu objetivo é gerar conexão através da vulnerabilidade (A Jornada do Herói) e forçar a compra.

        O PRODUTO A SER VENDIDO NO FINAL DA SEQUÊNCIA:
        {brief}

        A NOSSA BÍBLIA IDENTITÁRIA:
        - A Dor/Vergonha Secreta do Lead: {secret_shame}
        - O Fundo do Poço (A nossa história de origem): {origin_myth}
        - A Revelação (O nosso mecanismo): {mechanism}
        - O nosso jargão: {us_words}
        - Filtros Extras: {json.dumps(parameters)}

        TELEMETRIA DE INBOX:
        {memory_context}

        DIRETRIZES DA SOAP OPERA (OBRIGATÓRIO SEGUIR ESTA ESTRUTURA):
        - DIA 1: 'Set the Stage'. Comece no meio de um momento de Alto Drama. Não diga "obrigado por se inscrever". Diga: "Eu achei que ia perder tudo naquele dia...". Termine avisando que amanhã você conta a história toda.
        - DIA 2: 'High Drama -> Backstory'. Volte no tempo. Explique como você bateu no fundo do poço (conectando com o '{core_fear}' da Persona). Termine dizendo que você descobriu uma luz no fim do túnel, mas vai explicar amanhã.
        - DIA 3: 'A Epifania'. Apresente o nosso Mecanismo ({mechanism}). Diga que o culpado não é o leitor, é o sistema. Faça a ponte de que esse mecanismo é o que está no nosso produto.
        - DIA 4: 'Hidden Benefits'. Mostre como a vida muda aplicando o mecanismo. Prova social. Benefícios ocultos.
        - DIA 5: 'Urgency & CTA'. O último dia da novela. Uma transição lógica para uma oferta irrecusável com escassez real.

        Regra de formatação: Parágrafos minúsculos de 1 a 2 frases para não cansar o leitor no telemóvel.

        Escreva a sequência. Vicie a audiência.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Injeta a sequência no Autoresponder. Chamado pelo Orquestrador Central."""
        print(f"    📧 [GERADOR: SOAP OPERA] Desenhando a armadilha narrativa de 5 dias com Persona Mestre...")
        
        prompt = self._build_soap_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de E-mails não retornou a sequência.")

                soap_json = json.loads(response.text)
                print("    ✅ Soap Opera Forjada. Open Loops ativados para 5 dias.")
                
                # Monta a versão final (Apresentável) para o FrontEnd.
                presentation_body = "=== SEQUÊNCIA DE NOVELA (SOAP OPERA - 5 DIAS) ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA: {soap_json.get('sequence_strategy', '')}\n"
                presentation_body += "="*60 + "\n"
                
                for email in soap_json.get("emails", []):
                    presentation_body += f"\n📧 DIA {email.get('day')} | Objetivo: {email.get('psychological_goal')}\n"
                    presentation_body += f"✉️ Assunto: {email.get('subject_line')}\n"
                    presentation_body += f"👁️ Preview: {email.get('preview_text')}\n"
                    presentation_body += f"--- Corpo do E-mail ---\n"
                    # Remove tags HTML básicas para leitura rápida no terminal/log, 
                    # mas o FrontEnd vai renderizar o HTML usando o JSON original estruturado.
                    clean_body = email.get('body_html', '').replace('<p>', '').replace('</p>', '\n').replace('<br>', '\n')
                    presentation_body += clean_body
                    presentation_body += f"\n\n🔥 CLIFFHANGER (O Gancho): {email.get('the_cliffhanger')}\n"
                    presentation_body += "-"*60 + "\n"

                return {
                    "status": "success",
                    "asset_type": "soap_opera_sequence",
                    "copy_body": presentation_body,
                    "structured_data": soap_json, 
                    "ai_reasoning": "Narrativa sequencial projetada para elevar taxas de abertura usando 'Open Loops' diários e empatia pelo fundo do poço."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação Cognitiva nos E-mails: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Retenção falhou ao criar a carga narrativa."
        }