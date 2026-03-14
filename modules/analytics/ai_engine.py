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
        Você é o Chief Marketing Officer (CMO) e Head de Estratégia da @{username}, focado no nicho de '{niche}'.
        Sua mente opera com base em dados, neurociência do consumidor, copywriting de alta conversão e Growth Hacking.
        
        DIRETRIZES DE COMPORTAMENTO (STRICT):
        1. ZERO FLUFF: Sem "olá", "excelente post", ou introduções amigáveis. Seja denso, direto e executivo.
        2. TONS E FRAMEWORKS: Use linguagem técnica de negócios (LTV, CAC, Churn, Fricção, Market Share, Funil AIDA, Gatilhos Mentais).
        3. FOCO EM LUCRO E DOMINAÇÃO: Engajamento é vaidade se não gerar retenção, autoridade ou vendas. 
        4. AUTENTICIDADE: Aja como um humano sênior avaliando a própria empresa e os inimigos (concorrentes).
        """

    def generate_internal_audit(self, profile_data: dict, recent_posts: list) -> str:
        """1. Auditoria Interna: Analisa a própria casa."""
        prompt = f"""
        DADOS INTERNOS DA CONTA:
        {json.dumps(profile_data, indent=2)}
        
        ÚLTIMOS POSTS (Tração e Conteúdo):
        {json.dumps(recent_posts, indent=2)}
        
        Realize uma Auditoria Interna rigorosa. Entregue um diagnóstico abordando:
        **1. Saúde do Funil:** O conteúdo atual está focado apenas em topo de funil (atração) ou estamos retendo e convertendo?
        **2. Padrões de Sucesso/Fracasso:** Qual formato ou tema está claramente carregando o engajamento da conta nas costas? O que está drenando nossa energia e deve ser cortado?
        **3. Diagnóstico de Marca:** A percepção de valor que estamos passando condiz com uma marca premium do nicho?
        """
        return self._call_ai(prompt, profile_data, skill="Auditoria Interna")

    def generate_competitive_intelligence(self, internal_data: dict, competitors_data: dict) -> str:
        """2. Cruzamento de Dados e Oceano Azul (Auditoria Externa)."""
        prompt = f"""
        MAPA DE CALOR DO MERCADO:
        
        NOSSOS DADOS (@{internal_data.get('username')}):
        {json.dumps(internal_data, indent=2)}
        
        DADOS DOS CONCORRENTES:
        {json.dumps(competitors_data, indent=2)}
        
        Faça um cruzamento tático e entregue o Mapa de Guerra:
        **1. Benchmarking de Ameaças:** O que o concorrente A ou B está fazendo melhor do que nós (ângulo, formato, comunidade)?
        **2. Content Gaps (Pontos Cegos):** Onde os nossos concorrentes estão errando ou sendo superficiais que nós podemos atacar amanhã?
        **3. O Oceano Azul:** Apresente 2 estratégias de conteúdo/posicionamento que NENHUM dos concorrentes está usando, mas que a nossa audiência secretamente deseja.
        """
        return self._call_ai(prompt, internal_data, skill="Inteligência Competitiva")

    def analyze_trends_and_timings(self, trending_topics: list, profile_context: dict) -> str:
        """3. Trend Hijacking: Recebe 50+ tópicos, ranqueia os 3 melhores e cria o post do vencedor."""
        prompt = f"""
        RADAR GLOBAL DE TENDÊNCIAS (Notícias, Fofocas, Economia, etc):
        {json.dumps(trending_topics, indent=2)}
        
        Sua tarefa é "Trend Hijacking" (Sequestro de Atenção) focado no nicho de '{profile_context.get('niche')}'.
        Você tem dezenas de assuntos na mesa. Ignore o ruído e encontre o ouro.
        
        Entregue:
        **1. Ranking de Oportunidades (Top 3):** Filtre esta lista gigante e escolha os 3 tópicos com MAIOR potencial de retenção e viralização para a nossa audiência. Justifique brevemente por que a audiência de {profile_context.get('niche')} se importaria com eles.
        **2. O Ângulo de Abordagem (Foco no Campeão):** Pegue o Tópico #1 do ranking. Como vamos hackear essa atenção? Será uma opinião polêmica, uma ponte com a dor do cliente ou humor refinado?
        **3. Copy Letal:** Escreva a legenda (ou roteiro de Reels) pronta para uso do Tópico #1. Aplique gatilhos de retenção agressivos logo na primeira linha.
        """
        return self._call_ai(prompt, profile_context, skill="Trend Ranking & Hijacking")

    def strategic_intervention(self, historical_growth: list, profile_context: dict) -> str:
        """4. Propostas de Intervenção (Consultoria de Crescimento)."""
        prompt = f"""
        HISTÓRICO DE CRESCIMENTO (Últimos dias/semanas):
        {json.dumps(historical_growth, indent=2)}
        
        Analise a curva de crescimento da nossa conta. 
        **1. Diagnóstico da Tração:** Estamos em crescimento exponencial, platô (estagnados) ou em queda (churn de atenção)? Justifique matematicamente.
        **2. Proposta de Intervenção Validada:** Baseado na neurociência e em growth hacking, apresente um Plano de Ação de 3 passos para injetar tração imediata na conta (mudança de CTA, nova linha editorial, etc).
        **3. Foco em Vendas:** Como podemos transformar essa métrica de atenção em leads reais nos próximos 7 dias?
        """
        return self._call_ai(prompt, profile_context, skill="Intervenção Estratégica")

    def generate_briefing(self, trend_topic: str, competitor: str) -> dict:
        """5. Gerador de Briefing: Alimentação do Dashboard React (Sintetizar Briefing)."""
        prompt = f"""
        Crie um briefing tático de conteúdo baseado no tópico em alta '{trend_topic}'.
        Temos de atacar o público do nosso concorrente: {competitor}.
        
        Devolva APENAS um JSON válido (sem tags markdown ```json) com as chaves exatas:
        "hook" (O gancho do post em 1 frase letal),
        "strategy" (A explicação psicológica da tática em 2 linhas curtas),
        "format" (Ex: Reels, Carrossel, Story),
        "call_to_action" (Chamada para ação matadora focada em conversão)
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
        Você é o Diretor Estratégico (CMO) da VRTICE. Sua missão é redigir um Dossiê de Inteligência Competitiva 
        profundo, tático e impecável para o cliente: {data['tenant_name']} (Nicho: {data['niche']}).

        Aqui estão os dados interceptados pelo sistema Orion nas últimas horas:
        - Nossos Seguidores: {data['followers']} | Crescimento recente: {data['delta_followers']}
        - Nosso Engajamento Médio: {data['avg_engagement']}%
        - Nossos Melhores Formatos: {data['top_formats']}
        - Nossos Concorrentes: {data['competitors_data']}
        - Radar de Persona (Dores/Medos ouvidos): {data['persona_radar']}
        - Arsenal da Concorrência (Ganchos ativos): {data['arsenal']}
        - Pulso Global (Trends atuais): {data['global_trends']}

        REQUISITO DE FORMATAÇÃO: 
        Este relatório DEVE ser extenso o suficiente para ocupar pelo menos 5 páginas de leitura densa e profissional. 
        Use tom corporativo, analítico e de alto nível (focado em conversão e dominação de mercado).
        Utilize formatação Markdown pesada (## Capítulos, ### Subtítulos, **Negritos**, - Listas).

        ESTRUTURA OBRIGATÓRIA DOS 5 CAPÍTULOS:
        
        ## CAPÍTULO 1: RADIOGRAFIA DO CENÁRIO ATUAL
        Analise friamente os nossos números ({data['followers']} seguidores, {data['avg_engagement']}% engajamento). O que isso significa no mercado atual de {data['niche']}? Onde estamos sangrando tráfego?
        
        ## CAPÍTULO 2: CARTOGRAFIA DA CONCORRÊNCIA (A ARENA)
        Disseque os concorrentes informados. Analise os ganchos que eles estão usando ({data['arsenal']}). Por que estão usando isso? Qual é a fraqueza deles que nós vamos explorar?
        
        ## CAPÍTULO 3: DIAGNÓSTICO DO RADAR DE PERSONA
        Com base nas dores extraídas ({data['persona_radar']}), desenhe o perfil psicológico exato de quem está com o cartão de crédito na mão hoje. O que o mercado não está entregando para eles?
        
        ## CAPÍTULO 4: ENGENHARIA DE CONTEÚDO E VETORES DE TRAÇÃO
        Conecte as tendências globais ({data['global_trends']}) com os nossos melhores formatos ({data['top_formats']}). Defina a linha editorial exata para os próximos 30 dias.
        
        ## CAPÍTULO 5: PLANO DE INTERVENÇÃO CIRÚRGICA (DIRETRIZES DE AÇÃO)
        Escreva 5 passos operacionais que a equipe de produção (designers, copywriters, videomakers) deve executar amanhã de manhã. Regras claras, ganchos primários e CTAs de conversão direta.

        Gere o relatório agora, mantendo a excelência VRTICE.
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
        
        print("\n💡 BRIEFING GERADO (JSON):")
        print(json.dumps(briefing, indent=2, ensure_ascii=False))
        print("-" * 80)