# modules/brand_lock/cult_branding.py
import sys
import os
import json
from typing import Dict, Any
import google.generativeai as genai
from google.generativeai.types import content_types
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.models import Tenant
from config.settings import settings

class CultBrandingEngineer:
    """
    MOTOR 2 (DEFINITIVO): A ENGENHARIA DE CULTO.
    Transforma a marca numa religião comercial polarizadora.
    Utiliza Structured Outputs nativos para garantir 100% de precisão de esquema JSON.
    Cruza o Dossiê Psicológico da Persona com o framework Primal Branding.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_CMO
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_SOCIOLOGO
            
        genai.configure(api_key=self.api_key)
        
        # O Esquema Rigoroso: Força o Gemini a preencher esta exata estrutura
        # sem alucinações de formatação Markdown.
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "archetypal_matrix": {
                    "type": "OBJECT",
                    "properties": {
                        "primary_archetype": {"type": "STRING"},
                        "shadow_risk": {"type": "STRING", "description": "O que a marca deve evitar tornar-se (Ex: De Sábio para Arrogante)."}
                    }
                },
                "the_manifesto": {
                    "type": "OBJECT",
                    "properties": {
                        "core_belief": {"type": "STRING", "description": "A frase polarizadora. A nossa verdade absoluta."},
                        "the_false_god": {"type": "STRING", "description": "A solução mentirosa que o mercado/concorrência vende."},
                        "the_salvation": {"type": "STRING", "description": "A promessa inquebrável que só nós entregamos."}
                    }
                },
                "origin_myth": {
                    "type": "OBJECT",
                    "properties": {
                        "the_betrayal": {"type": "STRING", "description": "O momento em que percebemos que o sistema (status quo) era uma mentira."},
                        "the_epiphany": {"type": "STRING", "description": "A descoberta do nosso 'Mecanismo Único'."}
                    }
                },
                "lexicon": {
                    "type": "OBJECT",
                    "properties": {
                        "us_words": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "them_words": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "sacred_concepts": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Nomes próprios para os nossos métodos (Ex: 'Mecanismo Orion')."}
                    }
                },
                "polarization": {
                    "type": "OBJECT",
                    "properties": {
                        "the_pagans": {"type": "STRING", "description": "Quem nós repelimos agressivamente da nossa página de vendas."},
                        "the_martyrs": {"type": "STRING", "description": "Quem nós jurámos proteger."}
                    }
                },
                "rituals": {
                    "type": "OBJECT",
                    "properties": {
                        "initiation_ritual": {"type": "STRING", "description": "O que o lead deve fazer no Topo de Funil para provar o seu valor."},
                        "ascension_ritual": {"type": "STRING", "description": "O ritual de quem compra o High-Ticket."}
                    }
                },
                "voice_and_posture": {
                    "type": "OBJECT",
                    "properties": {
                        "cadence": {"type": "STRING"},
                        "forbidden_words": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Palavras que a marca NUNCA dirá (Ex: 'barato', 'fácil')."}
                    }
                }
            },
            "required": ["archetypal_matrix", "the_manifesto", "origin_myth", "lexicon", "polarization", "rituals", "voice_and_posture"]
        })

        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={
                "temperature": 0.5, # Ponto exato entre criatividade e obediência estratégica
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema # A "Malandragem" técnica de Elite
            }
        )

    def _build_cult_prompt(self, tenant_context: str, persona_data: str) -> str:
        """O Código-Fonte da Engenharia de Religião de Marca."""
        return f"""
        Você é o CMO de uma agência de Growth Hacking de Elite (nível Fortune 500).
        Seu trabalho não é fazer "marketing bonito". Seu trabalho é construir um CULTO DE MARCA 
        intransigente, utilizando o framework "Primal Branding" (Patrick Hanlon).

        Temos um cliente com o seguinte contexto base:
        {tenant_context}

        E realizamos o Doxxing Psicológico da nossa Persona (o nosso futuro seguidor):
        {persona_data}

        INSTRUÇÕES DE ENGENHARIA DE CULTO:
        1. A marca é a CURA para o '3am_nightmare' e o 'secret_shame' da Persona.
        2. A marca deve atacar o 'institutional_enemy' ou 'external_enemy' apontado pela Persona. A concorrência é tratada como um "Falso Deus" que manteve a audiência cega.
        3. Polarização: Crie barreiras. Quem não pertence à nossa tribo deve ser repelido ativamente (The Pagans).
        4. O 'Mito de Origem' deve soar como o roubo do fogo de Prometeu. O nosso cliente descobriu o que a indústria estava a esconder.

        Analise os medos da Persona e gere a matriz da Seita de Marca.
        """

    def forge_cult(self, tenant_id: int, persona_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa a síntese do Branding. 
        Garante a criação de um código genético de marca blindado e validado.
        """
        print(f"\n🔥 [CULT BRANDING] Iniciando Engenharia de Religião para Tenant: {tenant_id}...")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            print(" ❌ [CRÍTICO] Falha Tática: Tenant não encontrado no sistema.")
            return {}

        if not persona_json or "jungian_shadow" not in persona_json:
            print(" ❌ [CRÍTICO] Falha Tática: Dossiê Psicológico incompleto ou ausente.")
            return {}

        tenant_context = f"- Indústria/Nicho: {tenant.niche}\n- Vetores de Busca (Keywords): {tenant.keywords}"
        persona_str = json.dumps(persona_json, indent=2, ensure_ascii=False)
        
        prompt = self._build_cult_prompt(tenant_context, persona_str)
        
        print(" ⏳ Injetando Doutrina no Córtex do CMO (Gemini 1.5 Pro com Schema Enforcement)...")
        
        # Como usamos o response_schema nativo, o JSONDecodeError é virtualmente impossível,
        # mas mantemos o retry para lidar com timeouts de rede (HttpErrors).
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA retornou um vácuo doutrinário (Payload vazio).")

                # O output já vem formatado perfeitamente graças ao 'response_schema'
                cult_json = json.loads(response.text)
                
                print(" ✅ Culto Fundado. Código Genético da Marca gravado com precisão matemática.")
                return cult_json
                
            except Exception as e:
                print(f" ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação de Rede Neural: {e}")
                
        print(" ❌ [FALHA CATASTRÓFICA] O Córtex do CMO colapsou após 3 tentativas de conexão.")
        return {}

# =====================================================================
# BLOCO DE TESTE (Isolado)
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db, SessionLocal
    init_db()
    
    dummy_persona = {
      "jungian_shadow": {
        "secret_shame": "Trabalho 12 horas por dia, finjo estar rico na internet, mas a minha conta está no vermelho.",
        "primal_desire": "Destruir a necessidade de aprovação social e ter capital verdadeiro, oculto e líquido."
      },
      "enemy_matrix": {
        "institutional_enemy": "Os gurus de marketing ostentação e o algoritmo que premia dancinhas em vez de substância."
      },
      "pain_and_friction": {
        "3am_nightmare": "Passar a vida inteira a construir o sonho de outra pessoa e morrer anónimo e endividado."
      }
    }
    
    with SessionLocal() as db:
        engineer = CultBrandingEngineer(db)
        # Descomentar para testar o output brutal gerado
        # resultado = engineer.forge_cult(tenant_id=1, persona_json=dummy_persona)
        # print(json.dumps(resultado, indent=2, ensure_ascii=False))