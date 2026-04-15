# modules/generation/copy_chief/generators/gen_emails.py
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

# A Importação da Alma da Máquina (A Integração Profunda)
from modules.generation.copy_chief.master_persona import EightFigureCopywriterPersona

class PromoEmailGenerator:
    """
    O ARQUITETO DE PROMOÇÃO E LANÇAMENTOS (Direct Promo Specialist).
    Forja campanhas de e-mail de vendas diretas (Lançamentos, Flash Sales, Black Friday).
    Utiliza a estrutura de Ganho (Gain), Lógica (Logic) e Medo de Perder (Fear/FOMO).
    Totalmente integrado à Matriz de Identidade e Memória do Orion.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE EXTRAÇÃO DE CAIXA (GLF Sequence)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "promo_strategy": {
                    "type": "STRING",
                    "description": "Explicação tática do ângulo promocional escolhido para esta venda direta."
                },
                "promo_emails": {
                    "type": "ARRAY",
                    "description": "Sequência exata de e-mails para o lançamento/promoção (Geralmente 3 e-mails: Ganho, Lógica, Escassez).",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "phase": {"type": "STRING", "description": "Fase da Promoção (Ex: 1 - Abertura/Ganho, 2 - Lógica/Objeções, 3 - Fechamento/FOMO)."},
                            "subject_line": {"type": "STRING", "description": "Assunto. Curto, incisivo. Na fase 3 deve conter urgência (Ex: '[fechando] a sua última chance')."},
                            "preview_text": {"type": "STRING", "description": "O snippet de texto para garantir alta taxa de abertura."},
                            "body_html": {
                                "type": "STRING", 
                                "description": "O corpo do e-mail. Focado em CTA direto. Uso de bullets para facilitar a leitura dos bónus."
                            },
                            "urgency_trigger": {
                                "type": "STRING",
                                "description": "O gatilho de escassez injetado neste e-mail específico (Ex: 'Apenas 50 vagas', 'Acaba às 23h59')."
                            }
                        }
                    }
                }
            },
            "required": ["promo_strategy", "promo_emails"]
        })

        # Temperature 0.4: Aqui não queremos devaneios poéticos. 
        # É uma campanha de vendas diretas. Foco em clareza, conversão e matemática.
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

    def _build_promo_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Monetização Direta."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        
        secret_shame = persona.get("jungian_shadow", {}).get("secret_shame", "Sensação de estar perdendo tempo.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é criar uma Sequência Promocional de Vendas Diretas (Lançamento ou Flash Sale) via E-mail.
        O objetivo é causar um pico de faturamento (Cash Injection) nas próximas 48/72 horas.

        1. A OFERTA PROMOCIONAL (O que estamos vendendo hoje):
        {brief}

        2. A BÍBLIA IDENTITÁRIA (A Nossa Doutrina):
        - A Dor/Vergonha Secreta: {secret_shame}
        - Jargão Tribais (Obrigatório usar): {us_words}
        - Instruções Específicas do Cliente: {json.dumps(parameters)}

        3. TELEMETRIA (O que a nossa lista já provou que compra):
        {memory_context}

        DIRETRIZES DA SEQUÊNCIA DE PROMOÇÃO (GLF):
        - E-MAIL 1 (Ganho/Oportunidade): Foque no que a pessoa vai ganhar. Apresente a oferta e ancoragem de preço (por que está tão barato ou qual é o bônus especial).
        - E-MAIL 2 (Lógica/Objeções): Foque na racionalização. Liste os benefícios em bullets. Responda à objeção óbvia ("Mas será que isso serve para mim?").
        - E-MAIL 3 (Medo/Escassez): Foque na dor de ficar de fora (FOMO). O tom deve ser de "ultimato". O carrinho está a fechar.
        
        A formatação do corpo (body_html) deve ser agressiva, com parágrafos curtos, forte apelo visual (uso de negrito em palavras-chave) e chamadas para ação (CTAs) claras.

        Execute o protocolo de faturamento.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Dispara a campanha de vendas no Autoresponder."""
        print(f"    💸 [GERADOR: PROMO EMAILS] Estruturando campanha de injeção de caixa com Persona Mestre...")
        
        prompt = self._build_promo_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Promoção retornou um vácuo.")

                promo_json = json.loads(response.text)
                print("    ✅ Sequência de Vendas Diretas gerada com sucesso.")
                
                # Monta a versão formatada para o FrontEnd
                presentation_body = "=== CAMPANHA PROMOCIONAL DE E-MAILS (GLF SEQUENCE) ===\n\n"
                presentation_body += f"🎯 ESTRATÉGIA DE CONVERSÃO: {promo_json.get('promo_strategy', '')}\n"
                presentation_body += "="*60 + "\n"
                
                for email in promo_json.get("promo_emails", []):
                    presentation_body += f"\n🚨 FASE: {email.get('phase').upper()}\n"
                    presentation_body += f"✉️ Assunto: {email.get('subject_line')}\n"
                    presentation_body += f"👁️ Preview: {email.get('preview_text')}\n"
                    presentation_body += f"⏳ Escassez Injetada: {email.get('urgency_trigger')}\n"
                    presentation_body += f"--- Corpo do E-mail ---\n"
                    
                    clean_body = email.get('body_html', '').replace('<p>', '').replace('</p>', '\n').replace('<br>', '\n')
                    presentation_body += clean_body
                    presentation_body += "\n" + "-"*60 + "\n"

                return {
                    "status": "success",
                    "asset_type": "promo_emails",
                    "copy_body": presentation_body,
                    "structured_data": promo_json, 
                    "ai_reasoning": "Estrutura GLF (Gain, Logic, Fear) aplicada para forçar a decisão de compra num curto espaço de tempo, otimizando a conversão de leads aquecidos."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Lançamentos: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Promoção falhou ao estruturar a campanha."
        }