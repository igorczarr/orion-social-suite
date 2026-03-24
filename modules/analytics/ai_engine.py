# modules/analytics/ai_engine.py
import os
import json
import google.generativeai as genai

class _ModelAdapter:
    """
    Adapter Pattern: Mantém a compatibilidade com os Workers antigos (Scout, Vórtex, Arena)
    que ainda chamam `self.ai.model.generate_content(prompt).text` sem precisarmos de reescrevê-os.
    """
    def __init__(self, client_placeholder, model_id):
        # O client_placeholder é mantido para não quebrar a assinatura original da sua classe
        self.model = genai.GenerativeModel(model_id)

    def generate_content(self, prompt: str):
        # No SDK estável, o modelo já devolve um objeto com a propriedade .text, 
        # garantindo compatibilidade imediata com os workers.
        return self.model.generate_content(prompt)


class AIEngine:
    def __init__(self, api_key: str):
        if not api_key or not api_key.startswith("AIza"):
            print("⚠️ Aviso: Chave do Gemini inválida ou não configurada.")
            
        # Inicialização Sênior: Usando o configure padrão do SDK estável
        genai.configure(api_key=api_key)
        
        self.model_id = 'gemini-2.5-flash' # Excelente escolha de modelo
        
        # O modelo pro será usado exclusivamente para textos muito densos (Dossiê)
        self.pro_model_id = 'gemini-2.5-pro'
        
        # A PONTE PARA OS WORKERS NÃO CRASCHAREM (Preservando sua arquitetura)
        self.model = _ModelAdapter(None, self.model_id)

    def _get_cmo_persona(self, profile_context: dict) -> str:
        """A 'Alma' do Agente: Define o comportamento letal e sênior do Diretor de Marketing."""
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
        """1. Auditoria Interna: Analisa a própria casa."""
        prompt = f"""
        DADOS INTERNOS DA CONTA E NICHO:
        {json.dumps(profile_data, indent=2, ensure_ascii=False)}
        
        AMOSTRAGEM DOS ÚLTIMOS POSTS (Tração e Conteúdo):
        {json.dumps(recent_posts, indent=2, ensure_ascii=False)}
        
        EXECUTE UMA AUDITORIA CLÍNICA DE MARCA (BRAND EQUITY) E FUNIL. Entregue um diagnóstico abordando:
        
        **1. Alinhamento com Eugene Schwartz:** Em qual nível de consciência este conteúdo está focando predominantemente? Estamos educando o mercado ou apenas gritando ofertas para um público surdo?
        **2. Eficiência de Tração (Gargalos):** Baseado na relação curtidas/comentários e formatos, o que está drenando o nosso CAC (Custo de Aquisição de Atenção) e deve ser extirpado da linha editorial?
        **3. Diagnóstico de Posicionamento:** A narrativa textual destes posts constrói autoridade premium ou nos posiciona como mais um "commodity" no nicho? Aponte a maior Fricção identificada.
        """
        return self._call_ai(prompt, profile_data, skill="Auditoria Interna")

    def generate_competitive_intelligence(self, internal_data: dict, competitors_data: list) -> str:
        """2. Cruzamento de Dados e Oceano Azul (Auditoria Externa)."""
        prompt = f"""
        DADOS DE INTELIGÊNCIA INTERNA (@{internal_data.get('username')}):
        {json.dumps(internal_data, indent=2, ensure_ascii=False)}
        
        DADOS DOS INIMIGOS (CONCORRENTES):
        {json.dumps(competitors_data, indent=2, ensure_ascii=False)}
        
        MAPEIE O CENÁRIO COMPETITIVO COM RIGOR MILITAR:
        
        **1. Cartografia de Ameaças:** Qual é o Fosso Competitivo (Moat) que nossos concorrentes estão tentando construir com esses posts recentes? Onde eles têm vantagem tática?
        **2. Pontos Cegos (Content Gaps):** Qual dor aguda do mercado (Jobs-to-be-Done) eles estão ignorando ou abordando de forma superficial?
        **3. A Matriz ERRC (Oceano Azul):** Defina claramente para nossa marca:
           - O que devemos ELIMINAR que a concorrência faz muito?
           - O que devemos REDUZIR?
           - O que devemos ELEVAR muito acima do padrão do mercado?
           - O que devemos CRIAR que não existe hoje neste nicho?
        """
        return self._call_ai(prompt, internal_data, skill="Inteligência Competitiva")

    def analyze_trends_and_timings(self, trending_topics: list, profile_context: dict) -> str:
        """3. Trend Hijacking: Recebe 50+ tópicos, ranqueia os 3 melhores e cria o post do vencedor."""
        prompt = f"""
        FLUXO DE DADOS GLOBAIS (Notícias, Fofocas, Economia, etc):
        {json.dumps(trending_topics, indent=2, ensure_ascii=False)}
        
        SUA MISSÃO É O TREND HIJACKING APLICADO AO NICHO DE '{profile_context.get('niche')}'.
        Você tem dezenas de assuntos na mesa. Ignore o ruído e encontre o ouro.
        
        **1. Seleção Científica (Filtro STEPPS):** Dos tópicos acima, isole os 3 com maior carga de "Moeda Social" e "Emoção" (elementos do framework Jonah Berger) que podem ser conectados organicamente ao nosso nicho. Justifique brevemente a escolha.
        **2. O Ângulo de Abordagem (Foco no Campeão):** Pegue o Tópico #1 do ranking. Qual será o Ângulo de Ruptura de Padrão (Pattern Interrupt) para sequestrar essa atenção? 
        **3. Copy Letal:** Escreva a legenda (ou roteiro de Reels) pronta para uso do Tópico #1. O primeiro segundo deve ancorar a curiosidade na Trend, e o meio deve fazer a ponte brilhante para a nossa autoridade.
        """
        return self._call_ai(prompt, profile_context, skill="Trend Ranking & Hijacking")

    def strategic_intervention(self, historical_growth: list, profile_context: dict) -> str:
        """4. Propostas de Intervenção (Consultoria de Crescimento)."""
        prompt = f"""
        SÉRIE TEMPORAL DE CRESCIMENTO (Últimos dias/semanas):
        {json.dumps(historical_growth, indent=2, ensure_ascii=False)}
        
        APLIQUE METODOLOGIA DE GROWTH HACKING E FUNIL AARRR:
        
        **1. Diagnóstico da Tração:** O gráfico indica tração exponencial, platô (estagnados) ou em queda (churn de atenção)? Justifique matematicamente.
        **2. Proposta de Intervenção Validada:** Baseado na neurociência e em growth hacking, apresente um Plano de Ação de 3 passos para injetar tração imediata na conta (ex: Loops de Crescimento focados no nicho de {profile_context.get('niche')}).
        **3. Protocolo de Vendas (Curto Prazo):** Quais gatilhos de Cialdini (Urgência, Escassez, Prova Social ou Reciprocidade) devem ser injetados imediatamente no conteúdo de amanhã para transformar atenção represada em capital?
        """
        return self._call_ai(prompt, profile_context, skill="Intervenção Estratégica")

    def generate_briefing(self, trend_topic: str, competitor: str) -> dict:
        """5. Gerador de Briefing: Alimentação do Dashboard React (Sintetizar Briefing)."""
        prompt = f"""
        Crie um briefing tático cirúrgico baseado no tópico em alta '{trend_topic}'.
        Alvo Competitivo a ser enfraquecido indiretamente: {competitor}.
        
        A resposta DEVE ser APENAS um JSON válido e perfeitamente formatado. Estrutura exata:
        {{
            "hook": "Uma frase letal e disruptiva que crie um 'Pattern Interrupt' absoluto nos 3 primeiros segundos.",
            "strategy": "Justificativa da estratégia em 2 linhas baseada no framework Jobs-to-be-Done.",
            "format": "Especifique o formato ótimo (Ex: Reels Dinâmico, Carrossel de 5 Slides)",
            "call_to_action": "Comando direto focado na fase de decisão do funil."
        }}
        NÃO inclua markdown ```json ou qualquer outro texto antes ou depois do JSON.
        """
        try:
            print("🧠 [Skill: Síntese de Briefing] CMO gerando tática...")
            
            # Instancia o modelo aplicando a Persona Sênior
            tactical_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'VRTICE', 'niche': 'Estratégia Global'})
            )
            
            response = tactical_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.7)
            )
            
            clean_response = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_response)
        except Exception as e:
            print(f"❌ Erro na geração do Briefing JSON: {e}")
            return {
                "hook": "Alerta: Falha na Comunicação Neural.",
                "strategy": f"O sistema interceptou um erro: {str(e)}",
                "format": "Intervenção Manual Requerida",
                "call_to_action": "Consulte os logs do servidor."
            }

    def _call_ai(self, prompt: str, profile_context: dict, skill: str) -> str:
        """Método privado para centralizar a chamada avançada à API do Gemini."""
        try:
            print(f"🧠 [Skill: {skill}] CMO processando dados...")
            
            # Cria a instância do modelo injetando a system_instruction dinamicamente
            configured_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona(profile_context)
            )
            
            response = configured_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.6)
            )
            return response.text
        except Exception as e:
            return f"❌ Erro crítico no córtex frontal (IA): {e}"

    def generate_cmo_dossier(self, data: dict) -> str:
        """
        [SÊNIOR] Gera um relatório massivo de 5 capítulos para o Diretor de Marketing.
        """
        prompt = f"""
        Você é o Head de Estratégia do sistema de Inteligência ORION. Redija um "Equity Research Report" e Plano Diretor de Marketing 
        profundo e institucional para o ativo: {data['tenant_name']} (Nicho: {data['niche']}).

        DATA LAKE INTERCEPTADO NAS ÚLTIMAS 24H:
        - Seguidores Base: {data['followers']} | Tração Recente: {data['delta_followers']}
        - Taxa de Retenção (Engajamento Médio): {data['avg_engagement']}%
        - Vetores de Tração (Melhores Formatos): {data['top_formats']}
        - Entidades Competidoras Mapeadas: {data['competitors_data']}
        - Escuta Ativa (Dores Brutas do Mercado): {data['persona_radar']}
        - Arsenal Bélico da Concorrência: {data['arsenal']}
        - Dinâmica Sócio-Cultural (Trends atuais): {data['global_trends']}

        PARÂMETROS DE ESTILO E RIGOR:
        Este é um relatório "C-Level" para a diretoria. Requer pelo menos 5 páginas de profundidade absoluta. 
        Use tom corporativo, analítico e fundamentado em ciência de consumo. Utilize formatação Markdown avançada.

        ESTRUTURA OBRIGATÓRIA DOS 5 CAPÍTULOS DE ELITE:
        
        ## CAPÍTULO 1: ANÁLISE DE FUNDAMENTOS E VALUATION DE ATENÇÃO
        Com os números atuais ({data['followers']} seguidores, {data['avg_engagement']}% engajamento), determine a liquidez social do cliente no mercado de {data['niche']}. Onde o capital de atenção está vazando?
        
        ## CAPÍTULO 2: ESPIONAGEM COMPETITIVA E MATRIZ OCEANO AZUL
        Avalie o arsenal dos inimigos ({data['arsenal']}). Aplique a Matriz ERRC (Eliminar, Reduzir, Elevar, Criar). Defina o espaço inexplorado onde a marca poderá operar sem concorrência direta.
        
        ## CAPÍTULO 3: PSICANÁLISE DE MERCADO E JOBS-TO-BE-DONE
        Através das dores interceptadas ({data['persona_radar']}), identifique o verdadeiro "Job" que o mercado está tentando resolver. Qual o nível de consciência de Eugene Schwartz da massa atual?
        
        ## CAPÍTULO 4: VETORIZAÇÃO DE CONTEÚDO E ARQUITETURA VIRAL
        Cruze as tendências atuais ({data['global_trends']}) com os nossos melhores formatos ({data['top_formats']}). Usando o framework STEPPS (Moeda Social, Emoção), defina a linha editorial para os próximos 30 dias.
        
        ## CAPÍTULO 5: PLANO DE EXECUÇÃO TÁTICA E ORDENS DIRETAS
        Escreva 5 passos operacionais que a equipe de produção (Designers, Copywriters) deve executar amanhã. Regras claras, ganchos primários e CTAs de conversão direta baseados em Cialdini.

        Inicie o relatório agora, mantendo a excelência VRTICE.
        """
        try:
            print("📄 [Skill: Dossiê CMO] Sintetizando relatório massivo...")
            
            # Usando o modelo PRO para lidar perfeitamente com 5 páginas de texto denso
            pro_model = genai.GenerativeModel(
                model_name=self.pro_model_id,
                system_instruction=self._get_cmo_persona({'username': 'VRTICE', 'niche': 'Estratégia Corporativa'})
            )
            
            response = pro_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.8)
            )
            return response.text
        except Exception as e:
            print(f"❌ Erro ao gerar Dossiê CMO: {e}")
            return f"Erro ao gerar Dossiê CMO. Motivo: {str(e)}"


