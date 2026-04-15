# modules/generation/copy_chief/generators/gen_ads_video.py
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

class VideoAdsGenerator:
    """
    O ARQUITETO DE RETENÇÃO (Short-Form Video Specialist).
    Gera roteiros para TikTok, Reels e Shorts focados em Pattern Interrupt (3 segundos).
    Ditando não apenas o que falar, mas como o editor deve cortar o vídeo.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE DOPAMINA (Estrutura de Vídeo Curto)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "video_strategy": {
                    "type": "STRING",
                    "description": "A tese tática. Por que estes roteiros vão parar o scroll (rolagem) do usuário?"
                },
                "video_concepts": {
                    "type": "ARRAY",
                    "description": "3 Variações de Roteiros Curtos (30 a 60 segundos) com ganchos diferentes.",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "concept_name": {
                                "type": "STRING", 
                                "description": "O nome do ângulo (Ex: 'O Paradoxo do Especialista', 'A Fuga da Matriz')."
                            },
                            "the_3_second_hook": {
                                "type": "OBJECT",
                                "properties": {
                                    "visual_action": {"type": "STRING", "description": "O que o ator faz na tela nos primeiros 3s? Deve ser algo estranho, não natural ou em movimento."},
                                    "spoken_audio": {"type": "STRING", "description": "A primeira frase. Curta, polarizadora, quebrando crenças."},
                                    "on_screen_text": {"type": "STRING", "description": "A manchete (hook) escrita que deve aparecer grande na tela."}
                                }
                            },
                            "the_retention_body": {
                                "type": "STRING",
                                "description": "O roteiro do meio (15-30s). Explica a falha do status quo e introduz o Novo Mecanismo de forma hiper-rápida."
                            },
                            "editing_directives": {
                                "type": "STRING",
                                "description": "Instruções pro editor: Jump cuts? Zoom in a cada frase forte? Efeitos sonoros (Swoosh)?"
                            },
                            "the_call_to_action": {
                                "type": "OBJECT",
                                "properties": {
                                    "spoken": {"type": "STRING", "description": "O que o ator manda fazer (Ex: 'Clica no link abaixo antes que saia do ar')."},
                                    "visual_gesture": {"type": "STRING", "description": "Ação física final (Ex: Apontar para baixo, segurar o celular perto da câmera)."}
                                }
                            }
                        }
                    }
                }
            },
            "required": ["video_strategy", "video_concepts"]
        })

        # Temperature 0.6: Criatividade alta para Ganchos Visuais, 
        # mas mantendo a estrutura de conversão travada pelo Schema.
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

    def _build_video_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex Diretor de Câmera."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Fracasso público.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O padrão do mercado.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        mechanism = ocean.get("category_design", {}).get("new_category_name", "O nosso protocolo.")
        
        return f"""
        Sua missão operacional agora é criar 3 Roteiros Letais de Vídeo Curto (TikTok / Reels / YT Shorts) para conversão direta ou captura de leads.

        1. A OFERTA DO VÍDEO (Para onde o link vai):
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - O Inimigo a ser ridicularizado no vídeo: {institutional_enemy}
        - A Dor que o lead tenta esconder: {core_fear}
        - O Mecanismo a ser revelado: {mechanism}
        - Palavras Tribais obrigatórias: {us_words}
        - Filtros Extras: {json.dumps(parameters)}

        3. TELEMETRIA (O que a audiência tolera ou odeia):
        {memory_context}

        DIRETRIZES DO VÍDEO DE 8 DÍGITOS (SHORT-FORM):
        - O HOOK VISUAL: Proibido começar o vídeo dizendo "Oi, eu sou o X". Proibido ator parado numa parede branca. O ator DEVE estar a fazer algo orgânico (Ex: A andar rápido, a fechar a porta do carro, a segurar um copo de café amassado, a rir-se de forma cínica de um tablet).
        - O HOOK DE ÁUDIO: Comece 'In Media Res'. A primeira frase tem que ofender uma crença do mercado.
        - CADÊNCIA: O corpo do vídeo deve ser escrito em frases hiper-curtas de 2 a 3 segundos cada.
        - UGC AESTHETIC: O roteiro deve pedir ao editor que o vídeo pareça ter sido gravado de forma amadora, mas com áudio perfeito. Isso destrói a "guarda" de quem está assistindo anúncios.

        Traga a atenção, retenha por 40 segundos, e feche o clique.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Dispara a geração dos roteiros. Executado pelo chief_orchestrator."""
        print(f"    📱 [GERADOR: VIDEO ADS] Dirigindo câmeras... Calculando ganchos de dopamina com Persona Mestre...")
        
        prompt = self._build_video_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA não conseguiu dirigir o roteiro de vídeo.")

                video_json = json.loads(response.text)
                print("    ✅ Roteiros de TikTok/Reels blindados e prontos para o editor.")
                
                # Renderiza um texto formatado para o FrontEnd (Roteiro de Gravação)
                presentation_body = "=== PACOTE DE ROTEIROS PARA VÍDEOS CURTOS ===\n"
                presentation_body += f"🧠 ESTRATÉGIA: {video_json.get('video_strategy', '')}\n"
                presentation_body += "="*50 + "\n"
                
                for i, concept in enumerate(video_json.get("video_concepts", [])):
                    presentation_body += f"\n🎬 VÍDEO {i+1}: {concept.get('concept_name').upper()}\n"
                    presentation_body += f"--- OS PRIMEIROS 3 SEGUNDOS (O HOOK) ---\n"
                    
                    hook = concept.get('the_3_second_hook', {})
                    presentation_body += f"👁️ Ação do Ator: {hook.get('visual_action', '')}\n"
                    presentation_body += f"🗣️ Áudio (Falar): \"{hook.get('spoken_audio', '')}\"\n"
                    presentation_body += f"🔠 Texto na Tela: [ {hook.get('on_screen_text', '')} ]\n"
                    
                    presentation_body += f"\n--- O CORPO DO VÍDEO (15-30s) ---\n"
                    presentation_body += f"🗣️ Áudio: \"{concept.get('the_retention_body', '')}\"\n"
                    presentation_body += f"✂️ Direção de Edição: {concept.get('editing_directives', '')}\n"
                    
                    presentation_body += f"\n--- O FECHAMENTO (CALL TO ACTION) ---\n"
                    cta = concept.get('the_call_to_action', {})
                    presentation_body += f"🗣️ Áudio Final: \"{cta.get('spoken', '')}\"\n"
                    presentation_body += f"🖐️ Gesto: {cta.get('visual_gesture', '')}\n"
                    presentation_body += "-"*50 + "\n"

                return {
                    "status": "success",
                    "asset_type": "video_ads",
                    "copy_body": presentation_body,
                    "structured_data": video_json, 
                    "ai_reasoning": "Roteiros focados em quebra de padrão visual e auditivo nos primeiros 3s, otimizados para combater a rolagem passiva no TikTok/Reels."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação na Direção do Vídeo: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Vídeo falhou ao estruturar a retenção."
        }

# =====================================================================
# BLOCO DE TESTE (Mockado)
# =====================================================================
if __name__ == "__main__":
    dummy_brand = {
        "persona": {
            "pain_and_friction": {"3am_nightmare": "Não conseguir bater a meta de faturamento e demitir a equipe."},
            "enemy_matrix": {"institutional_enemy": "Os algoritmos do Google que vivem mudando."}
        },
        "cult": {"lexicon": {"us_words": ["Receita Blindada", "Hacker de Crescimento"]}},
        "blue_ocean": {"category_design": {"new_category_name": "Automação Neural de Vendas"}}
    }
    dummy_memory = "Vídeos com o CEO andando funcionam melhor do que vídeos sentados no escritório."
    briefing = "Workshop Gratuito sobre como usar IA para vendas B2B."
    
    generator = VideoAdsGenerator(db_session=None)
    # res = generator.generate(dummy_brand, dummy_memory, briefing)
    # print(json.dumps(res, indent=2, ensure_ascii=False))