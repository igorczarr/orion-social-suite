# modules/generation/copy_chief/generators/gen_ads_meta.py
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

class MetaAdsGenerator:
    """
    O ARQUITETO DE ESCALA (Meta Ads Specialist).
    Gera campanhas blindadas contra bloqueios (Copy Oblíqua).
    Foco absoluto em CTR (Click-Through Rate) e quebra de padrão (Pattern Interrupt).
    Agora equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE ESCALA (A Matriz do Gestor de Tráfego)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "compliance_safeguard": {
                    "type": "STRING",
                    "description": "Explicação tática de como a IA evitou gatilhos de bloqueio do algoritmo do Meta ao fazer as promessas."
                },
                "creative_angles": {
                    "type": "ARRAY",
                    "description": "Exatamente 3 variações de anúncios baseados em ângulos psicológicos distintos.",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "angle_name": {
                                "type": "STRING", 
                                "description": "O nome tático do ângulo (Ex: 'A Traição Institucional', 'O Segredo Obscuro', 'Lógica Pura')."
                            },
                            "visual_directive": {
                                "type": "STRING",
                                "description": "Instrução para o Designer/Videomaker. Deve ser Lo-Fi, Nativo, UGC. Evitar cara de 'anúncio de agência'."
                            },
                            "primary_text": {
                                "type": "STRING",
                                "description": "A Copy principal. Começa 'In Media Res'. Usa as palavras sagradas do Culto. Quebra linhas para facilitar leitura em mobile."
                            },
                            "headline": {
                                "type": "STRING",
                                "description": "O título em negrito abaixo da imagem. Máx 5 palavras. Puramente clickbait ético."
                            },
                            "link_description": {
                                "type": "STRING",
                                "description": "Micro-texto sob a headline. Usar para prova social (Ex: '⭐️⭐️⭐️⭐️⭐️ (1.402 avaliações)')."
                            }
                        }
                    }
                }
            },
            "required": ["compliance_safeguard", "creative_angles"]
        })

        # Temperature 0.6: Queremos agressividade criativa para quebrar o padrão do feed.
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

    def _build_ads_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Aquisição de Tráfego."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        ocean = brand_identity.get("blue_ocean", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Medo do fracasso.")
        institutional_enemy = persona.get("enemy_matrix", {}).get("institutional_enemy", "O sistema.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        category_name = ocean.get("category_design", {}).get("new_category_name", "Nosso Mecanismo Único")
        
        return f"""
        Seu objetivo é extrair cliques ultra-qualificados e baratos, destruindo o custo por clique (CPC) da concorrência no Meta Ads.

        1. O QUE ESTAMOS VENDENDO NESTA CAMPANHA:
        {brief}

        2. A IDENTIDADE DO NOSSO CULTO:
        - O Maior Inimigo da Audiência (Ataque isto): {institutional_enemy}
        - O Pesadelo das 3 da manhã deles: {core_fear}
        - O Nome do Nosso Monopólio/Mecanismo: {category_name}
        - Palavras-chave a usar (Léxico): {us_words}
        - Filtros Adicionais: {json.dumps(parameters)}

        3. TELEMETRIA (Memória do que funciona para nós):
        {memory_context}

        MANDAMENTOS DE META ADS DE ELITE:
        - NUNCA use as palavras "Você" e atributos pessoais diretos de forma negativa (Isso dá BAN automático no FB). Ex: Nunca diga "Você está gordo?". Diga "A ciência explica por que as dietas normais colapsam".
        - Aplique 'Marketing Oblíquo'. Faça a pessoa sentir a dor sem ter que apontar o dedo para ela.
        - Não comece o texto com "Atenção" ou perguntas óbvias. Comece com um soco na cara (Uma declaração polêmica).
        - A instrução visual (Visual Directive) NÃO DEVE pedir fotos de banco de imagens (Shutterstock). Peça fotos cruas, prints de bloco de notas, memes ou estética de 'camera de celular tremida'. Isso converte.

        Crie 3 ângulos brutais e prontos para escalar.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Ataque aos Leilões. Executado pelo chief_orchestrator."""
        print(f"    🎯 [GERADOR: META ADS] Extraindo ângulos visuais e copy oblíqua com Persona Mestre...")
        
        prompt = self._build_ads_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de anúncios retornou um vácuo.")

                ads_json = json.loads(response.text)
                print("    ✅ Criativos de Tráfego Pago forjados e blindados contra bloqueio.")
                
                # Renderiza um texto formatado para leitura rápida se o Frontend precisar apenas de texto
                presentation_body = "=== PACOTE DE ANÚNCIOS META ===\n"
                for i, ad in enumerate(ads_json.get("creative_angles", [])):
                    presentation_body += f"\n[Ângulo {i+1}: {ad.get('angle_name')}]\n"
                    presentation_body += f"🎨 Visual: {ad.get('visual_directive')}\n"
                    presentation_body += f"📝 Copy:\n{ad.get('primary_text')}\n"
                    presentation_body += f"🔥 Headline: {ad.get('headline')}\n"
                    presentation_body += f"🔗 Link Desc: {ad.get('link_description')}\n"
                    presentation_body += "-"*40

                return {
                    "status": "success",
                    "asset_type": "meta_ads",
                    "copy_body": presentation_body,
                    "structured_data": ads_json, 
                    "ai_reasoning": ads_json.get("compliance_safeguard", "Operação de tráfego otimizada.")
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Córtex de Anúncios: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Anúncios falhou ao calcular uma rota de extração no Meta."
        }

# =====================================================================
# BLOCO DE TESTE (Mockado)
# =====================================================================
if __name__ == "__main__":
    dummy_brand = {
        "persona": {
            "pain_and_friction": {"3am_nightmare": "Quebrar a empresa e ter que voltar para um emprego CLT humilhante."},
            "enemy_matrix": {"institutional_enemy": "As agências de marketing tradicionais que cobram fee fixo e não entregam ROI."}
        },
        "cult": {"lexicon": {"us_words": ["Growth Hacking Implacável", "Escala Líquida", "Ouro Algorítmico"]}},
        "blue_ocean": {"category_design": {"new_category_name": "Automação de Receita Brutal"}}
    }
    dummy_memory = "Evitar vídeos altamente editados. O último anúncio vencedor foi um print de WhatsApp."
    briefing = "Sessão de consultoria estratégica de 1 hora com o nosso CEO por R$5.000."
    
    generator = MetaAdsGenerator(db_session=None)
    # res = generator.generate(dummy_brand, dummy_memory, briefing)
    # print(json.dumps(res, indent=2, ensure_ascii=False))