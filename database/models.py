from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# =====================================================================
# MÓDULO 1: AUTENTICAÇÃO E GAMIFICAÇÃO (A Equipa)
# =====================================================================

class User(Base):
    """Tabela de Utilizadores (RBAC e Gamificação)"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="client") # 'admin', 'analyst', 'client'
    
    # Sistema de Gamificação Acoplado ao Utilizador
    xp_total = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relações
    tenants = relationship("Tenant", back_populates="owner")
    quests = relationship("Quest", back_populates="assigned_to")

# =====================================================================
# MÓDULO 2: O NÚCLEO MULTI-TENANT (O Cofre de Clientes)
# =====================================================================

class Tenant(Base):
    """O Cliente/Marca. Tudo no sistema gira em torno desta tabela."""
    __tablename__ = 'tenants'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False) # Ex: "Lojas Renner"
    social_handle = Column(String, nullable=False) # Ex: "@lojasrenner"
    niche = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    keywords = Column(String, nullable=True)
    
    # Relações Descendentes (O que pertence a este cliente)
    owner = relationship("User", back_populates="tenants")
    personas = relationship("Persona", back_populates="tenant", cascade="all, delete")
    tracked_profiles = relationship("TrackedProfile", back_populates="tenant", cascade="all, delete")
    social_insights = relationship("SocialInsight", back_populates="tenant", cascade="all, delete")
    quests = relationship("Quest", back_populates="tenant", cascade="all, delete")

class Persona(Base):
    """Público-Alvo mapeado para o Oráculo e Calibrador de IA."""
    __tablename__ = 'personas'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    name = Column(String, nullable=False) # Ex: "Mãe Corporativa"
    age_range = Column(String)
    
    tenant = relationship("Tenant", back_populates="personas")

# =====================================================================
# MÓDULO 3: SCOUT E INTELIGÊNCIA (O Radar da Web e Arena)
# =====================================================================

class TrackedProfile(Base):
    """SALA DE COMANDO: Os Alvos de Raspagem (O próprio cliente + Concorrentes)"""
    __tablename__ = 'tracked_profiles'
    __table_args__ = (UniqueConstraint('tenant_id', 'username', name='uix_tenant_username'),)
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    username = Column(String, index=True, nullable=False) # Removido o Unique global para permitir que 2 clientes rastreiem a @zara
    niche = Column(String) 
    is_client_account = Column(Boolean, default=False) # True = Nossa Conta / False = Concorrente (Arena)
    is_active = Column(Boolean, default=True)
    
    added_at = Column(DateTime, default=datetime.now)
    last_scraped_at = Column(DateTime, nullable=True)
    
    tenant = relationship("Tenant", back_populates="tracked_profiles")
    ads = relationship("CompetitorAd", back_populates="tracked_profile", cascade="all, delete")

class SocialInsight(Base):
    """OUVIDORIA SOCIAL: O Big Data da página Scout (Dores, Medos, Aspirações)."""
    __tablename__ = 'social_insights'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    platform = Column(String, nullable=False) # Ex: "TikTok", "Reddit"
    quote = Column(Text, nullable=False) # O comentário real
    category = Column(String, nullable=False) # "Dor", "Medo", "Aspiração"
    intensity = Column(String, nullable=False) # "Baixa", "Média", "Alta", "Extrema"
    created_at = Column(DateTime, default=datetime.now)
    
    tenant = relationship("Tenant", back_populates="social_insights")

class CompetitorAd(Base):
    """A ARENA: O Radar de Tráfego Pago (Ad Intel)."""
    __tablename__ = 'competitor_ads'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_profile_id = Column(Integer, ForeignKey('tracked_profiles.id'), nullable=False)
    format = Column(String) # "Reels", "Carrossel", "Imagem Estática"
    hook_text = Column(Text)
    days_active = Column(Integer, default=1)
    status = Column(String) # "Vencedor", "Escalando", "Teste"
    last_seen_at = Column(DateTime, default=datetime.now)
    
    tracked_profile = relationship("TrackedProfile", back_populates="ads")

# =====================================================================
# MÓDULO 4: HISTÓRICO E ORÁCULO (A Máquina de Previsão)
# =====================================================================

class ProfileHistory(Base):
    """Histórico Diário para Gráficos de Crescimento."""
    __tablename__ = 'profile_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)

class Post(Base):
    """O Arquivo Estático do Post."""
    __tablename__ = 'posts'
    
    shortcode = Column(String, primary_key=True)
    username = Column(String, index=True, nullable=False)
    published_at = Column(DateTime)
    media_type = Column(String)
    caption = Column(Text)
    url = Column(String)
    # Novo Campo para a IA categorizar no Oráculo:
    hook_strategy = Column(String, nullable=True) 

class PostSnapshot(Base):
    """O Radar de Desempenho Contínuo do Post (Sincronizado com a Matriz)."""
    __tablename__ = 'post_snapshots'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    post_shortcode = Column(String, ForeignKey('posts.shortcode'), nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    views = Column(Integer, default=0)
    saves = Column(Integer, default=0) # Adicionado para a Matriz Analítica do Dash
    engagement_rate = Column(Float, default=0.0)

# =====================================================================
# MÓDULO 5: MISSÕES E OPERAÇÃO (Gamificação)
# =====================================================================

class Quest(Base):
    """Tarefas diárias/semanais geradas pelo Gestor ou pela IA."""
    __tablename__ = 'quests'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    assigned_to_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    task_description = Column(String, nullable=False)
    quest_type = Column(String) # "Operacional", "Estratégico", "Comunidade"
    xp_reward = Column(Integer, default=50)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    tenant = relationship("Tenant", back_populates="quests")
    assigned_to = relationship("User", back_populates="quests")

    # =====================================================================
# MÓDULO 6: VÓRTEX (Infiltração e Lookalike)
# =====================================================================

class VortexTarget(Base):
    """Fila de alvos qualificados pela IA para o Terminal Sniper."""
    __tablename__ = 'vortex_targets'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete="CASCADE"), nullable=False)
    
    # Dados do Alvo
    username = Column(String, index=True, nullable=False)
    name = Column(String)
    bio = Column(Text)
    origin = Column(String) # Ex: "Curtiu post da @zara_brasil"
    
    # Inteligência
    match_score = Column(Integer, default=0) # 0 a 100
    ai_analysis = Column(Text)
    suggested_hook = Column(Text)
    
    # Controle de Ação: 'pending' (na fila), 'engaged' (você interagiu), 'ignored' (descartado)
    status = Column(String, default="pending", index=True) 
    
    created_at = Column(DateTime, default=datetime.now)
    
    # Relação com o Tenant (Cliente)
    tenant = relationship("Tenant", backref="vortex_targets")

class TrendInsight(Base):
    """
    Tabela 1 do Radar Tríplice: As tendências efêmeras (Notícias Quentes e Entretenimento BR)
    """
    __tablename__ = "trend_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    topic = Column(String)
    category = Column(String) # Ex: "Notícia Quente", "Entretenimento BR", "Tech"
    heat = Column(String)     # Ex: "Extremo", "Alto"
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant")

class AuthorityProof(Base):
    """
    Tabela 2 do Radar Tríplice: O Acervo de Autoridade (Notícias do nicho, estudos, entrevistas)
    """
    __tablename__ = "authority_proofs"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    title = Column(String)
    source_url = Column(String)
    source_name = Column(String) # Ex: "G1", "Forbes", "Exame"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    tenant = relationship("Tenant")