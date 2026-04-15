# modules/generation/copy_chief/generators/gen_emails_seinfeld.py
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

class SeinfeldSequenceGenerator:
    """
    O MESTRE DA RETENÇÃO DIÁRIA (Seinfeld Email Specialist).
    Gera e-mails "sobre o nada". Conta uma história banal do dia a dia e faz uma 
    transição (pivot) letal para a oferta. Mantém a lista aquecida e comprando por anos.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE INFOTAINMENT (Entretenimento + Venda)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "campaign_strategy": {
                    "type": "STRING",
                    "description": "Por que estas histórias banais específicas vão conectar com a dor da persona."
                },
                "seinfeld_emails": {
                    "type": "ARRAY",
                    "description": "Um lote de 3 e-mails diários (Broadcasts).",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "email_number": {"type": "INTEGER"},
                            "subject_line": {
                                "type": "STRING", 
                                "description": "Assunto hiper-curioso, bizarro e curto. (Ex: 'meu cachorro comeu a proposta', 'café frio e boletos'). Tudo em minúsculas."
                            },
                            "the_mundane_story": {
                                "type": "STRING", 
                                "description": "Resumo da história banal que inicia o e-mail."
                            },
                            "the_pivot": {
                                "type": "STRING", 
                                "description": "A frase exata de transição que liga a história inútil à venda do produto (O Mecanismo Único)."
                            },
                            "body_html": {
                                "type": "STRING", 
                                "description": "O corpo do e-mail formatado em HTML (<p>). Textos muito curtos, fluidos e divertidos."
                            },
                            "the_ps": {
                                "type": "STRING",
                                "description": "O P.S. (Postscript). A segunda parte mais lida do e-mail. Usar para escassez ou link extra."
                            }
                        }
                    }
                }
            },
            "required": ["campaign_strategy", "seinfeld_emails"]
        })

        # Temperature 0.7: Requer criatividade alta para inventar as histórias mundanas 
        # e fazer o pivot fazer sentido.
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

    def _build_seinfeld_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Infotainment."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Frustração diária.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é escrever um lote de 3 "Seinfeld Emails" (E-mails Diários sobre o nada).
        Você não vai ensinar, dar dicas ou dar aulas. Dicas não vendem. Seu objetivo é entreter o leitor com uma história estúpida/banal do dia a dia e fazer o PIVOT para vender o produto.

        1. O QUE ESTAMOS VENDENDO NO LINK DE HOJE:
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - A Dor que o leitor carrega em silêncio: {core_fear}
        - Nosso jargão de tribo: {us_words}
        - Filtros Extras: {json.dumps(parameters)}

        3. TELEMETRIA (O que nossa lista gosta):
        {memory_context}

        REGRAS DE OURO DOS E-MAILS SEINFELD:
        - A HISTÓRIA: Tem que ser mundana. (Ex: Fui à padaria e o padeiro disse algo estranho; Tropecei na calçada; Assisti a um filme ruim ontem). 
        - O PIVOT: O segredo é ligar a história à dor do cliente. (Ex: "Ver aquele padeiro errar o troco me lembrou de como o seu contador erra os seus impostos... e é por isso que você precisa do meu software...").
        - ESTILO: Ultra casual. Frases de 3 palavras. Sem imagens bonitinhas. Texto puro, como se estivesse a mandar e-mail a um amigo do bar.
        - O CALL TO ACTION: Todo e-mail Seinfeld termina com um link. Sem exceções.

        Gere 3 e-mails para os próximos 3 dias de campanha.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Gera o lote de manutenção diária. Acionado pelo chief_orchestrator."""
        print(f"    ☕ [GERADOR: SEINFELD EMAILS] Criando histórias mundanas e transições de venda com Persona Mestre...")
        
        prompt = self._build_seinfeld_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA falhou em gerar o lote de e-mails diários.")

                seinfeld_json = json.loads(response.text)
                print("    ✅ Lote Seinfeld gerado. Retenção diária garantida.")
                
                # Monta a versão formatada para o FrontEnd
                presentation_body = "=== LOTE DE E-MAILS DIÁRIOS (ESTILO SEINFELD) ===\n\n"
                presentation_body += f"🧠 LÓGICA DO PIVOT: {seinfeld_json.get('campaign_strategy', '')}\n"
                presentation_body += "="*60 + "\n"
                
                for email in seinfeld_json.get("seinfeld_emails", []):
                    presentation_body += f"\n📧 E-MAIL #{email.get('email_number')}\n"
                    presentation_body += f"✉️ Assunto: {email.get('subject_line')}\n"
                    presentation_body += f"☕ A História Banal: {email.get('the_mundane_story')}\n"
                    presentation_body += f"🔀 A Transição (Pivot): {email.get('the_pivot')}\n"
                    presentation_body += f"--- Corpo do E-mail ---\n"
                    
                    clean_body = email.get('body_html', '').replace('<p>', '').replace('</p>', '\n').replace('<br>', '\n')
                    presentation_body += clean_body
                    
                    presentation_body += f"\n\n🔥 P.S.: {email.get('the_ps')}\n"
                    presentation_body += "-"*60 + "\n"

                return {
                    "status": "success",
                    "asset_type": "seinfeld_emails",
                    "copy_body": presentation_body,
                    "structured_data": seinfeld_json, 
                    "ai_reasoning": "Uso de 'Infotainment' (Entretenimento + Informação). Histórias banais abaixam a guarda do lead, e a transição lógica força o clique no link diário sem queimar a lista."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação Criativa nas Histórias: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Retenção falhou ao criar os e-mails diários."
        }