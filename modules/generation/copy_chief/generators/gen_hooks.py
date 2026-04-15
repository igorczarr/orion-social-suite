# modules/generation/copy_chief/generators/gen_hooks.py
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

class HooksGenerator:
    """
    O ENGENHEIRO DE ATENÇÃO (Hook & Pattern Interrupt Specialist).
    Focado única e exclusivamente em criar os primeiros 3 segundos de vídeos 
    ou as primeiras 2 linhas de texto. Especialista em roubar atenção.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE INTERRUPÇÃO DE PADRÃO (Matriz de Ganchos)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "hook_strategy": {
                    "type": "STRING",
                    "description": "A justificativa psicológica de por que estes ganchos vão parar a rolagem infinita do usuário."
                },
                "hook_categories": {
                    "type": "ARRAY",
                    "description": "Categorias de ganchos (Ex: 'O Contraintuitivo', 'Ameaça/Medo', 'Curiosidade Pura', 'Prova Social Inesperada').",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "category_name": {"type": "STRING"},
                            "hooks": {
                                "type": "ARRAY",
                                "description": "Lista de 3 a 4 ganchos práticos dentro desta categoria.",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "text_hook": {
                                            "type": "STRING", 
                                            "description": "A frase falada (vídeo) ou escrita (texto). Tem que ser um soco no estômago verbal em menos de 10 palavras."
                                        },
                                        "visual_action": {
                                            "type": "STRING", 
                                            "description": "Ação visual para acompanhar (se for vídeo). Ex: 'Limpar a lente da câmera', 'Bater na mesa'."
                                        },
                                        "psychological_trigger": {
                                            "type": "STRING", 
                                            "description": "Por que o cérebro humano não consegue ignorar isto? (Ex: Dissonância cognitiva, FOMO)."
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "required": ["hook_strategy", "hook_categories"]
        })

        # Temperature 0.8: Alta criatividade. Ganchos precisam de ser bizarros, chocantes e novos.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=EightFigureCopywriterPersona.get_system_instruction(),
            generation_config={
                "temperature": 0.8, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_hook_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Sequestro de Atenção."""
        
        persona = brand_identity.get("persona", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Estagnação.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Método Tradicional.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "Nosso Novo Mecanismo")
        
        return f"""
        Sua missão operacional agora é atuar como o Engenheiro de Atenção e gerar uma bateria massiva de "Hooks" (Ganchos).
        Você não vai escrever a copy inteira. Vai criar apenas os 3 primeiros segundos (ou as 2 primeiras linhas de texto) para testarmos diferentes ângulos.

        1. O CONTEXTO DA MENSAGEM:
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - O Inimigo: {institutional_enemy}
        - O Medo Central: {core_fear}
        - O Foco de Salvação: {mechanism}
        - Filtros Extras: {json.dumps(parameters)}

        3. TELEMETRIA E HISTÓRICO:
        {memory_context}

        REGRAS DE OURO DOS HOOKS DE ALTA RETENÇÃO:
        - CONTRAINTUIÇÃO: Apele para o oposto do que o mercado diz. (Ex: "Fazer exercícios cardiovasculares é o motivo exato pelo qual você está engordando").
        - CURIOSIDADE MÓRBIDA: As pessoas não resistem a ver um desastre ou um segredo exposto.
        - ESPECIFICIDADE DE DADOS: Use números bizarros. Não diga "Muitas pessoas". Diga "92.4% das pessoas".
        - O VISUAL: O gancho visual não pode ser alguém sentado a olhar para a câmara. Tem que ter movimento repentino.

        Gere as matrizes de ganchos. Quebre o padrão.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Calcula as fendas de atenção. Acionado pelo chief_orchestrator."""
        print(f"    🪝 [GERADOR: HOOKS] Engenharia de Atenção iniciada... Sintetizando quebras de padrão com Persona Mestre...")
        
        prompt = self._build_hook_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA colapsou ao gerar os ganchos de atenção.")

                hooks_json = json.loads(response.text)
                print("    ✅ Bateria de Hooks forjada. A cegueira de anúncios será destruída.")
                
                # Formatação para o FrontEnd
                presentation_body = "=== BATERIA DE GANCHOS (ATENÇÃO & RETENÇÃO) ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA MESTRE: {hooks_json.get('hook_strategy', '')}\n"
                presentation_body += "="*60 + "\n"
                
                for cat in hooks_json.get("hook_categories", []):
                    presentation_body += f"\n📂 CATEGORIA: {cat.get('category_name').upper()}\n"
                    presentation_body += "-"*40 + "\n"
                    
                    for i, hook in enumerate(cat.get("hooks", [])):
                        presentation_body += f"🔥 Gancho {i+1}:\n"
                        presentation_body += f"   🗣️ Fala/Texto: \"{hook.get('text_hook')}\"\n"
                        if hook.get("visual_action"):
                            presentation_body += f"   👁️ Ação Visual: {hook.get('visual_action')}\n"
                        presentation_body += f"   ⚙️ Gatilho: {hook.get('psychological_trigger')}\n\n"

                return {
                    "status": "success",
                    "asset_type": "hooks_matrix",
                    "copy_body": presentation_body,
                    "structured_data": hooks_json, 
                    "ai_reasoning": "Geração massiva de 'Pattern Interrupts' focada em forçar a parada da rolagem infinita via dissonância cognitiva e curiosidade mórbida."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Ganchos: {e}")
                
        return {
            "status": "error",
            "message": "O Engenheiro de Atenção falhou ao sintetizar os ganchos."
        }