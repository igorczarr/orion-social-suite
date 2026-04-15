# modules/generation/copy_chief/generators/gen_whatsapp_sniper.py
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

class WhatsAppSniperGenerator:
    """
    O ATIRADOR DE ELITE (WhatsApp Closer).
    Gera sequências de fechamento direto 1 a 1 ou para Grupos VIP.
    Foco em mensagens ultra-curtas, gatilhos de prova social em imagem 
    e roteiros de áudio com 'falsa espontaneidade'.
    Agora equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA TÁTICO DE WHATSAPP (Conversa Assíncrona Letal)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "sniper_strategy": {
                    "type": "STRING",
                    "description": "Explicação do ângulo de persuasão usado para fazer o lead responder (O gatilho de curiosidade/FOMO)."
                },
                "the_ping": {
                    "type": "STRING",
                    "description": "Mensagem 1. O 'Quebra-Gelo'. Máximo 2 linhas. O objetivo é fazer o cliente digitar 'Sim' ou perguntar 'Como assim?'. Nunca mandar link aqui."
                },
                "the_audio_script": {
                    "type": "OBJECT",
                    "properties": {
                        "vocal_cues": {"type": "STRING", "description": "Instruções de atuação (Ex: 'Fale rápido, tom de voz baixo como se fosse um segredo, simule barulho de fundo')."},
                        "script": {"type": "STRING", "description": "O roteiro exato do áudio. Máximo 40 segundos falados. Apresenta a oferta irrecusável e mata a principal objeção de forma casual."}
                    }
                },
                "social_proof_drop": {
                    "type": "OBJECT",
                    "properties": {
                        "visual_instruction": {"type": "STRING", "description": "Qual imagem o vendedor deve enviar (Ex: 'Print borrado de uma notificação de PIX' ou 'Print de conversa de aluno elogiando')."},
                        "caption": {"type": "STRING", "description": "Legenda ultra-curta enviada com a imagem. (Ex: 'Olha o que aconteceu com o fulano ontem')."}
                    }
                },
                "the_ultimatum": {
                    "type": "STRING",
                    "description": "A mensagem final de escassez lógica. Fecha a porta. Passa o link de pagamento."
                }
            },
            "required": ["sniper_strategy", "the_ping", "the_audio_script", "social_proof_drop", "the_ultimatum"]
        })

        # Temperature 0.5: Conversacional, orgânico, mas focado na conversão direta.
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

    def _build_sniper_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Fechamento (Closer)."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Continuar estagnado.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        forbidden_words = ", ".join(cult.get("voice_and_posture", {}).get("forbidden_words", ["prezado", "senhor", "oferta", "comprar"]))
        
        return f"""
        Sua missão operacional agora é criar um script de recuperação ou fechamento de vendas implacável para o WhatsApp.
        No WhatsApp, o cliente não lê, ele escaneia. Você precisa parecer um ser humano real, casual, ocupado e de alto valor.

        1. O CONTEXTO DA VENDA:
        {brief}

        2. A NOSSA BÍBLIA IDENTITÁRIA:
        - O Medo que trava o cliente na hora de passar o cartão: {core_fear}
        - O nosso jargão (use para criar intimidade tribal): {us_words}
        - PALAVRAS ESTRITAMENTE PROIBIDAS (Se usar, você falha): {forbidden_words}. Nunca diga 'Olá', 'Bom dia', 'Tudo bem?'.
        - Filtros Extras do Pedido: {json.dumps(parameters)}

        3. TELEMETRIA DO QUE FUNCIONA:
        {memory_context}

        REGRAS DE OURO DO WHATSAPP SNIPER:
        - O 'Ping' (1ª Mensagem) deve ser uma pergunta de resposta rápida. Ex: "Fala [Nome], vi que você tentou acessar o material, travou no pagamento?"
        - O Áudio DEVE conter hesitações. Escreva coisas como "[suspira]", "tipo assim", "cara". Tem que soar 100% improvisado.
        - Não seja carente. A postura é: "A oportunidade está aqui, eu estou indo embora, você vem ou fica?"
        - Aja de forma casual, como se estivesse mandando mensagem para um amigo.

        Monte o protocolo de abordagem Sniper.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Dispara a sequência de abordagem no WhatsApp."""
        print(f"    📱 [GERADOR: WA SNIPER] Armando o roteiro de fechamento 1x1 com Persona Mestre...")
        
        prompt = self._build_sniper_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA vacilou e não gerou o script de vendas.")

                sniper_json = json.loads(response.text)
                print("    ✅ Protocolo Sniper armado. Gatilhos de Áudio e Texto prontos.")
                
                # Monta a versão formatada para o FrontEnd (fácil leitura para a equipa comercial)
                presentation_body = "=== SCRIPT DE FECHAMENTO (WHATSAPP SNIPER) ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA: {sniper_json.get('sniper_strategy', '')}\n"
                presentation_body += "-"*50 + "\n\n"
                
                presentation_body += f"💬 MENSAGEM 1 (O Quebra-Gelo / Enviar como Texto):\n"
                presentation_body += f"{sniper_json.get('the_ping', '')}\n\n"
                
                presentation_body += f"🎙️ MENSAGEM 2 (O Áudio Espontâneo):\n"
                audio = sniper_json.get('the_audio_script', {})
                presentation_body += f"[Direção de Voz: {audio.get('vocal_cues', '')}]\n"
                presentation_body += f"Texto: \"{audio.get('script', '')}\"\n\n"
                
                presentation_body += f"📸 MENSAGEM 3 (O Gatilho Visual / Enviar Imagem + Legenda):\n"
                proof = sniper_json.get('social_proof_drop', {})
                presentation_body += f"[Imagem a Enviar: {proof.get('visual_instruction', '')}]\n"
                presentation_body += f"Legenda: \"{proof.get('caption', '')}\"\n\n"
                
                presentation_body += f"⏳ MENSAGEM 4 (O Ultimato / Enviar como Texto + Link):\n"
                presentation_body += f"{sniper_json.get('the_ultimatum', '')}\n"

                return {
                    "status": "success",
                    "asset_type": "whatsapp_sniper",
                    "copy_body": presentation_body,
                    "structured_data": sniper_json, 
                    "ai_reasoning": "Roteiro baseado em falsa espontaneidade e micro-compromissos para evitar bloqueio e forçar a resposta."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex Sniper: {e}")
                
        return {
            "status": "error",
            "message": "O Atirador de Elite falhou ao alinhar os gatilhos no WhatsApp."
        }