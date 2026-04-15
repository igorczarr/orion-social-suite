# modules/generation/identity/gen_brand_dossier.py
import sys
import os
import json
from typing import Dict, Any
import google.generativeai as genai
from google.generativeai.types import content_types
from sqlalchemy.orm import Session

# Ajuste de PATH Sênior
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from config.settings import settings
from database.models import Tenant, BrandDossier

class BrandDossierGenerator:
    """
    O ARQUITETO DE TRIBOS (Brand & Cult Onboarding Specialist).
    Faz engenharia reversa de um produto comum para criar um Ecossistema de Marca
    baseado em Psicanálise Junguiana, Inimigo Comum e Design de Categoria (Oceano Azul).
    Esta é a Bíblia que alimenta todo o Copy Chief.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_CMO
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_COPY
            
        genai.configure(api_key=self.api_key)
        
        # A MATRIZ DE DECODIFICAÇÃO DE MARCA (O DNA do Sistema)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "persona_profile": {
                    "type": "OBJECT",
                    "properties": {
                        "pain_and_friction": {
                            "type": "OBJECT",
                            "properties": {
                                "3am_nightmare": {"type": "STRING", "description": "O pesadelo real que acorda o cliente às 3 da manhã suando frio."},
                                "daily_frustrations": {"type": "STRING", "description": "Micro-dores do dia a dia."}
                            }
                        },
                        "jungian_shadow": {
                            "type": "OBJECT",
                            "properties": {
                                "secret_shame": {"type": "STRING", "description": "Do que ele tem vergonha de admitir em público?"},
                                "dark_desire": {"type": "STRING", "description": "O que ele quer secretamente? (Vingança, status, preguiça)."}
                            }
                        },
                        "enemy_matrix": {
                            "type": "OBJECT",
                            "properties": {
                                "institutional_enemy": {"type": "STRING", "description": "O grande vilão do mercado (Ex: Indústria Farmacêutica, O Algoritmo, O Governo)."},
                                "status_quo": {"type": "STRING", "description": "A mentira que o mercado conta e que nós vamos destruir."}
                            }
                        }
                    }
                },
                "cult_branding": {
                    "type": "OBJECT",
                    "properties": {
                        "core_belief": {"type": "STRING", "description": "A crença inabalável da nossa tribo."},
                        "lexicon": {
                            "type": "OBJECT",
                            "properties": {
                                "us_words": {
                                    "type": "ARRAY", 
                                    "items": {"type": "STRING"},
                                    "description": "5 palavras ou termos sofisticados que só a nossa tribo usa."
                                },
                                "them_words": {
                                    "type": "ARRAY", 
                                    "items": {"type": "STRING"},
                                    "description": "Termos pejorativos para descrever os métodos do Inimigo Institucional."
                                }
                            }
                        },
                        "voice_and_posture": {
                            "type": "OBJECT",
                            "properties": {
                                "tone": {"type": "STRING", "description": "Como escrevemos? (Ex: Cínico e direto, Acolhedor mas firme)."},
                                "forbidden_words": {
                                    "type": "ARRAY", 
                                    "items": {"type": "STRING"},
                                    "description": "Palavras amadoras que JAMAIS devemos usar (Ex: 'Curte e compartilha', 'Prezado', 'Promoção')."
                                }
                            }
                        }
                    }
                },
                "errc_matrix": {
                    "type": "OBJECT",
                    "properties": {
                        "category_design": {
                            "type": "OBJECT",
                            "properties": {
                                "new_category_name": {"type": "STRING", "description": "O Nome do nosso Oceano Azul / Mecanismo Único. Deve soar grandioso e patenteado."},
                                "why_it_makes_competition_irrelevant": {"type": "STRING", "description": "Por que não podem comparar nosso preço com os outros?"}
                            }
                        }
                    }
                }
            },
            "required": ["persona_profile", "cult_branding", "errc_matrix"]
        })

        # A Alma do Estrategista (System Instruction)
        system_instruction = """
        Você é um Estrategista de Marcas de 8 Dígitos, especialista em Design de Categoria e Dinâmicas de Culto (Cult Branding).
        Você não cria 'negócios'. Você cria Movimentos Sociais altamente lucrativos.
        Seu objetivo é pegar um produto ou serviço genérico, analisar a concorrência e o mercado, e forjar uma Identidade de Marca impiedosa.
        Use linguagem visceral, cirúrgica e altamente persuasiva. Não seja genérico. Encontre a 'Sombra Junguiana' (o desejo obscuro e egoísta) do consumidor final.
        """

        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=system_instruction,
            generation_config={
                "temperature": 0.7, # Alta latência para inovação semântica e naming
                "top_p": 0.9,
                "response_mime_type": "application/json",
                "response_schema": self.response_schema 
            }
        )

    def _build_onboarding_prompt(self, brief: str, social_handle: str, competitor: str) -> str:
        """O Córtex de Extração de Essência."""
        return f"""
        Temos um novo cliente na agência. Preciso que você forje a Matriz de Identidade (Brand Dossier) completa para ele.

        DADOS BRUTOS DO CLIENTE:
        1. O que ele vende (Resumo/Briefing): "{brief}"
        2. Conta do cliente (Contexto de nicho): "{social_handle}"
        3. Maior concorrente ou o método tradicional que ele quer destruir: "{competitor}"

        MISSÃO:
        Analise o que este cliente vende. Destile isso até encontrar a dor mais profunda do público-alvo.
        Defina quem é o verdadeiro inimigo. Invente um léxico (vocabulário) para a marca.
        E o mais importante: crie um 'Novo Mecanismo' (Category Design) para que ele deixe de ser comparado com o concorrente citado.
        """

    def generate_and_lock_brand(self, tenant_id: int, brief: str, social_handle: str, competitor: str) -> Dict[str, Any]:
        """
        Executa a Geração e SALVA FISICAMENTE no banco de dados.
        Esta é a ignição que permite o Copy Chief Orchestrator funcionar.
        """
        print(f"\n🧬 [BRAND ARCHITECT] Iniciando Engenharia Reversa de Identidade para Tenant {tenant_id}...")
        
        prompt = self._build_onboarding_prompt(brief, social_handle, competitor)
        
        try:
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("A IA colapsou ao tentar forjar a identidade.")

            dossier_data = json.loads(response.text)
            print("    ✅ DNA da Marca Sintetizado. Extraindo Personas, Culto e Oceano Azul.")
            
            # --- PERSISTÊNCIA NO BANCO DE DADOS ---
            # Verifica se já existe um Dossiê para este Tenant
            existing_dossier = self.db.query(BrandDossier).filter(BrandDossier.tenant_id == tenant_id).first()
            
            if existing_dossier:
                print("    🔄 Dossiê existente encontrado. Sobrescrevendo a matriz...")
                existing_dossier.persona_profile = dossier_data.get("persona_profile")
                existing_dossier.cult_branding = dossier_data.get("cult_branding")
                existing_dossier.errc_matrix = dossier_data.get("errc_matrix")
            else:
                print("    💾 Criando novo Brand Lock no banco de dados...")
                new_dossier = BrandDossier(
                    tenant_id=tenant_id,
                    persona_profile=dossier_data.get("persona_profile"),
                    cult_branding=dossier_data.get("cult_branding"),
                    errc_matrix=dossier_data.get("errc_matrix")
                )
                self.db.add(new_dossier)
                
            self.db.commit()
            print(" 🏆 [BRAND ARCHITECT] Identidade blindada. O Copy Chief agora tem autorização para disparar.")
            
            return {
                "status": "success",
                "message": "Brand Dossier forjado e trancado no banco de dados com sucesso.",
                "data": dossier_data
            }
            
        except Exception as e:
            self.db.rollback()
            print(f" ❌ [FALHA CRÍTICA NO GÊNESIS]: {e}")
            return {
                "status": "error",
                "message": f"Falha ao forjar o Dossiê: {str(e)}"
            }

# =====================================================================
# BLOCO DE TESTE DO GÊNESIS
# =====================================================================
if __name__ == "__main__":
    from database.connection import SessionLocal
    db = SessionLocal()
    
    # Simulação do que acontece logo após o cliente preencher o modal "+ Novo Cliente"
    # architect = BrandDossierGenerator(db)
    # res = architect.generate_and_lock_brand(
    #     tenant_id=1, # Coloque o ID de um tenant válido no seu DB
    #     brief="Vendo consultoria de emagrecimento para mulheres acima de 40 anos que não têm tempo.",
    #     social_handle="@doutor_emagrece",
    #     competitor="Dietas restritivas e academia tradicional"
    # )
    # print(json.dumps(res, indent=2, ensure_ascii=False))