# modules/swipefile/cognitive_parser.py
import sys
import os
import time
import json
import google.generativeai as genai
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeAsset, CognitiveAutopsy, CROHeuristic, TacticalIntel
from config.settings import settings

class CognitiveParser:
    """
    O CÓRTEX ANALÍTICO (The Profiler).
    Lê a matéria-prima raspada e extrai a psicologia, a ciência e a tática 
    usando a API do Gemini com Saída Estruturada (JSON).
    """
    def __init__(self):
        self.db = SessionLocal()
        
        # O Córtex Neural
        genai.configure(api_key=settings.AI.GEMINI_KEY_COPY)
        
        # Usamos o Flash 1.5: É extremamente rápido, barato para grandes volumes de texto, 
        # e excelente a seguir esquemas JSON rigorosos.
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )

    def _build_copy_prompt(self, asset_content: str, asset_type: str) -> str:
        """Constrói o Raio-X para peças de Copywriting (VSLs, Emails, Ads)."""
        return f"""
        Você é um Copywriter Sênior de Resposta Direta de Elite (nível Agora Financial).
        Analise a seguinte peça de copy (Tipo: {asset_type}).
        
        Extraia a engenharia reversa e retorne ESTRITAMENTE o seguinte esquema JSON, sem formatação markdown extra:
        {{
            "awareness_level": "Unaware | Problem Aware | Solution Aware | Product Aware | Most Aware",
            "core_emotion": "A emoção primária usada para reter a atenção (ex: Medo, Ganância, FOMO, Injustiça, Esperança)",
            "big_idea": "Resuma a tese central (Big Idea) em apenas UMA frase curta e impactante.",
            "structural_framework": "Qual a estrutura usada? (ex: PAS, Hero's Journey, AIDA, Us vs Them, Story-Lead)",
            "psychological_triggers": ["Array", "com", "até", "5", "gatilhos", "mentais", "usados", "no", "texto"]
        }}

        PEÇA DE COPY:
        {asset_content[:30000]} 
        """

    def process_unparsed_assets(self):
        print("\n🧠 [CÓRTEX ANALÍTICO] Iniciando Autópsia Cognitiva da Base de Dados...")
        
        # Busca peças que ainda não têm autópsia (A Fila de Trabalho)
        # Otimização: Pegamos lotes de 50 para não estourar a memória ou limites da API
        unprocessed_assets = self.db.query(SwipeAsset).filter(
            SwipeAsset.autopsy == None,
            SwipeAsset.cro_heuristics == None
            # Excluímos as táticas de fórum aqui, elas terão um parser diferente se necessário
        ).limit(50).all()

        if not unprocessed_assets:
            print(" 📭 Nenhuma peça nova pendente de análise.")
            return

        print(f" 📂 {len(unprocessed_assets)} peças brutas na fila de dissecação.")
        sucessos = 0

        for asset in unprocessed_assets:
            print(f"  🔍 Analisando: {asset.title_or_hook[:50]}... (ID: {asset.id})")
            
            try:
                # 1. Escolha do Prompt Baseado na Categoria da Peça
                if "CRO" in asset.asset_type or "Scientific" in asset.asset_type:
                    # Rota Científica (Futura implementação para CROHeuristic)
                    print("    ⏭️ Ignorando estudo científico nesta passagem (requer prompt de CRO).")
                    continue
                elif "Forum" in asset.asset_type or "Trench" in asset.asset_type:
                    # Rota de Trincheiras (Futura implementação para TacticalIntel)
                    print("    ⏭️ Ignorando tática de fórum nesta passagem (requer prompt Tático).")
                    continue
                else:
                    # Rota Principal: Copywriting (VSLs, Emails, Ads)
                    prompt = self._build_copy_prompt(asset.clean_content, asset.asset_type)
                    
                    response = self.model.generate_content(prompt)
                    
                    # O Gemini devolve um JSON em string devido à nossa config de MIME type
                    data = json.loads(response.text)
                    
                    # 2. Injeção da Inteligência Relacional
                    autopsy = CognitiveAutopsy(
                        asset_id=asset.id,
                        awareness_level=data.get("awareness_level", "Unknown"),
                        core_emotion=data.get("core_emotion", "Unknown"),
                        big_idea=data.get("big_idea", "Não identificada"),
                        structural_framework=data.get("structural_framework", "Nenhum detectado"),
                        psychological_triggers=data.get("psychological_triggers", [])
                    )
                    
                    self.db.add(autopsy)
                    self.db.commit() # Comita um a um para evitar que uma falha de API quebre todo o lote
                    sucessos += 1
                    print("    ✅ Autópsia concluída e catalogada com sucesso.")
                    
                # Rate limit da API do Gemini (segurança para tier gratuito/básico)
                time.sleep(3)

            except json.JSONDecodeError:
                print("    ❌ Erro: O Gemini não devolveu um JSON válido. Pulando peça.")
            except Exception as e:
                self.db.rollback()
                print(f"    ❌ Erro durante o processamento neural: {e}")

        print(f"\n🏁 [CÓRTEX ANALÍTICO] Ciclo de processamento encerrado.")
        print(f" 🧠 {sucessos} Peças enriquecidas com Metadados Cognitivos e prontas para pesquisa.")
        self.db.close()

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    parser = CognitiveParser()
    parser.process_unparsed_assets()