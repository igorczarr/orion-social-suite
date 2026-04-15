from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, UniqueConstraint, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON, Boolean, func


Base = declarative_base()

# =====================================================================
# MÓDULO 1: AUTENTICAÇÃO CORPORATIVA (A Equipa)
# =====================================================================

class User(Base):
    """Tabela de Utilizadores (RBAC - Growth OS)"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="client") # 'admin', 'analyst', 'client'
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relações
    tenants = relationship("Tenant", back_populates="owner")

# =====================================================================
# MÓDULO 2: O NÚCLEO MULTI-TENANT (O Cofre de Clientes)
# =====================================================================

class Tenant(Base):
    """O Cliente/Marca. O coração do sistema."""
    __tablename__ = 'tenants'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False) # Ex: "Lojas Renner"
    social_handle = Column(String, nullable=False) # Ex: "@lojasrenner"
    niche = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    # 🎯 ENRIQUECIMENTO INTERNO ORION (Preenchido pela Agência)
    keywords = Column(JSON, nullable=True)
    competitors = Column(JSON, nullable=True)
    personas = Column(JSON, nullable=True)
    
    encrypted_ig_session = Column(Text, nullable=True) # Cofre de Credenciais
    
    # Relações Descendentes (Originais)
    owner = relationship("User", back_populates="tenants")
    personas = relationship("Persona", back_populates="tenant", cascade="all, delete")
    tracked_profiles = relationship("TrackedProfile", back_populates="tenant", cascade="all, delete")
    social_insights = relationship("SocialInsight", back_populates="tenant", cascade="all, delete")
    persona_dossiers = relationship("PersonaDossier", back_populates="tenant", cascade="all, delete")
    brand_equity = relationship("BrandEquity", back_populates="tenant", uselist=False, cascade="all, delete")
    alpha_signals = relationship("AlphaSignal", back_populates="tenant", cascade="all, delete")
    syndicate_episodes = relationship("MediaSyndicate", back_populates="tenant", cascade="all, delete")
    vortex_targets = relationship("VortexTarget", back_populates="tenant", cascade="all, delete")
    
    # 🚀 NOVAS RELAÇÕES DE INTELIGÊNCIA (Data Lake de Consultoria)
    client_briefing = relationship("ClientBriefing", back_populates="tenant", uselist=False, cascade="all, delete")
    web_traffic_intel = relationship("WebTrafficIntel", back_populates="tenant", cascade="all, delete")
    swipe_files = relationship("SwipeFile", back_populates="tenant", cascade="all, delete")
    ai_reports = relationship("AIExecutionLog", back_populates="tenant", cascade="all, delete")


class Persona(Base):
    """Segmentação Macro (Desativada aos poucos em favor do BrandEquity)"""
    __tablename__ = 'personas'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    name = Column(String, nullable=False)
    age_range = Column(String)
    
    tenant = relationship("Tenant", back_populates="personas")

# =====================================================================
# NOVA FASE 4: BRAND EQUITY E NEURO-SEMÂNTICA (Pilares 1 e 2)
# =====================================================================

class BrandEquity(Base):
    """
    O COFRE DO MONOPÓLIO: Guarda o Dicionário Lexical (Pilar 1) e o Brand Book (Pilar 2).
    Esta é a tabela que ativa o 'Brand Lock' na IA.
    """
    __tablename__ = 'brand_equity'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), unique=True, nullable=False)
    
    # Pilar 1: Antropologia (O Inconsciente)
    shadow_fear = Column(Text) # A Sombra / Vergonha oculta (Scraping do Reddit)
    mimetic_mediator = Column(String) # Quem eles invejam
    mimetic_rival = Column(String) # O Inimigo Comum a destruir
    
    lexicon_tribal = Column(JSON) # Array: ["High-Ticket", "Cringe", "Escala"]
    lexicon_taboo = Column(JSON) # Array: ["Barato", "Promoção"] (A IA rejeita estas)
    
    # Pilar 2: Arquitetura da Marca (O Monopólio)
    category_pov = Column(Text) # Manifesto da nova categoria criada
    archetype = Column(String) # O Herói, O Rebelde, O Sábio
    tone_of_voice = Column(String) # Ex: "Desafiador, elitista e direto"
    brand_rituals = Column(JSON) # Rituais de passagem da marca
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="brand_equity")

class PersonaDossier(Base):
    """A Síntese Comportamental (JTBD e Níveis de Consciência de Eugene Schwartz)."""
    __tablename__ = 'persona_dossiers'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    
    macro_sentiment = Column(String) # Ex: "Cínico e Cansado"
    core_desire = Column(Text)       # JTBD Real
    hidden_objection = Column(Text)  # Objeção Lógica
    awareness_level = Column(String) # Ex: "Consciente da Solução"
    golden_quotes = Column(JSON)     # Dicionário de Provas Reais
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="persona_dossiers")

# =====================================================================
# MÓDULO 3: ESPIONAGEM COMPETITIVA (Pilar 3 e Arena)
# =====================================================================

class TrackedProfile(Base):
    """Os Alvos do Radar (O próprio cliente + Inimigos)"""
    __tablename__ = 'tracked_profiles'
    __table_args__ = (UniqueConstraint('tenant_id', 'username', name='uix_tenant_username'),)
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    username = Column(String, index=True, nullable=False)
    niche = Column(String) 
    is_client_account = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    added_at = Column(DateTime, default=datetime.now)
    last_scraped_at = Column(DateTime, nullable=True)
    
    tenant = relationship("Tenant", back_populates="tracked_profiles")
    ads = relationship("CompetitorAd", back_populates="tracked_profile", cascade="all, delete")
    war_room_entries = relationship("CompetitorWarRoom", back_populates="tracked_profile", cascade="all, delete")

class CompetitorAd(Base):
    """O Scanner de Tráfego Pago (Meta Ads / TikTok Ads)"""
    __tablename__ = 'competitor_ads'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_profile_id = Column(Integer, ForeignKey('tracked_profiles.id'), nullable=False)
    format = Column(String) # "Vídeo", "Carrossel"
    hook_text = Column(Text)
    days_active = Column(Integer, default=1)
    status = Column(String) # "Vencedor", "Escalando", "Teste"
    last_seen_at = Column(DateTime, default=datetime.now)
    
    tracked_profile = relationship("TrackedProfile", back_populates="ads")

class CompetitorWarRoom(Base):
    """O Auditor de Vulnerabilidade Corporativa (Pilar 3 Extremo)."""
    __tablename__ = 'competitor_war_room'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_profile_id = Column(Integer, ForeignKey('tracked_profiles.id'), nullable=False)
    
    campaign_url = Column(String, nullable=False)
    detected_hook = Column(Text)
    cialdini_trigger = Column(String)
    
    market_gap = Column(Text) # A Fricção que o inimigo gera
    counter_strategy = Column(Text) # Instrução de ataque gerada pela IA
    
    core_offer = Column(String, nullable=True) # O que eles realmente vendem no back-end
    estimated_upsell = Column(String, nullable=True)
    vulnerability_score = Column(Integer, default=50) # 0-100 (Risco de Fadiga do inimigo)
    
    detected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tracked_profile = relationship("TrackedProfile", back_populates="war_room_entries")

# =====================================================================
# MÓDULO 4: ORÁCULO PREDITIVO E DATA LAKE (Pilar 4)
# =====================================================================

class SocialInsight(Base):
    """OUVIDORIA SOCIAL: O Big Data bruto extraído de comentários (Instagram, YouTube)."""
    __tablename__ = 'social_insights'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    platform = Column(String, nullable=False)
    quote = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    intensity = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    tenant = relationship("Tenant", back_populates="social_insights")

class AlphaSignal(Base):
    """O Oráculo (Pilar 4): Tendências Preditivas de Alternative Data (SerpApi/Reddit)."""
    __tablename__ = "alpha_signals"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    term = Column(String, nullable=False) # O jargão ou evento emergente
    source = Column(String) # Ex: "Reddit Tech", "Google Trends (Finanças)"
    stage = Column(String) # Ex: "Latente", "Ascensão", "Fadiga"
    momentum = Column(String) # Ex: "+412%"
    recommendation = Column(String) # Ex: "Comprar (First-Mover)"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="alpha_signals")

class AuthorityProof(Base):
    """Acervo de Provas Científicas/Mercado para matar objeções."""
    __tablename__ = "authority_proofs"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    title = Column(String)
    source_url = Column(String)
    source_name = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant")

# =====================================================================
# MÓDULO 5: O SINDICATO DE MÍDIA (Pilar 5 - Showrunner)
# =====================================================================

class MediaSyndicate(Base):
    """Kanban de Retenção: Agenda narrativa do cliente baseada em Dopamina/Ocitocina/Serotonina."""
    __tablename__ = 'media_syndicate'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    
    season = Column(Integer, default=1)
    episode = Column(Integer, default=1)
    title = Column(String, nullable=False)
    neuro_type = Column(String, nullable=False) # "Dopamina", "Ocitocina", "Serotonina"
    
    script_core = Column(Text) # A Copy bruta
    open_loop = Column(Text) # O suspense para o próximo episódio
    status = Column(String, default="Rascunho") # "Rascunho", "Em Produção", "Pronto"
    
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="syndicate_episodes")

# =====================================================================
# MÓDULO 6: HISTÓRICO DE CRESCIMENTO E VÓRTEX
# =====================================================================

class ProfileHistory(Base):
    """Gráfico Linear do Histórico da Conta."""
    __tablename__ = 'profile_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)

class Post(Base):
    """O Arquivo Central do Post Orgânico."""
    __tablename__ = 'posts'
    
    shortcode = Column(String, primary_key=True)
    username = Column(String, index=True, nullable=False)
    published_at = Column(DateTime)
    media_type = Column(String)
    caption = Column(Text)
    url = Column(String)
    hook_strategy = Column(String, nullable=True) 

class PostSnapshot(Base):
    """Radar Constante de Métricas do Post."""
    __tablename__ = 'post_snapshots'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    post_shortcode = Column(String, ForeignKey('posts.shortcode'), nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    views = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)

class VortexTarget(Base):
    """Máquina de Prospecção Outbound Oculta."""
    __tablename__ = 'vortex_targets'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    username = Column(String, index=True, nullable=False)
    name = Column(String)
    bio = Column(Text)
    origin = Column(String) 
    
    match_score = Column(Integer, default=0)
    ai_analysis = Column(Text)
    suggested_hook = Column(Text)
    
    status = Column(String, default="pending", index=True) 
    created_at = Column(DateTime, default=datetime.now)
    
    tenant = relationship("Tenant", back_populates="vortex_targets")

class TrendInsight(Base):
    """Armazena as tendências efêmeras do Google Trends e X."""
    __tablename__ = 'trend_insights'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    topic = Column(String, nullable=False)
    category = Column(String)
    heat = Column(String)
    source_url = Column(String)
    created_at = Column(DateTime, default=datetime.now)

# =====================================================================
# MÓDULO 7: GESTÃO ESTRATÉGICA E INTELIGÊNCIA APLICADA (As Novas Fundações)
# =====================================================================

class ClientBriefing(Base):
    """
    A GÊNESIS DO PROJETO.
    Armazena o formulário inicial do cliente para balizar todos os Agentes de IA.
    """
    __tablename__ = 'client_briefings'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), unique=True, nullable=False)
    
    business_goal = Column(Text)            # Ex: "Escalar a mentoria para R$ 100k/mês"
    target_audience_raw = Column(Text)      # O que o cliente ACHA que é a persona
    current_challenges = Column(Text)       # Ex: "CPA muito alto, ninguém engaja"
    product_ecosystem = Column(JSON)        # Tabela de produtos (Isca, Core, High-Ticket)
    unique_value_proposition_raw = Column(Text)
    
    raw_form_data = Column(JSON)            # Backup completo do formulário enviado
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="client_briefing")

class WebTrafficIntel(Base):
    """
    O RASTREADOR DE TRÁFEGO E VSLs.
    Captura transcrições de páginas de vendas e ranqueamento de SEO dos concorrentes.
    """
    __tablename__ = 'web_traffic_intel'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    competitor_url = Column(String, nullable=False, index=True)
    monthly_visits_estimate = Column(Integer, default=0)
    top_keywords = Column(JSON)             # Palavras-chave que levam tráfego para lá
    
    vsl_transcript = Column(Text)           # A transcrição integral do Vídeo de Vendas inimigo
    sales_page_copy = Column(Text)          # Texto capturado da Landing Page
    
    captured_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="web_traffic_intel")

class SwipeFile(Base):
    """
    A BIBLIOTECA DE OURO (O Cérebro de Referências).
    Guarda as estruturas virais (Hooks, Ofertas, LSLs, Funis) para modelagem preditiva.
    """
    __tablename__ = 'swipe_files'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    category = Column(String, nullable=False, index=True) # 'Hook', 'VSL', 'Offer', 'Funnel', 'Ad Creative'
    content = Column(Text, nullable=False)                # O script, texto ou estrutura
    source_url = Column(String)                           # De onde roubamos a ideia
    
    performance_score = Column(Integer, default=0)        # Pontuação 0-100 baseada no backtesting
    ai_breakdown = Column(JSON)                           # Ex: {"gatilho": "Escassez", "emocao": "Aversão à perda"}
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="swipe_files")

class AIExecutionLog(Base):
    """
    O DIÁRIO DE BORDO DA IA (Trackrecord).
    Salva permanentemente todos os dossiês, auditorias e relatórios estratégicos gerados.
    Permite consultar decisões passadas e provar o valor do Orion.
    """
    __tablename__ = 'ai_execution_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    report_type = Column(String, nullable=False, index=True) # Ex: 'CMO_Dossier', 'ERRC_Matrix', 'Kill_Shot_Protocol'
    content_md = Column(Text, nullable=False)                # O output gerado pela IA (Markdown/JSON em string)
    parameters_used = Column(JSON)                           # O que foi enviado para a IA para gerar este relatório
    
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant", back_populates="ai_reports")

# =====================================================================
# MÓDULO 8: O GRAFO DE CONHECIMENTO (SWIPE FILE MULTIDIMENSIONAL)
# =====================================================================

class SwipeSource(Base):
    """
    A FONTE DA INTELIGÊNCIA.
    Ex: "Agora Financial", "Swiped.co", "CXL", "Reddit /r/copywriting".
    Permite à IA ponderar a autoridade da informação.
    """
    __tablename__ = 'swipe_sources'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False) # 'Titan', 'Museum', 'Newsletter', 'CRO_Science', 'Trench'
    market = Column(String) # 'BR', 'US', 'Global'
    authority_score = Column(Integer, default=50) # Peso de 0 a 100 na hora de a IA escolher quem modelar
    
    assets = relationship("SwipeAsset", back_populates="source", cascade="all, delete")
    tactics = relationship("TacticalIntel", back_populates="source", cascade="all, delete")

class SwipeAsset(Base):
    """
    A MATÉRIA-PRIMA.
    A peça de conteúdo purificada (A VSL, o E-mail, a Landing Page).
    """
    __tablename__ = 'swipe_assets'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey('swipe_sources.id'), nullable=False)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=True) # Null = Arquivo Global do Órion. Preenchido = Salvo por um cliente específico.
    
    asset_type = Column(String, index=True) # 'Long-Form VSL', 'Email Sequence', 'Ad Copy', 'Advertorial'
    title_or_hook = Column(Text, nullable=False)
    clean_content = Column(Text, nullable=False) # O texto Markdown limpo
    original_url = Column(String)
    
    extracted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    source = relationship("SwipeSource", back_populates="assets")
    autopsy = relationship("CognitiveAutopsy", back_populates="asset", uselist=False, cascade="all, delete")
    cro_heuristics = relationship("CROHeuristic", back_populates="asset", cascade="all, delete")

class CognitiveAutopsy(Base):
    """
    A ENGENHARIA REVERSA (O Porquê funciona).
    É aqui que o nosso 'cognitive_parser.py' brilha. Ele preenche isto via IA.
    """
    __tablename__ = 'cognitive_autopsies'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey('swipe_assets.id'), unique=True, nullable=False)
    
    awareness_level = Column(String) # Ex: "Unaware", "Problem Aware" (Eugene Schwartz)
    core_emotion = Column(String) # Ex: "Ganância", "Medo de Ficar de Fora (FOMO)", "Injustiça"
    big_idea = Column(Text) # A tese central da copy resumida numa frase
    structural_framework = Column(String) # Ex: "PAS (Problem-Agitate-Solve)", "Hero's Journey"
    psychological_triggers = Column(JSON) # Array: ["Prova Social", "Urgência Oculta", "Autoridade"]
    
    asset = relationship("SwipeAsset", back_populates="autopsy")

class CROHeuristic(Base):
    """
    A CIÊNCIA DA CONVERSÃO (O Cótex Científico).
    Regras de UX e Design extraídas da CXL e Nielsen Norman.
    """
    __tablename__ = 'cro_heuristics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey('swipe_assets.id'), nullable=True) # Pode estar ligado a um Swipe específico ou ser uma regra geral
    
    rule_name = Column(String, nullable=False) # Ex: "Redução de Fricção Cognitiva no Checkout"
    friction_type = Column(String) # Ex: "Carga Visual", "Ansiedade de Preço"
    actionable_insight = Column(Text) # Ex: "Colocar o selo de garantia a menos de 50px do botão de CTA aumenta a conversão em 14%."
    
    asset = relationship("SwipeAsset", back_populates="cro_heuristics")

class TacticalIntel(Base):
    """
    HACKS E TENDÊNCIAS EFÊMERAS (As Trincheiras).
    Extraído do Reddit e Cult of Copy. O que está a funcionar HOJE, mas pode parar amanhã.
    """
    __tablename__ = 'tactical_intel'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey('swipe_sources.id'), nullable=False)
    
    trend_name = Column(String, nullable=False) # Ex: "Uso de Imagens Lo-Fi em Ads B2B"
    market_pulse = Column(String) # 'Emergente', 'Saturando', 'Morto'
    actionable_hack = Column(Text) # O passo a passo da tática
    discovered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    source = relationship("SwipeSource", back_populates="tactics")

# =====================================================================
# MÓDULO 9: O COFRE DE IDENTIDADE (BRAND LOCK & ESTRATÉGIA)
# =====================================================================

class BrandDossier(Base):
    """
    O Dossiê Inquebrável da Marca.
    Gerado uma única vez (ou atualizado semestralmente) pelo motor Brand Lock.
    É a Bíblia que a IA consultará antes de escrever qualquer Copy.
    """
    __tablename__ = 'brand_dossiers'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), unique=True, nullable=False)
    
    # MOTOR 1: O Doxxing Psicológico
    persona_profile = Column(JSON, nullable=False) 
    
    # MOTOR 2: A Engenharia de Culto
    cult_branding = Column(JSON, nullable=False) 
    
    # MOTOR 3: A Matriz de Oceano Azul
    errc_matrix = Column(JSON, nullable=False) 
    
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", backref="brand_dossier")

# =====================================================================
# MÓDULO 10: MEMÓRIA DE LONGO PRAZO E TELEMETRIA AUTÓNOMA
# =====================================================================

class CopyGenerationLog(Base):
    """
    O Diário de Bordo Autónomo do Copy Chief.
    Cruza o que a IA gerou com o que a Apify provou que funcionou no mundo real.
    """
    __tablename__ = 'copy_generation_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    asset_type = Column(String, index=True, nullable=False) # 'vsl', 'hook', 'email_sequence', 'meta_ad'
    briefing = Column(Text)
    generated_copy = Column(Text, nullable=False)
    ai_reasoning = Column(Text)
    
    # --- O CIRCUITO DE FEEDBACK HUMANO ---
    client_score = Column(Integer, nullable=True) # Nota manual do cliente (0 a 100)
    client_feedback = Column(Text, nullable=True)
    
    # --- O CIRCUITO DE TELEMETRIA AUTÓNOMA (A Vossa Adição de Mestre) ---
    external_tracking_url = Column(String, nullable=True, unique=True) # A URL real do Post/Ad no mundo
    apify_days_active = Column(Integer, default=0) # Para Ads: Dias que sobreviveu sem o cliente desligar
    apify_engagement = Column(Integer, default=0) # Para Posts: Soma de Likes/Comments
    autonomous_score = Column(Integer, nullable=True) # A Nota Real Calculada pela Máquina (0 a 100)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_telemetry_sync = Column(DateTime(timezone=True), nullable=True) # Quando a Apify leu pela última vez
# ==============================================================================
# GAMIFICAÇÃO E GESTÃO DE MISSÕES (Módulo de Produtividade)
# ==============================================================================

class Quest(Base):
    """
    Missões diárias/semanais atribuídas aos membros da equipa (Gamification).
    """
    __tablename__ = "quests"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    task_description = Column(String(500), nullable=False)
    xp_reward = Column(Integer, default=10)
    is_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relacionamento com o utilizador
    user = relationship("User", backref="quests")