# modules/analytics/ai_engine.py
import os
import json
import google.generativeai as genai
# 🚀 INJEÇÃO MULTI-AGENT: Imports das novas IAs
from openai import OpenAI
from groq import Groq

class _ModelAdapter:
    """
    Adapter Pattern: Mantém a compatibilidade com os Workers antigos (Scout, Vórtex, Arena)
    que ainda chamam `self.ai.model.generate_content(prompt).text` sem precisarmos de reescrevê-os.
    """
    def __init__(self, client_placeholder, model_id):
        self.model = genai.GenerativeModel(model_id)

    def generate_content(self, prompt: str):
        return self.model.generate_content(prompt)


class AIEngine:
    def __init__(self, api_key: str = None):
        # 🚀 LOAD BALANCING: Carrega a Mesa Redonda de Chaves Gemini
        self.gemini_keys = {
            "cmo": api_key or os.getenv("GEMINI_KEY_CMO"),
            "sociologo": os.getenv("GEMINI_KEY_SOCIOLOGO"),
            "espiao": os.getenv("GEMINI_KEY_ESPIAO"),
            "trends": os.getenv("GEMINI_KEY_TRENDS"),
            "copy": os.getenv("GEMINI_KEY_COPY")
        }
        
        # A Chave Mestra é a do CMO (Fallback)
        self.master_key = self.gemini_keys["cmo"]

        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")

        if not self.master_key:
            print("⚠️ Aviso: GEMINI_KEY_CMO não encontrada. O Córtex Central falhará.")
            
        # 🚀 INJEÇÃO MULTI-AGENT: Inicialização dos novos clientes (se as chaves existirem)
        self.openai_client = OpenAI(api_key=self.openai_key) if self.openai_key else None
        self.groq_client = Groq(api_key=self.groq_key) if self.groq_key else None
        
        self.model_id = 'gemini-2.5-flash' # Excelente escolha de modelo
        self.pro_model_id = 'gemini-2.5-pro' # Textos muito densos (Dossiê)
        
        # Configuração inicial com a chave mestra
        if self.master_key:
            genai.configure(api_key=self.master_key)
            
        # A PONTE PARA OS WORKERS NÃO CRASCHAREM
        self.model = _ModelAdapter(None, self.model_id)

    def _equip_key(self, role: str):
        """🚀 LOAD BALANCING: Troca a chave do Gemini em tempo de execução para evitar limites de rate."""
        key_to_use = self.gemini_keys.get(role) or self.master_key
        if key_to_use:
            genai.configure(api_key=key_to_use)

    # =========================================================================
    # 🚀 ROTEADOR UNIVERSAL (MULTI-AGENT ROUTING)
    # =========================================================================
    def generate(self, prompt: str, provider: str = "gemini", model: str = None, system_instruction: str = None, role: str = "cmo") -> str:
        """
        O Roteador Mestre. Novos módulos do Orion devem chamar esta função.
        Permite escolher qual IA (funcionário) vai executar a tarefa.
        """
        # 1. ROTA GROQ (O Lixeiro/Operário Rápido)
        if provider == "groq" and self.groq_client:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            completion = self.groq_client.chat.completions.create(
                model=model or "llama3-8b-8192",
                messages=messages,
                temperature=0.2 # Baixa temp para limpeza de dados precisos
            )
            return completion.choices[0].message.content

        # 2. ROTA OPENAI (O Cérebro Lógico / GPT-4o)
        elif provider == "openai" and self.openai_client:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            response = self.openai_client.chat.completions.create(
                model=model or "gpt-4o-mini",
                messages=messages,
                temperature=0.4
            )
            return response.choices[0].message.content

        # 3. ROTA GEMINI (O Analista de Contexto Largo - Fallback Padrão)
        else:
            self._equip_key(role) # Equipa a chave correta baseada no departamento
            model_name = model or self.model_id
            if system_instruction:
                gm = genai.GenerativeModel(model_name, system_instruction=system_instruction)
            else:
                gm = genai.GenerativeModel(model_name)
                
            response = gm.generate_content(prompt)
            return response.text

    # =========================================================================
    # V1.0 & V2.0 - MÉTODOS ORIGINAIS CONSERVADOS (INTACTOS)
    # =========================================================================
    def _get_cmo_persona(self, profile_context: dict) -> str:
        username = profile_context.get('username', 'Cliente')
        niche = profile_context.get('niche', 'Geral')
        return f"""
        Você é o Chief Marketing Officer (CMO) de Elite e Head de Estratégia da @{username}, atuando no mercado de '{niche}'.
        Sua experiência combina o rigor analítico de Wall Street (Equity Research) com a genialidade criativa das maiores agências de publicidade do mundo.

        FRAMEWORKS OPERACIONAIS OBRIGATÓRIOS NO SEU RACIOCÍNIO:
        1. Níveis de Consciência de Eugene Schwartz: (Inconsciente > Consciente do Problema > Consciente da Solução > Consciente do Produto > Totalmente Consciente).
        2. Jobs-to-be-Done (JTBD): As pessoas não compram produtos, "contratam" soluções para progredir na vida. Identifique a real motivação de compra.
        3. Framework STEPPS de Viralidade (Jonah Berger): Moeda Social, Gatilhos, Emoção, Público, Valor Prático, Histórias.
        4. Matriz ERRC (Oceano Azul): Eliminar, Reduzir, Elevar, Criar.

        DIRETRIZES DE COMPORTAMENTO (STRICT):
        - ZERO FLUFF: Sem "Olá", sem jargões vazios, sem otimismo tóxico. Seja denso, letal, direto e cirúrgico.
        - TONS E MÉTRICAS: Use terminologia executiva (LTV, CAC, Churn, Fricção de UX, Market Share, Taxa de Retenção).
        - POSTURA: Você não busca "likes". Você busca Dominação de Mercado, construção de Fosso Competitivo (Moat) e conversão em vendas.
        """

    def generate_internal_audit(self, profile_data: dict, recent_posts: list) -> str:
        self._equip_key("cmo") # 🚀 CHAVE: CMO
        prompt = f"""
        DADOS INTERNOS DA CONTA E NICHO:
        {json.dumps(profile_data, indent=2, ensure_ascii=False)}
        AMOSTRAGEM DOS ÚLTIMOS POSTS:
        {json.dumps(recent_posts, indent=2, ensure_ascii=False)}
        EXECUTE UMA AUDITORIA CLÍNICA DE MARCA (BRAND EQUITY) E FUNIL...
        """
        return self._call_ai(prompt, profile_data, skill="Auditoria Interna")

    def generate_competitive_intelligence(self, internal_data: dict, competitors_data: list) -> str:
        self._equip_key("espiao") # 🚀 CHAVE: ESPIÃO
        prompt = f"""
        DADOS DE INTELIGÊNCIA INTERNA (@{internal_data.get('username')}):
        {json.dumps(internal_data, indent=2, ensure_ascii=False)}
        DADOS DOS INIMIGOS (CONCORRENTES):
        {json.dumps(competitors_data, indent=2, ensure_ascii=False)}
        MAPEIE O CENÁRIO COMPETITIVO COM RIGOR MILITAR...
        """
        return self._call_ai(prompt, internal_data, skill="Inteligência Competitiva")

    def analyze_trends_and_timings(self, trending_topics: list, profile_context: dict) -> str:
        self._equip_key("trends") # 🚀 CHAVE: TRENDS
        prompt = f"""
        FLUXO DE DADOS GLOBAIS: {json.dumps(trending_topics, indent=2, ensure_ascii=False)}
        SUA MISSÃO É O TREND HIJACKING APLICADO AO NICHO DE '{profile_context.get('niche')}'.
        """
        return self._call_ai(prompt, profile_context, skill="Trend Ranking & Hijacking")

    def strategic_intervention(self, historical_growth: list, profile_context: dict) -> str:
        self._equip_key("cmo") # 🚀 CHAVE: CMO
        prompt = f"""
        SÉRIE TEMPORAL DE CRESCIMENTO: {json.dumps(historical_growth, indent=2, ensure_ascii=False)}
        APLIQUE METODOLOGIA DE GROWTH HACKING E FUNIL AARRR...
        """
        return self._call_ai(prompt, profile_context, skill="Intervenção Estratégica")

    def generate_briefing(self, trend_topic: str, competitor: str) -> dict:
        self._equip_key("cmo") # 🚀 CHAVE: CMO
        prompt = f"""
        Crie um briefing tático cirúrgico baseado no tópico em alta '{trend_topic}'.
        Alvo Competitivo a ser enfraquecido: {competitor}.
        A resposta DEVE ser APENAS um JSON válido...
        """
        try:
            tactical_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'VRTICE', 'niche': 'Estratégia Global'})
            )
            response = tactical_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.7))
            clean_response = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_response)
        except Exception as e:
            return {"hook": "Falha Neural", "strategy": str(e), "format": "Erro", "call_to_action": "Logs."}

    def _call_ai(self, prompt: str, profile_context: dict, skill: str) -> str:
        try:
            print(f"🧠 [Skill: {skill}] CMO processando dados...")
            configured_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona(profile_context)
            )
            response = configured_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.6))
            return response.text
        except Exception as e:
            return f"❌ Erro crítico no córtex frontal (IA): {e}"

    def generate_cmo_dossier(self, data: dict) -> str:
        self._equip_key("cmo") # 🚀 CHAVE: CMO
        prompt = f"Você é o Head de Estratégia do ORION. Redija um Equity Research Report...\n{json.dumps(data)}"
        try:
            pro_model = genai.GenerativeModel(
                model_name=self.pro_model_id,
                system_instruction=self._get_cmo_persona({'username': 'VRTICE', 'niche': 'Estratégia Corporativa'})
            )
            response = pro_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.8))
            return response.text
        except Exception as e:
            return f"Erro ao gerar Dossiê CMO. Motivo: {str(e)}"

    def execute_sociologist_profiling(self, niche: str, raw_comments: list) -> dict:
        self._equip_key("sociologo") # 🚀 CHAVE: SOCIÓLOGO
        prompt = f"Você é um Analista... \n{json.dumps(raw_comments, ensure_ascii=False)}"
        try:
            sociologist_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'ORION', 'niche': niche})
            )
            response = sociologist_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.3))
            clean_response = response.text.strip().lstrip('```json').rstrip('```').strip()
            return json.loads(clean_response)
        except Exception as e:
            return None

    def execute_spy_ooda_loop(self, competitor_name: str, campaign_text: str, format_type: str) -> dict:
        self._equip_key("espiao") # 🚀 CHAVE: ESPIÃO
        prompt = f"Operativo de Inteligência... \nAlvo: {competitor_name}\nTexto: {campaign_text}\nFormato: {format_type}"
        try:
            spy_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'ORION', 'niche': 'Inteligência Competitiva'})
            )
            response = spy_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.4))
            clean_response = response.text.strip().lstrip('```json').rstrip('```').strip()
            return json.loads(clean_response)
        except Exception as e:
            return None

    # =========================================================================
    # 🚀 V3.0 GROWTH OS - MULTI-AGENT JSON ARCHITECTURE (OS 6 PILARES)
    # =========================================================================
    
    def _call_json_agent(self, prompt: str, system_instruction: str, role: str = "cmo", temperature: float = 0.4) -> dict:
        """
        [SÊNIOR] Motor Base de Output Estruturado com Load Balancing.
        """
        self._equip_key(role) # 🚀 CHAVE DINÂMICA
        try:
            agent = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=system_instruction
            )
            response = agent.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    response_mime_type="application/json", 
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"❌ [System Crash] Falha na matriz JSON: {e}")
            return {}

    def run_pillar1_anthropologist(self, niche: str, data_lake: list) -> dict:
        sys_prompt = f"""Você é um Antropólogo de Consumo e Psicanalista de Massas operando no nicho de {niche}.
        Sua ciência: Teoria Mimética de René Girard (Mediador/Rival) e Psicanálise de Jung (A Sombra).
        Seu objetivo: Extrair o código-fonte da alma do consumidor."""
        
        user_prompt = f"""
        Analise o seguinte Data Lake de comentários anônimos e públicos:
        {json.dumps(data_lake, ensure_ascii=False)}
        
        RETORNE ESTE SCHEMA JSON EXATO:
        {{
            "mimetic_desire": {{
                "mediator": "Quem a tribo secretamente inveja e quer ser?",
                "rival": "Quem a tribo odeia e quer distância absoluta?"
            }},
            "jungian_shadow": "A dor oculta/vergonha que nunca admitem em público.",
            "lexicon": {{
                "tribal_words": ["palavra1", "gíria2", "termo3"],
                "taboo_words": ["palavra_que_nao_deve_ser_usada", "termo_proibido"]
            }},
            "jtbd_3d": {{
                "functional": "O que o produto faz?",
                "emotional": "Como querem se sentir?",
                "social": "Como querem ser vistos pelos outros?"
            }}
        }}
        """
        print("🧠 Ativando Pilar 1: O Antropólogo...")
        return self._call_json_agent(user_prompt, sys_prompt, role="sociologo", temperature=0.3)

    def run_pillar2_brand_architect(self, niche: str, anthropologist_data: dict, weak_spots: dict) -> dict:
        sys_prompt = f"""Você é o Arquiteto de Brand Equity de um Fundo de Wall Street.
        Sua ciência: Category Design (Play Bigger), Arquétipos de Jung e Primal Branding (Patrick Hanlon).
        Seu objetivo: Destruir a concorrência tornando o cliente o único líder de uma nova categoria."""
        
        user_prompt = f"""
        Nicho Base: {niche}
        Dossiê Antropológico: {json.dumps(anthropologist_data)}
        Fraquezas da Concorrência: {json.dumps(weak_spots)}
        
        Crie a arquitetura da marca. RETORNE ESTE SCHEMA JSON EXATO:
        {{
            "category_pov": "O Nome da Nova Categoria de Mercado que estamos criando (Ex: O primeiro X para Y).",
            "narrative": {{
                "the_inevitable_shift": "A grande mudança no mundo que torna o jeito antigo obsoleto.",
                "the_enemy": "O Status Quo / Inimigo Comum a ser combatido.",
                "the_magic_vehicle": "Como o nosso produto é a única ponte para a salvação."
            }},
            "brand_constraints": {{
                "archetype": "O Arquétipo de Jung escolhido e justificativa.",
                "tone_of_voice": "Instruções diretas de como a IA deve escrever (Ex: Arrogante, Frio, Acolhedor)."
            }},
            "the_cult": {{
                "rituals": ["Ritual 1 que os seguidores devem fazer", "Ritual 2"],
                "insiders_vs_outsiders": "Como chamamos os nossos vs. Como chamamos os ignorantes"
            }}
        }}
        """
        print("🏛️ Ativando Pilar 2: O Arquiteto de Brand...")
        return self._call_json_agent(user_prompt, sys_prompt, role="cmo", temperature=0.5)

    def run_pillar3_business_auditor(self, competitor_name: str, ad_copy: str, landing_page_text: str) -> dict:
        sys_prompt = """Você é um Due Diligence Auditor e Operativo de Inteligência de Mercado.
        Sua ciência: Equação de Valor de Alex Hormozi e Teoria das Restrições de Goldratt.
        Seu objetivo: Mapear onde o inimigo sangra dinheiro e como podemos roubar seu tráfego."""
        
        user_prompt = f"""
        Alvo: {competitor_name}
        Copy do Anúncio (Topo de Funil): {ad_copy}
        Promessa da Landing Page: {landing_page_text}
        
        RETORNE ESTE SCHEMA JSON EXATO:
        {{
            "shadow_funnel": {{
                "core_offer": "O que eles estão realmente vendendo?",
                "estimated_upsell": "Qual é o provável upsell invisível que sustenta a margem deles?"
            }},
            "hormozi_equation": {{
                "dream_outcome": "Qual a promessa primária?",
                "perceived_likelihood": "Alta/Média/Baixa - Justifique.",
                "time_delay": "Quanto tempo o cliente tem que esperar?",
                "effort_sacrifice": "Qual o nível de sacrifício exigido do cliente (Fricção)?"
            }},
            "blue_ocean_attack": {{
                "vulnerability_score": "Nota de 0 a 100 (Onde 100 é muito fácil de derrotar)",
                "kill_shot_strategy": "A instrução exata de como a nossa oferta vai esmagá-los no quesito 'Esforço' ou 'Tempo'."
            }}
        }}
        """
        print("🕵️‍♂️ Ativando Pilar 3: O Auditor Corporativo...")
        return self._call_json_agent(user_prompt, sys_prompt, role="espiao", temperature=0.2)

    def run_pillar4_oracle_alpha(self, raw_trends: list, market_context: str) -> dict:
        sys_prompt = """Você é um Quantitative Analyst e Caçador de Sinais Alpha.
        Sua ciência: Curva de Adoção de Rogers e Event-Driven Marketing.
        Seu objetivo: Fornecer Vantagem Desleal antecipando tendências que a massa ainda ignora."""
        
        user_prompt = f"""
        Contexto do Cliente: {market_context}
        Sinais Globais Brutos: {json.dumps(raw_trends)}
        
        Filtre o ruído. RETORNE ESTE SCHEMA JSON EXATO:
        {{
            "alpha_signals": [
                {{
                    "term": "O conceito ou jargão",
                    "stage": "Latente ou Ascensão",
                    "momentum": "Estimativa de força (Ex: Alta/Crítica)",
                    "action": "Ação imediata para o cliente sequestrar a atenção"
                }}
            ],
            "fatigue_alerts": [
                {{
                    "format_or_trend": "O que está morrendo",
                    "reason": "Por que o CAC vai ficar caro se continuar nisso",
                    "recommendation": "O que fazer (Short/Vender)"
                }}
            ],
            "black_swan_event": "Se houver algum evento nas notícias, como o cliente ganha dinheiro com isso hoje?"
        }}
        """
        print("🔮 Ativando Pilar 4: O Oráculo Alpha...")
        return self._call_json_agent(user_prompt, sys_prompt, role="trends", temperature=0.6)

    def run_pillar5_showrunner(self, brand_book_json: dict, oracle_signals: dict) -> dict:
        sys_prompt = """Você é um Showrunner da Netflix misturado com Eng. de Redes Sociais.
        Sua ciência: Condicionamento Operante (B.F. Skinner) e Open Loops (Efeito Zeigarnik).
        Seu objetivo: Viciar a audiência em vez de apenas 'educar'."""
        
        user_prompt = f"""
        Regras da Marca: {json.dumps(brand_book_json)}
        Sinais Atuais para surfar: {json.dumps(oracle_signals)}
        
        Crie uma "Temporada" de 3 Episódios semanais para o cliente. RETORNE ESTE SCHEMA JSON EXATO:
        {{
            "neuro_balance": {{
                "dopamine_level": "Porcentagem recomendada",
                "oxytocin_level": "Porcentagem recomendada",
                "serotonin_level": "Porcentagem recomendada"
            }},
            "storyboard": [
                {{
                    "episode": 1,
                    "neuro_type": "Dopamina (Choque/Inimigo)",
                    "title": "A headline letal",
                    "script_core": "O miolo do roteiro usando o Léxico da tribo",
                    "open_loop": "O suspense deixado nos 5 segundos finais para forçar a verem o episódio 2"
                }},
                {{
                    "episode": 2,
                    "neuro_type": "Ocitocina (Bastidores/Vulnerabilidade)",
                    "title": "A headline letal",
                    "script_core": "O miolo do roteiro",
                    "open_loop": "O suspense para o episódio 3"
                }},
                {{
                    "episode": 3,
                    "neuro_type": "Serotonina (Status/Prova)",
                    "title": "A headline letal",
                    "script_core": "O miolo do roteiro preparando o 'Pitch' de vendas",
                    "open_loop": "Chamada para a conversão"
                }}
            ]
        }}
        """
        print("🎬 Ativando Pilar 5: O Showrunner...")
        return self._call_json_agent(user_prompt, sys_prompt, role="copy", temperature=0.7)

    def run_pillar6_alchemist_closer(self, target_product: dict, anthropologist_json: dict, brand_book_json: dict) -> dict:
        sys_prompt = """Você é um Behavioral Economist e Direct Response Copywriter.
        Sua ciência: Prospect Theory (Kahneman), Cialdini (Pre-suasion) e Eugene Schwartz.
        Seu objetivo: Criar uma Arquitetura de Escolha onde dizer 'NÃO' pareça estúpido."""
        
        user_prompt = f"""
        Produto: {json.dumps(target_product)}
        Dores e Sombras da Tribo: {json.dumps(anthropologist_json)}
        Tom de Voz e Restrições: {json.dumps(brand_book_json)}
        
        RETORNE ESTE SCHEMA JSON EXATO PARA O SISTEMA MONTAR A VSL E FUNIL:
        {{
            "offer_engineering": {{
                "unique_mechanism": "O nome científico/inovador que daremos à solução para evitar comparação de preço.",
                "risk_reversal": "A garantia insana que destrói a aversão à perda (Kahneman)."
            }},
            "vsl_liquid_blocks": [
                {{"type": "Pattern Interrupt", "copy": "A primeira frase chocante que ataca o inimigo."}},
                {{"type": "Shadow Agitation", "copy": "A frase que aperta a vergonha/dor oculta mapeada."}},
                {{"type": "Mechanism Reveal", "copy": "Apresentação da solução como a única salvação lógica."}},
                {{"type": "Decoy Price Drop", "copy": "A ancoragem de valor irreal seguida pela queda abrupta."}}
            ],
            "angle_based_remarketing": [
                {{"day": 1, "angle": "Lógica / ROI", "ad_copy": "..."}},
                {{"day": 2, "angle": "Medo / Escassez", "ad_copy": "..."}},
                {{"day": 3, "angle": "Identidade / Ego", "ad_copy": "..."}}
            ]
        }}
        """
        print("💰 Ativando Pilar 6: O Alquimista de Conversão...")
        return self._call_json_agent(user_prompt, sys_prompt, role="copy", temperature=0.5)

# FIM DA CLASSE AI_ENGINE