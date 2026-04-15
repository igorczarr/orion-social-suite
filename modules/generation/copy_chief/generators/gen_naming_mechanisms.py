# modules/generation/copy_chief/generators/gen_naming_mechanisms.py
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

class NamingMechanismGenerator:
    """
    O ARQUITETO DE PROPRIEDADE INTELECTUAL (Naming & IP Specialist).
    Gera nomes proprietários (Mecanismos Únicos, Frameworks, Bónus) para 
    transformar commodities em categorias de Monopólio.
    Equipado com o Córtex Mestre de 8 Dígitos.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
        self.api_key = settings.AI.GEMINI_KEY_COPY
        if not self.api_key or self.api_key == ".":
            self.api_key = settings.AI.GEMINI_KEY_CMO
            
        genai.configure(api_key=self.api_key)
        
        # O ESQUEMA DE BLINDAGEM DE PREÇO (Monopólio Semântico)
        self.response_schema = content_types.to_schema({
            "type": "OBJECT",
            "properties": {
                "naming_strategy": {
                    "type": "STRING",
                    "description": "Explicação tática de por que estas palavras exatas aumentam o valor percebido e blindam contra comparação de preços."
                },
                "the_unique_mechanism": {
                    "type": "ARRAY",
                    "description": "3 Opções de nome para o motor/segredo do produto. (Ex: Em vez de 'Dieta', 'Janela de Quebra Metabólica').",
                    "items": {"type": "STRING"}
                },
                "the_proprietary_framework": {
                    "type": "ARRAY",
                    "description": "3 Opções de nome para o passo a passo/método. (Ex: 'A Matriz de 4 Fases', 'O Loop de Dopamina').",
                    "items": {"type": "STRING"}
                },
                "tribe_identifiers": {
                    "type": "ARRAY",
                    "description": "3 Opções de nomes para como chamaremos os clientes/alunos. (Ex: 'Os Infiltrados', 'Autônomos').",
                    "items": {"type": "STRING"}
                },
                "sexy_bonus_names": {
                    "type": "ARRAY",
                    "description": "4 Nomes para Bónus que soem como softwares caros ou relatórios confidenciais, não como 'PDFs'.",
                    "items": {"type": "STRING"}
                }
            },
            "required": ["naming_strategy", "the_unique_mechanism", "the_proprietary_framework", "tribe_identifiers", "sexy_bonus_names"]
        })

        # Temperature 0.8: Para a criação de Nomes e IP (Brainstorming Semântico), 
        # precisamos de alta latência criativa e conexões neurais não convencionais.
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

    def _build_naming_prompt(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any]) -> str:
        """O Córtex de Patentes Linguísticas."""
        
        persona = brand_identity.get("persona", {})
        cult = brand_identity.get("cult", {})
        
        core_fear = persona.get("pain_and_friction", {}).get("3am_nightmare", "Fracasso.")
        us_words = ", ".join(cult.get("lexicon", {}).get("us_words", []))
        
        return f"""
        Sua missão operacional agora é criar a "Propriedade Intelectual Semântica" (Naming) para a oferta do cliente.
        Você precisa criar nomes que façam o produto parecer uma descoberta científica, um segredo de Wall Street ou uma tecnologia militar, impossibilitando a comparação de preços.

        1. O QUE O CLIENTE ESTÁ VENDENDO DE FATO (O Produto Chato):
        {brief}

        2. A BÍBLIA IDENTITÁRIA:
        - O Medo que a Persona quer resolver: {core_fear}
        - O Jargão do Culto atual: {us_words}
        - Diretrizes Extras: {json.dumps(parameters)}

        3. TELEMETRIA E HISTÓRICO:
        {memory_context}

        REGRAS DE OURO DA ENGENHARIA DE NOMES:
        - NUNCA use palavras batidas: "Masterclass", "Premium", "Ultimate", "Avançado", "Segredo", "Guia". 
        - USE PALAVRAS CINÉTICAS E CIENTÍFICAS: "Protocolo", "Algoritmo", "Arbitragem", "Fenda", "Loop", "Síndrome", "Célula", "Mecanismo", "Frequência".
        - OS BÓNUS: Um bónus não é um "Ebook de receitas". É o "Dossiê de Ignição Metabólica (Acesso Restrito)". Aja com grandiosidade corporativa ou científica.

        Forje os nomes. Blinde a oferta.
        """

    def generate(self, brand_identity: Dict[str, Any], memory_context: str, brief: str, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Gera a Propriedade Intelectual. Acionado pelo chief_orchestrator."""
        print(f"    🔬 [GERADOR: NAMING & IP] Sintetizando Propriedade Intelectual com Persona Mestre...")
        
        prompt = self._build_naming_prompt(brand_identity, memory_context, brief, parameters)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("O gerador de IP falhou ao forjar os nomes.")

                naming_json = json.loads(response.text)
                print("    ✅ Mecanismos forjados. A oferta tornou-se um monopólio semântico.")
                
                # Formatação para o FrontEnd
                presentation_body = "=== FÁBRICA DE PROPRIEDADE INTELECTUAL (NAMING & IP) ===\n\n"
                presentation_body += f"🧠 ESTRATÉGIA DE BLINDAGEM: {naming_json.get('naming_strategy', '')}\n"
                presentation_body += "="*60 + "\n\n"
                
                presentation_body += "🔬 O MECANISMO ÚNICO (O Segredo por trás do produto):\n"
                for i, nome in enumerate(naming_json.get("the_unique_mechanism", [])):
                    presentation_body += f"  {i+1}. {nome}\n"
                    
                presentation_body += "\n⚙️ O FRAMEWORK PROPRIETÁRIO (O Método Passo a Passo):\n"
                for i, nome in enumerate(naming_json.get("the_proprietary_framework", [])):
                    presentation_body += f"  {i+1}. {nome}\n"
                    
                presentation_body += "\n🛡️ IDENTIDADE DA TRIBO (Como chamar os clientes):\n"
                for i, nome in enumerate(naming_json.get("tribe_identifiers", [])):
                    presentation_body += f"  {i+1}. {nome}\n"
                    
                presentation_body += "\n🎁 NOMES PARA BÓNUS (Elevando o Valor Percebido):\n"
                for i, nome in enumerate(naming_json.get("sexy_bonus_names", [])):
                    presentation_body += f"  {i+1}. {nome}\n"

                return {
                    "status": "success",
                    "asset_type": "naming_mechanisms",
                    "copy_body": presentation_body,
                    "structured_data": naming_json, 
                    "ai_reasoning": "Substituição de linguagem genérica por IP (Propriedade Intelectual) semântica para criar incomparabilidade de mercado e elevar o ticket médio."
                }
                
            except Exception as e:
                print(f"    ⚠️ [Tentativa {attempt + 1}/{max_retries}] Flutuação no Laboratório de Nomes: {e}")
                
        return {
            "status": "error",
            "message": "O Arquiteto de Nomes falhou ao criar a propriedade intelectual."
        }