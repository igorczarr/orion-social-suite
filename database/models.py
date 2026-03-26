from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, UniqueConstraint, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

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
    keywords = Column(String, nullable=True)
    
    encrypted_ig_session = Column(Text, nullable=True) # Cofre de Credenciais
    
    # Relações Descendentes
    owner = relationship("User", back_populates="tenants")
    personas = relationship("Persona", back_populates="tenant", cascade="all, delete")
    tracked_profiles = relationship("TrackedProfile", back_populates="tenant", cascade="all, delete")
    social_insights = relationship("SocialInsight", back_populates="tenant", cascade="all, delete")
    persona_dossiers = relationship("PersonaDossier", back_populates="tenant", cascade="all, delete")
    
    # FASE 4: Novos Relacionamentos do Growth OS
    brand_equity = relationship("BrandEquity", back_populates="tenant", uselist=False, cascade="all, delete")
    alpha_signals = relationship("AlphaSignal", back_populates="tenant", cascade="all, delete")
    syndicate_episodes = relationship("MediaSyndicate", back_populates="tenant", cascade="all, delete")

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
    """
    A Síntese Comportamental (JTBD e Níveis de Consciência de Eugene Schwartz).
    """
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
    """
    O Auditor de Vulnerabilidade Corporativa (Pilar 3 Extremo).
    Mapeia a Matriz ERRC e a Engenharia Reversa do Funil do inimigo.
    """
    __tablename__ = 'competitor_war_room'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_profile_id = Column(Integer, ForeignKey('tracked_profiles.id'), nullable=False)
    
    campaign_url = Column(String, nullable=False)
    detected_hook = Column(Text)
    cialdini_trigger = Column(String)
    
    # Matriz Oceano Azul
    market_gap = Column(Text) # A Fricção que o inimigo gera
    counter_strategy = Column(Text) # Instrução de ataque gerada pela IA
    
    # NOVO: O Shadow Funnel (Auditoria de Negócio)
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
    """
    O Oráculo (Pilar 4): Tendências Preditivas de Alternative Data (SerpApi/Reddit).
    O que vai explodir antes de chegar ao mainstream.
    """
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
    """
    Kanban de Retenção: Agenda narrativa do cliente baseada em Dopamina/Ocitocina/Serotonina.
    """
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
    
    tenant = relationship("Tenant", backref="vortex_targets")