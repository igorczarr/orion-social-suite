# modules/brand_lock/blue_ocean.py
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

from database.models import Tenant, CompetitorAd
from config.settings import settings

class BlueOceanStrategist:
    """
    MOTOR 3 (MONOPÓLIO DEFINITIVO): A MATRIZ DE OCEANO AZUL & CATEGORY DESIGN.
    Destrói o 'Status Quo' da indústria.
    Força o cliente a não competir, mas a criar uma Nova Categoria de Mercado 
    onde a comparação de preços é psicologicamente impossível.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_CMO
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_SOCIOLOGO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE CATEGORY DESIGN (A Arma de Fogo)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "the_status_quo_illusion": {
                    "type": "STRING", 
                    "description": "A grande mentira que a indústria (Oceano Vermelho) conta e que nós vamos desmascarar."
                },
                "errc_matrix": {
                    "type": "OBJECT",
                    "properties": {
                        "eliminate": {
                            "type": "ARRAY", 
                            "items": {"type": "STRING"}, 
                            "description": "As 'Vacas Sagradas'. Práticas que a indústria considera obrigatórias (ex: Reuniões de Vendas, Suporte Humano), mas que nós vamos EXTERMINAR para chocar o mercado."
                        },
                        "reduce": {
                            "type": "ARRAY", 
                            "items": {"type": "STRING"}, 
                            "description": "Fricções padrão que vamos reduzir a níveis microscópicos."
                        },
                        "raise_standard": {
                            "type": "ARRAY", 
                            "items": {"type": "STRING"}, 
                            "description": "O 1% que realmente importa para a Persona. O que vamos elevar a um padrão de hiper-luxo/performance absurda?"
                        },
                        "create_mechanism": {
                            "type": "ARRAY", 
                            "items": {"type": "STRING"}, 
                            "description": "O Mecanismo Único. A ferramenta, protocolo ou tecnologia que SÓ NÓS temos e que a concorrência nem sequer consegue copiar rapidamente."
                        }
                    }
                },
                "category_design": {
                    "type": "OBJECT",
                    "properties": {
                        "new_category_name": {
                            "type": "STRING",
                            "description": "O NOME do nosso novo Monopólio. (Ex: Em vez de 'Software de Táxi', somos 'Ride-sharing'). Mínimo 2 e máximo 4 palavras."
                        },
                        "pov_statement": {
                            "type": "STRING",
                            "description": "O nosso Point of View (Ponto de Vista). A tese agressiva que justifica por que a velha categoria morreu e a nossa é o futuro."
                        },
                        "monopoly_claim": {
                            "type": "STRING",
                            "description": "A frase que torna a concorrência matematicamente inútil para o cliente."
                        }
                    }
                }
            },
            "required": ["the_status_quo_illusion", "errc_matrix", "category_design"]
        })

        # Temperature 0.3: Queremos frieza militar. Lógica implacável, sem devaneios poéticos.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={
                "temperature": 0.3, 
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _prepare_competitor_data(self, tenant_id: int) -> str:
        """Extrai as promessas da concorrência para que a IA saiba exatamente o que NÃO FAZER."""
        ads = self.db.query(CompetitorAd).join(CompetitorAd.tracked_profile).filter(
            CompetitorAd.tracked_profile.has(tenant_id=tenant_id)
        ).order_by(CompetitorAd.last_seen_at.desc()).limit(30).all()
        
        if not ads:
            return "ALERTA: Dados locais da concorrência ausentes. IA DEVE USAR A SATURAÇÃO GLOBAL/CLICHÊS DESTE NICHO COMO ALVO A SER DESTRUÍDO."
            
        formatted_ads = [f"- [Inimigo: {ad.tracked_profile.username}] Promete: {ad.hook_text}" for ad in ads]
        return "\n".join(formatted_ads)

    def _build_monopoly_prompt(self, tenant_context: str, competitor_data: str, persona_data: str, cult_data: str) -> str:
        """A Planta Estratégica de Design de Categoria."""
        return f"""
        Você é Peter Thiel (autor de Zero to One) e Christopher Lochhead (mestre em Category Design).
        Sua missão é desenhar um MONOPÓLIO ABSOLUTO para o nosso cliente. A concorrência é irrelevante. Nós não competimos, nós criamos uma nova categoria.

        1. O CONTEXTO DO NOSSO CLIENTE:
        {tenant_context}
        
        2. A DOR DA PERSONA (O que eles realmente odeiam):
        {persona_data}

        3. A NOSSA RELIGIÃO DE MARCA (O Culto que já fundamos):
        {cult_data}

        4. O OCEANO VERMELHO (O que os idiotas da concorrência estão a oferecer hoje):
        {competitor_data}

        INSTRUÇÕES DIRETAS E RUTHLESS:
        - PROIBIDO usar jargões corporativos genéricos (ex: "melhorar suporte", "alta qualidade", "foco no cliente"). Se usar isso, você falhou.
        - Na seção ELIMINAR: Escolha algo que a indústria acha indispensável (uma Vaca Sagrada) e destrua. (Ex: A Tesla eliminou concessionárias de carros; O Cirque du Soleil eliminou animais).
        - Na seção CRIAR: Invente uma abordagem tecnológica ou metodológica (Mecanismo Único) que resolve a dor da Persona de um ângulo que a concorrência nunca pensou.
        - Na seção CATEGORY DESIGN: Nomeie a nova categoria. Ela deve soar como o próximo passo inevitável da evolução do mercado.

        Gere a Matriz do Monopólio.
        """

    def forge_blue_ocean(self, tenant_id: int, persona_json: Dict[str, Any], cult_json: Dict[str, Any]) -> Dict[str, Any]:
        """Gera o Design de Categoria Inquebrável."""
        print(f"\n🌊 [CATEGORY DESIGN] Arquitetando Monopólio Estratégico para Tenant: {tenant_id}...")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            print(" ❌ [CRÍTICO] Tenant não encontrado.")
            return {}

        tenant_context = f"- Indústria/Nicho: {tenant.niche}\n- Keywords de Domínio: {tenant.keywords}"
        competitor_data = self._prepare_competitor_data(tenant_id)
        
        persona_str = json.dumps(persona_json, ensure_ascii=False) if persona_json else "Dores da audiência ausentes."
        cult_str = json.dumps(cult_json, ensure_ascii=False) if cult_json else "Identidade pendente."
        
        prompt = self._build_monopoly_prompt(tenant_context, competitor_data, persona_str, cult_str)
        
        print(" ⏳ Injetando Variáveis de Saturação no Córtex Estratégico (Gemini 1.5 Pro com Schema Enforcement)...")
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("A IA não conseguiu encontrar uma rota para o monopólio.")

                blue_ocean_json = json.loads(response.text)
                
                print(" ✅ Categoria Desenhada. O Oceano Vermelho foi abandonado.")
                return blue_ocean_json
                
            except Exception as e:
                print(f" ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação de Cálculo Estratégico: {e}")
                
        print(" ❌ [FALHA CATASTRÓFICA] Impossível calcular o Monopólio.")
        return {}

# =====================================================================
# BLOCO DE TESTE (Isolado)
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db, SessionLocal
    init_db()
    
    # Exemplo Mockado Brutal para Teste
    dummy_persona = {"core_fear": "Gastam milhares em cursos de tráfego pago e o Meta Ads bloqueia as contas, deixando-os a zero."}
    dummy_cult = {"the_manifesto": {"core_belief": "O tráfego comprado é um imposto cobrado por bilionários. A retenção autônoma é o único ativo real."}}
    
    with SessionLocal() as db:
        strategist = BlueOceanStrategist(db)
        # resultado = strategist.forge_blue_ocean(tenant_id=1, persona_json=dummy_persona, cult_json=dummy_cult)
        # print(json.dumps(resultado, indent=2, ensure_ascii=False))