if __name__ == "__main__":
    # --- ÁREA DE TESTE ISOLADO CORRIGIDA ---
    TEST_API_KEY = "AIzaSyAmF9NldmAuwsgGzRAW4yWhoeBLqURjTb0" 
    
    if not TEST_API_KEY.startswith("AIza"):
        print("⚠️ Por favor, insira a sua chave API do Gemini no código para testar.")
    else:
        ai = AIEngine(TEST_API_KEY)
        
        print("\n📊 TESTANDO MÓDULO DE BRIEFING...")
        print("-" * 80)
        
        briefing = ai.generate_briefing("Queda na Taxa Selic", "@primorico")

    def execute_sociologist_profiling(self, niche: str, raw_comments: list) -> dict:
        """
        O Sociólogo (FASE 3): Engole milhares de comentários (Data Lake) e gera o Dossiê da Persona.
        Output direto para a tabela PersonaDossier.
        """
        prompt = f"""
        Você é um Analista Comportamental Sênior e Estrategista de Wall Street operando no nicho de '{niche}'.
        Abaixo está um Data Lake contendo centenas de comentários reais extraídos do TikTok e Instagram de concorrentes:
        
        [INÍCIO DO DATA LAKE]
        {json.dumps(raw_comments, ensure_ascii=False)}
        [FIM DO DATA LAKE]
        
        Sua missão é ler essa massa caótica de dados, ignorar ruídos (ex: "lindo", "amei") e encontrar as assimetrias psicológicas.
        Aplique o framework Jobs-to-be-Done (JTBD) e Níveis de Consciência de Eugene Schwartz.
        
        DEVOLVA APENAS UM JSON VÁLIDO COM ESTA ESTRUTURA EXATA:
        {{
            "macro_sentiment": "Uma frase resumindo o sentimento geral da massa (Ex: Frustrados com falsas promessas).",
            "core_desire": "O verdadeiro Job-to-be-Done oculto.",
            "hidden_objection": "A Fricção ou objeção principal que os impede de comprar.",
            "awareness_level": "O Nível de Consciência predominante da massa (Eugene Schwartz).",
            "golden_quotes": [
                "Citação real 1 exata extraída do texto que prova a tese",
                "Citação real 2 exata extraída do texto que prova a tese",
                "Citação real 3 exata extraída do texto que prova a tese"
            ]
        }}
        NÃO use formatação markdown (```json). Apenas o objeto JSON puro.
        """
        try:
            print("🧠 [OSINT: Sociólogo] Minerando Data Lake de comentários...")
            
            sociologist_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'ORION SYSTEM', 'niche': niche})
            )
            
            response = sociologist_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.3) # Baixa temperatura para extração exata
            )
            
            clean_response = response.text.strip().lstrip('```json').rstrip('```').strip()
            return json.loads(clean_response)
        except Exception as e:
            print(f"❌ Erro no processamento do Sociólogo: {e}")
            return None

    def execute_spy_ooda_loop(self, competitor_name: str, campaign_text: str, format_type: str) -> dict:
        """
        O Espião (FASE 3): Faz a engenharia reversa de UMA campanha/post específico do concorrente.
        Output direto para a tabela CompetitorWarRoom.
        """
        prompt = f"""
        Você é um Operativo de Inteligência Competitiva (Corporate Espionage).
        O concorrente @{competitor_name} acabou de lançar o seguinte conteúdo/anúncio no formato '{format_type}':
        
        [CÓPIA DA CAMPANHA INIMIGA]
        "{campaign_text}"
        [FIM DA CÓPIA]
        
        Faça a engenharia reversa (Tear-down) desta estratégia e prepare o nosso contra-ataque usando a Matriz Oceano Azul e Gatilhos de Cialdini.
        
        DEVOLVA APENAS UM JSON VÁLIDO COM ESTA ESTRUTURA EXATA:
        {{
            "detected_hook": "Qual é o gancho exato e a premissa que eles estão usando para segurar a atenção?",
            "cialdini_trigger": "Qual Gatilho Mental primário está em uso (ex: Escassez, Prova Social, Autoridade)?",
            "market_gap": "O que eles deixaram de fora? Qual é a lacuna ou ponto cego dessa abordagem?",
            "counter_strategy": "A instrução tática letal de como nós devemos criar um conteúdo para esmagar essa narrativa e roubar a atenção."
        }}
        NÃO use formatação markdown (```json). Apenas o objeto JSON puro.
        """
        try:
            print(f"🥷 [OSINT: Espião] Dissecando campanha de @{competitor_name}...")
            
            spy_model = genai.GenerativeModel(
                model_name=self.model_id,
                system_instruction=self._get_cmo_persona({'username': 'ORION SYSTEM', 'niche': 'Inteligência Competitiva'})
            )
            
            response = spy_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.4)
            )
            
            clean_response = response.text.strip().lstrip('```json').rstrip('```').strip()
            return json.loads(clean_response)
        except Exception as e:
            print(f"❌ Erro na engenharia reversa do Espião: {e}")
            return None
        
    print("\n💡 BRIEFING GERADO (JSON):")
    print(json.dumps(briefing, indent=2, ensure_ascii=False))
    print("-" * 80)