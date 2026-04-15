# modules/brand_lock/persona_engineer.py
import sys
import os
import json
import re
from typing import Dict, Any, List
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.models import Tenant, SocialInsight
from config.settings import settings

class PersonaEngineer:
    """
    MOTOR 1 (DEFINITIVO): DOXXING PSICOLÓGICO & PERFILAMENTO TÁTICO.
    Utiliza amostragem ponderada de dores sociais e frameworks de psicanálise
    (Sombras de Jung, Mapa de Empatia, Job-to-be-Done) para forjar a Persona.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        # A chave designada para este fim, conforme a vossa arquitetura
        self.api_key = settings.AI.GEMINI_KEY_SOCIOLOGO
        if not self.api_key or self.api_key == ".":
            raise ValueError("🛑 [CRÍTICO] GEMINI_KEY_SOCIOLOGO não configurada no .env.")
            
        genai.configure(api_key=self.api_key)
        
        # O Gemini 1.5 Pro é mandatário aqui. Modelos menores alucinam em psicologia complexa.
        # Ajustamos a temperature para 0.4: Equilíbrio perfeito entre análise lógica (0.0) e intuição empática (0.8).
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={
                "temperature": 0.4,
                "top_p": 0.9,
                "response_mime_type": "application/json"
            }
        )

    def _extract_numeric_intensity(self, intensity_str: str) -> int:
        """Limpa strings como '1.5k', '100 likes' para ordenação matemática real."""
        if not intensity_str: return 0
        try:
            clean_str = str(intensity_str).lower().replace(',', '.')
            if 'k' in clean_str:
                num = float(re.sub(r'[^0-9.]', '', clean_str))
                return int(num * 1000)
            if 'm' in clean_str:
                num = float(re.sub(r'[^0-9.]', '', clean_str))
                return int(num * 1000000)
            return int(re.sub(r'[^0-9]', '', clean_str))
        except:
            return 0

    def _prepare_social_data(self, tenant_id: int) -> str:
        """
        [SÊNIOR] Não injetamos tudo cega-mente. Lemos o banco, ordenamos pelo
        peso matemático da dor (intensidade/likes) e pegamos o "Top 1%".
        """
        raw_insights = self.db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant_id).all()
        
        if not raw_insights:
            return "NENHUM DADO SOCIAL ESPECÍFICO COLETADO. BASEAR-SE NA HEURÍSTICA DE MERCADO DA IA."

        # Adiciona a intensidade numérica calculada para ordenar
        scored_insights = []
        for insight in raw_insights:
            score = self._extract_numeric_intensity(insight.intensity)
            scored_insights.append((score, insight))

        # Ordena dos comentários mais curtidos (maior dor coletiva) para os menores
        scored_insights.sort(key=lambda x: x[0], reverse=True)
        
        # Pega as 100 maiores dores (limite seguro de tokens com densidade máxima)
        top_insights = scored_insights[:100]
        
        formatted_text = []
        for score, insight in top_insights:
            origem = f"[{insight.platform} - {insight.category.upper()}]"
            peso = f"(Poder de Validação: {score} pessoas concordam)"
            formatted_text.append(f"{origem} {peso}: \"{insight.quote}\"")
            
        return "\n".join(formatted_text)

    def _build_psychological_prompt(self, tenant_context: str, social_data: str) -> str:
        """O Córtex do Interrogatório. Aplica Jung, Maslow e Job-to-be-Done."""
        return f"""
        Você é um Profiler Comportamental de Elite do FBI, especialista em Psicanálise de Jung, 
        Economia Comportamental (Kahneman) e Copywriting de Resposta Direta de Wall Street.
        
        Sua missão é realizar o "Doxxing Psicológico" da audiência alvo baseando-se 
        nos desabafos e dores coletadas da internet. Não crie uma "buyer persona" amadora de agência. 
        Crie um Raio-X sombrio, cru e brutalmente honesto sobre quem essas pessoas realmente são quando ninguém está olhando.

        CONTEXTO DO PROJETO (EMPRESA):
        {tenant_context}

        EVIDÊNCIAS DE CAMPO (DESABAFOS, DORES E CONFISSÕES DA AUDIÊNCIA):
        {social_data}

        Retorne ESTRITAMENTE um JSON válido com a estrutura exata abaixo, sem explicações adicionais:
        {{
            "psychographics": {{
                "identity_narrative": "A mentira que eles contam a si mesmos todos os dias para suportar a vida atual.",
                "jargon_and_slang": ["Array", "com", "palavras", "e", "gírias", "exatas", "que", "eles", "usam"]
            }},
            "jungian_shadow": {{
                "secret_shame": "A humilhação diária que eles escondem da própria família (O que os faz sentir inúteis).",
                "primal_desire": "O desejo obscuro (Ex: Não é 'saúde', é 'fazer o ex sentir inveja')."
            }},
            "enemy_matrix": {{
                "internal_enemy": "A falha de caráter que eles sabem que têm, mas não admitem (Ex: Preguiça, procrastinação).",
                "external_enemy": "O vilão tangível que eles culpam (Ex: O chefe, a esposa, o vizinho rico).",
                "institutional_enemy": "O sistema invisível contra o qual eles lutam (Ex: A indústria farmacêutica, o governo, a genética)."
            }},
            "pain_and_friction": {{
                "3am_nightmare": "O pensamento específico que lhes dá um suor frio às 3 da manhã.",
                "failed_solutions": "Por que eles acham que tudo o que tentaram antes foi uma farsa?"
            }},
            "job_to_be_done": "O que eles estão REALMENTE a tentar 'contratar' quando compram neste nicho? (Ex: Não compram um Rolex para ver as horas, compram status e poder)."
        }}
        """

    def _clean_json_response(self, text: str) -> str:
        """Limpa formatações Markdown que o LLM possa alucinar em torno do JSON."""
        clean_text = text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        return clean_text.strip()

    def engineer_persona(self, tenant_id: int) -> Dict[str, Any]:
        """Executa a síntese de identidade da Persona com proteção contra falhas."""
        print(f"\n🧠 [PERSONA ENGINEER] Iniciando Engenharia Comportamental para Tenant: {tenant_id}...")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            print(" ❌ [CRÍTICO] Operação abortada: Tenant não encontrado.")
            return {}

        tenant_context = f"Nicho Primário: {tenant.niche}\nPalavras-Chave de Busca: {tenant.keywords}"
        social_data = self._prepare_social_data(tenant_id)
        
        prompt = self._build_psychological_prompt(tenant_context, social_data)
        
        print(" ⏳ Processando Dossiê Psicológico no Córtex Neural (Gemini 1.5 Pro)...")
        
        # Sistema de Retry (Resiliência) para evitar falhas de rede da API
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA retornou um corpo vazio.")

                clean_json_str = self._clean_json_response(response.text)
                persona_json = json.loads(clean_json_str)
                
                print(" ✅ Dossiê Psicológico Compilado e Validador com Sucesso.")
                return persona_json
                
            except json.JSONDecodeError as e:
                print(f" ⚠️ [Tentativa {attempt + 1}/{max_retries}] Erro de decodificação JSON do Gemini. Tentando novamente...")
            except Exception as e:
                print(f" ⚠️ [Tentativa {attempt + 1}/{max_retries}] Falha de API ou Conexão: {e}")
                
        print(" ❌ [FALHA CATASTRÓFICA] O Córtex Neural não conseguiu processar a Persona após 3 tentativas.")
        return {}

# =====================================================================
# BLOCO DE TESTE (Isolado)
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db, SessionLocal
    init_db()
    
    with SessionLocal() as db:
        engineer = PersonaEngineer(db)
        # Teste com Tenant 1
        # resultado = engineer.engineer_persona(tenant_id=1)
        # print(json.dumps(resultado, indent=2, ensure_ascii=False))