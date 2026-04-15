# modules/generation/copy_chief/generators/gen_optin.py
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

class OptinGenerator:
    """
    O ARQUITETO DE CAPTURA (Squeeze Page Specialist).
    Focado na conversão extrema (60%+) de visitantes em Leads.
    Utiliza Copy Cega (Blind Copy) e Fascination Bullets para forçar o Opt-in.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE EXAUSTÃO DE CURIOSIDADE (A Anatomia da Captura)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "page_strategy": {
                    "type": "STRING",
                    "description": "A justificativa tática de por que esta página vai converter acima de 50% (O ângulo da Isca Digital)."
                },
                "the_hero_section": {
                    "type": "OBJECT",
                    "properties": {
                        "pre_headline": {"type": "STRING", "description": "Filtro de Audiência (Ex: 'Atenção Agências de Marketing:' ou 'Para quem está cansado de dietas...')."},
                        "main_headline": {"type": "STRING", "description": "A Grande Promessa. O benefício supremo sem a dor suprema (Fórmula: Como [Benefício] sem [Dor])."},
                        "sub_headline": {"type": "STRING", "description": "Aceleração de tempo ou prova de autoridade. (Ex: '...mesmo que você tenha pouco dinheiro, em apenas 14 dias')."}
                    }
                },
                "fascination_bullets": {
                    "type": "ARRAY",
                    "description": "3 a 5 'Blind Bullets'. Devem gerar curiosidade extrema, dizendo O QUÊ o lead vai descobrir, mas NUNCA o COMO.",
                    "items": {"type": "STRING"}
                },
                "conversion_elements": {
                    "type": "OBJECT",
                    "properties": {
                        "cta_button": {"type": "STRING", "description": "Texto do botão em primeira pessoa (Ex: 'Quero Liberar Meu Acesso Gratuito Agora'). NUNCA usar 'Enviar' ou 'Cadastrar'."},
                        "micro_copy_trust": {"type": "STRING", "description": "Texto minúsculo abaixo do botão para quebrar objeção de privacidade (Ex: '100% Gratuito. Odiamo spam tanto quanto você.')."}
                    }
                }
            },
            "required": ["page_strategy", "the_hero_section", "fascination_bullets", "conversion_elements"]
        })

        # Temperature 0.4: Foco em padrões clássicos e testados de conversão em Squeeze Pages.
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

    def _build_optin_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Aquisição de Leads."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Estagnação.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O Método Tradicional.")
        mechanism = ocean.get("category_design", {}).get("new_category_name", "Nosso Novo Mecanismo")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é criar a Copy de uma "Squeeze Page" (Página de Captura) de altíssima conversão.
        O objetivo é fazer o visitante trocar o e-mail dele por uma Isca Digital (Lead Magnet) de forma irracional.

        1. A ISCA DIGITAL (O que estamos dando de graça em troca do lead):
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - O Inimigo que ele quer destruir: {institutional_enemy}
        - O Medo Central dele: {core_fear}
        - O Mecanismo Secreto que vamos revelar: {mechanism}
        - Jargão tribal a ser usado: {us_words}
        - Diretrizes Extras: {json.dumps(parameters)}

        3. TELEMETRIA E HISTÓRICO DE CAPTURA:
        {memory_context}

        DIRETRIZES DE 8 DÍGITOS PARA OPT-IN:
        - BLIND COPY (Copy Cega): É PROIBIDO explicar o método na página. Você apenas atiça a curiosidade. Exemplo: "O truque bizarro de 5 minutos que..."
        - FASCINATION BULLETS: Os bullets devem ser ultra-específicos, muitas vezes citando "Página X" ou "Minuto Y" (Ex: 'O erro fatal revelado no minuto 4 que está destruindo seu ROI...').
        - CLAREZA ABSOLUTA: O visitante tem exatos 3 segundos para ler a Headline e entender o que ganha. 
        - O BOTÃO: O CTA deve representar o "Pote de Ouro". Deve ser escrito na primeira pessoa do singular ("Eu quero...").

        Gere a armadilha de captura perfeita.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Constrói a página de Opt-in. Acionado pelo chief_orchestrator."""
        print(f"    🧲 [GERADOR: OPT-IN PAGE] Desenhando armadilha de curiosidade com Persona Mestre...")
        
        prompt = self._build_optin_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de Opt-in falhou em desenhar a página.")

                optin_json = json.loads(response.text)
                print("    ✅ Página de Captura finalizada. Fascination Bullets armados.")
                
                # Formatação para o FrontEnd
                hero = optin_json.get("the_hero_section", {})
                conversion = optin_json.get("conversion_elements", {})
                
                presentation_body = "=== SQUEEZE PAGE DE ALTA CONVERSÃO (BLIND COPY) ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA: {optin_json.get('page_strategy', '')}\n"
                presentation_body += "="*60 + "\n\n"
                
                presentation_body += f"🎯 [PRE-HEADLINE]: {hero.get('pre_headline')}\n"
                presentation_body += f"🚨 [HEADLINE]: {hero.get('main_headline')}\n"
                presentation_body += f"💡 [SUB-HEADLINE]: {hero.get('sub_headline')}\n\n"
                
                presentation_body += "--- O QUE VOCÊ VAI DESCOBRIR (Fascination Bullets) ---\n"
                for bullet in optin_json.get("fascination_bullets", []):
                    presentation_body += f"✓ {bullet}\n"
                    
                presentation_body += "\n--- ÁREA DE CAPTURA (FORMULÁRIO) ---\n"
                presentation_body += f"📥 [Botão de CTA]: {conversion.get('cta_button')}\n"
                presentation_body += f"🔒 [Micro-Copy]: {conversion.get('micro_copy_trust')}\n"

                return {
                    "status": "success",
                    "asset_type": "optin_page",
                    "copy_body": presentation_body,
                    "structured_data": optin_json, 
                    "ai_reasoning": "Uso de 'Blind Copy' e quebra de objeções instantâneas (Trust Micro-Copy) para maximizar a conversão de tráfego frio em leads qualificados."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Captura: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Opt-in falhou ao desenhar a página de captura."
        }