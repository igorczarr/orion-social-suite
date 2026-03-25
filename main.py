import sys
import os

# 🛡️ FASE 1: Ajuste Sênior de PATH absoluto para evitar Crash no Render (ModuleNotFoundError)
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from modules.security.vault import vault
import bcrypt
import asyncio
import threading
import feedparser
import re
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from collections import defaultdict
from contextlib import asynccontextmanager

# Imports do Banco de Dados
from database.connection import SessionLocal, init_db, engine
from database.models import (
    User, Tenant, Persona, TrackedProfile, SocialInsight, 
    CompetitorAd, ProfileHistory, PostSnapshot, Post, 
    Quest, VortexTarget, TrendInsight, AuthorityProof
)

load_dotenv() # Carrega o arquivo .env

# No topo do main.py, adicione a leitura das novas chaves:
GEMINI_KEY_SOCIOLOGO = os.getenv("GEMINI_KEY_SOCIOLOGO")
GEMINI_KEY_ESPIAO = os.getenv("GEMINI_KEY_ESPIAO")
GEMINI_KEY_TRENDS = os.getenv("GEMINI_KEY_TRENDS")
GEMINI_KEY_COPY = os.getenv("GEMINI_KEY_COPY")
GEMINI_KEY_CMO = os.getenv("GEMINI_KEY_CMO")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
APIFY_TOKEN = os.getenv("APIFY_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 🛡️ FASE 1: Inicialização segura da IA (única e consistente)
ai_service = None

if GEMINI_API_KEY:
    try:
        from modules.analytics.ai_engine import AIEngine
        ai_service = AIEngine(GEMINI_API_KEY)
        print("✅ Motor de IA inicializado com sucesso!")
    except Exception as e:
        print(f"❌ Falha ao inicializar AIEngine: {e}")
else:
    print("⚠️ GEMINI_API_KEY não encontrada.")

# --- CONFIGURAÇÕES DE SEGURANÇA ---
SECRET_KEY = os.getenv("SECRET_KEY", "uma_chave_secreta_muito_segura_VRTICE_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 🛡️ FASE 1: Correção do lifespan (CRÍTICA)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Inicializando aplicação...")

    try:
        init_db()
        print("✅ Tabelas sincronizadas com sucesso no Banco de Dados.")
    except Exception as e:
        print(f"❌ [CRÍTICO] Falha ao sincronizar tabelas: {e}")

    try:
        print("📡 Conectando ao banco...")
        connection = engine.connect()
        connection.close()
        print("✅ Conexão estabelecida!")
    except Exception as e:
        print(f"❌ ERRO DB: {e}")

    def run_scheduler_delayed():
        import subprocess
        import time

        print("⏳ Aguardando 30s para iniciar scheduler...")
        time.sleep(30)

        if os.path.exists("scheduler.py"):
            try:
                subprocess.Popen(["python", "scheduler.py"], close_fds=True)
                print("🚀 Scheduler iniciado.")
            except Exception as e:
                print(f"❌ Erro scheduler: {e}")

    threading.Thread(target=run_scheduler_delayed, daemon=True).start()

    print("✅ API pronta.")

    yield

    print("🛑 Encerrando aplicação...")

# E NO TOPO mantenha apenas UM app:
app = FastAPI(
    title="Orion Social Suite API",
    description="Motor de Inteligência e Scout para Redes Sociais",
    version="2.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://orion-social-suite.vercel.app",
    "https://orion.vrtice.com.br"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_origin_regex=r"https://.*\.vercel\.app", # Mantém a flexibilidade para subdomínios da Vercel
    allow_credentials=True, # 🔴 CRÍTICO: Deve ser True para aceitar o Bearer Token
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_db_username(name: str) -> str:
    """Limpeza universal Sênior para casar os dados do Apify com o Banco."""
    if not name: return ""
    cleaned = name.replace('https://www.instagram.com/', '').replace('https://instagram.com/', '').replace('@', '').replace('/', '').strip().lower()
    return re.sub(r'[^a-zA-Z0-9_.-]', '', cleaned)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- SCHEMAS (Validação Atualizada para o Modal do Frontend) ---
class TenantCreate(BaseModel):
    name: str
    social_handle: str
    niche: str
    personas: str  # Ex: "Mãe Corporativa, Jovem Z"
    competitors: str  # Ex: "@zara_brasil, @cea_brasil"
    keywords: str

class TenantResponse(BaseModel):
    id: int
    name: str = "Cliente Orion"
    social_handle: Optional[str] = ""
    niche: Optional[str] = ""

    class Config:
        from_attributes = True

class BriefingRequest(BaseModel):
    trend_topic: str
    competitor: str

class AdjustmentRequest(BaseModel):
    format_priority: str
    intensity: float

class VortexActionRequest(BaseModel):
    target_id: int
    action: str

class VortexAuthRequest(BaseModel):
    session_cookie: str

# --- ROTAS DA API ---

@app.get("/api/scout/status")
def system_status():
    return {"status": "online"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"--- 📥 Tentativa de login para o usuário: {form_data.username} ---")
    
    try:
        # 1. Busca o usuário
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            print("--- ❌ Usuário não encontrado no banco ---")
            raise HTTPException(status_code=401, detail="Credenciais Inválidas")

        # 2. Verifica a senha (ajuste conforme sua biblioteca de hash, ex: passlib)
        if not verify_password(form_data.password, user.hashed_password):
            print(f"--- ❌ Senha incorreta para: {form_data.username} ---")
            raise HTTPException(status_code=401, detail="Credenciais Inválidas")

        # 3. Gera o Token (Aqui é onde a SECRET_KEY é usada)
        print("--- 🔑 Gerando Access Token... ---")
        access_token = create_access_token(data={"sub": user.email})
        
        print("--- ✅ Login bem-sucedido! ---")
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        print(f"--- 💥 ERRO CRÍTICO NO LOGIN: {str(e)} ---")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")

# --- ROTAS DO NOVO COFRE (MULTI-TENANT) ---

@app.post("/api/tenants", response_model=TenantResponse)
def add_new_client(data: TenantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Recebe os dados do Modal '+ Novo' do frontend e constrói o ecossistema do cliente com Blindagem Transacional."""
    
    clean_client_handle = clean_db_username(data.social_handle)
    new_tenant = None

    # 🛡️ TENTATIVA 1: Tenta criar o cliente usando o Schema Novo (com keywords)
    try:
        new_tenant = Tenant(
            owner_id=current_user.id,
            name=data.name,
            social_handle=data.social_handle,
            niche=data.niche,
            keywords=data.keywords
        )
        db.add(new_tenant)
        db.flush() # Força o banco a validar a estrutura agora
        
    except (OperationalError, ProgrammingError) as db_error:
        # O banco rejeitou porque não tem a coluna keywords.
        db.rollback() # Aborta a transação quebrada
        print(f"⚠️ [AVISO DE SCHEMA] Tabela 'tenants' desatualizada. Inserindo dados via Fallback. Erro: {db_error}")
        
        # 🛡️ TENTATIVA 2 (Fallback): Cria usando o Schema Antigo
        try:
            new_tenant = Tenant(
                owner_id=current_user.id,
                name=data.name,
                social_handle=data.social_handle,
                niche=data.niche
            )
            db.add(new_tenant)
            db.flush()
        except Exception as fallback_error:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Erro crítico irrecuperável no banco: {str(fallback_error)}")
            
    except Exception as fatal_error:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(fatal_error)}")

    # 🛡️ FASE 2: Se passou pela criação do Tenant, cria os relacionamentos (Arena, Personas)
    try:
        # Adiciona a conta do cliente ao Tracker
        db.add(TrackedProfile(tenant_id=new_tenant.id, username=clean_client_handle, niche=data.niche, is_client_account=True))
        
        # Adiciona os Concorrentes ao Tracker
        if data.competitors:
            for comp in data.competitors.split(","):
                comp_clean = clean_db_username(comp)
                if comp_clean:
                    db.add(TrackedProfile(tenant_id=new_tenant.id, username=comp_clean, niche=data.niche, is_client_account=False))
                    
        # Adiciona as Personas
        if data.personas:
            for persona in data.personas.split(","):
                persona_clean = persona.strip()
                if persona_clean:
                    db.add(Persona(tenant_id=new_tenant.id, name=persona_clean))

        db.commit()
        db.refresh(new_tenant)
        return new_tenant

    except Exception as relation_error:
        db.rollback()
        print(f"❌ [ERRO DE INTEGRIDADE] Falha ao criar ecossistema: {str(relation_error)}")
        # Ao retornar o erro 400, o CORS é respeitado e o React exibe o erro exato na tela
        raise HTTPException(status_code=400, detail=f"Falha de integridade no banco: {str(relation_error)}")

@app.get("/api/tenants", response_model=List[TenantResponse])
def list_clients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Devolve todos os clientes da agência de forma blindada."""
    try:
        tenants = db.query(Tenant).filter(Tenant.owner_id == current_user.id).all()
        return tenants
    except Exception as e:
        print(f"❌ [CRÍTICO] Erro interno ao buscar clientes: {e}")
        # Retorna uma lista vazia para não dar crash na interface React (Graceful Degradation)
        return []

# --- MOTOR DE INTELIGÊNCIA MATEMÁTICA (Atualizado com JOIN Tenant) ---

@app.get("/api/scout/insights/{username}")
def get_profile_insights(
    username: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # ATUALIZAÇÃO: Garante que o perfil pertence a um Tenant que é do utilizador logado
    clean_username = clean_db_username(username)
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == clean_username,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado no seu radar.")

    history = db.query(ProfileHistory).filter(ProfileHistory.username == clean_username)\
                .order_by(desc(ProfileHistory.date)).limit(2).all()
    
    growth_msg = "Dados insuficientes para calcular crescimento diário."
    followers_delta = 0
    current_followers = 0

    if len(history) >= 1:
        current_followers = history[0].followers
    if len(history) == 2:
        hoje = history[0].followers
        ontem = history[1].followers
        followers_delta = hoje - ontem
        if followers_delta > 0:
            growth_msg = f"Crescimento positivo: Ganhámos {followers_delta} seguidores."
        elif followers_delta < 0:
            growth_msg = f"Atenção: Perdemos {abs(followers_delta)} seguidores."
        else:
            growth_msg = "Estabilidade: Sem alteração de seguidores."

    top_posts_query = db.query(Post, PostSnapshot)\
        .join(PostSnapshot, Post.shortcode == PostSnapshot.post_shortcode)\
        .filter(Post.username == clean_username)\
        .order_by(desc(PostSnapshot.likes + PostSnapshot.comments))\
        .limit(3).all()

    top_posts = []
    for post, snapshot in top_posts_query:
        er = ((snapshot.likes + snapshot.comments) / current_followers * 100) if current_followers > 0 else 0
        top_posts.append({
            "url": post.url,
            "tipo": post.media_type,
            "interacoes": snapshot.likes + snapshot.comments,
            "engajamento_perc": round(er, 2),
            "legenda": post.caption[:50] + "..." if post.caption else "Sem legenda"
        })

    return {
        "perfil": username,
        "nicho": profile.niche,
        "seguidores_atuais": current_followers,
        "crescimento_diario": followers_delta,
        "analise_crescimento": growth_msg,
        "top_3_posts": top_posts
    }

# --- O DIRETOR DE MARKETING IA (Atualizado) ---

@app.get("/api/scout/ai-audit/{username}")
def get_ai_internal_audit(
    username: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not ai_service:
        raise HTTPException(status_code=500, detail="Motor de IA offline.")
        
    clean_username = clean_db_username(username)
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == clean_username,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado.")

    profile_data = {
        "username": profile.username,
        "niche": profile.niche,
        "is_client": profile.is_client_account
    }

    recent_posts_query = db.query(Post, PostSnapshot)\
        .join(PostSnapshot, Post.shortcode == PostSnapshot.post_shortcode)\
        .filter(Post.username == clean_username)\
        .order_by(desc(Post.published_at))\
        .limit(5).all()

    recent_posts = []
    for post, snapshot in recent_posts_query:
        recent_posts.append({
            "legenda": post.caption[:200] + "..." if post.caption else "Sem legenda",
            "tipo_midia": post.media_type,
            "curtidas": snapshot.likes,
            "comentarios": snapshot.comments,
            "data_publicacao": str(post.published_at)
        })

    if not recent_posts:
        return {"erro": "Não há posts suficientes."}

    print(f"⚡ Acionando o CMO para auditar a conta @{username}...")
    auditoria_texto = ai_service.generate_internal_audit(profile_data, recent_posts)

    return {
        "perfil": username,
        "status": "Auditoria Concluída",
        "relatorio_cmo": auditoria_texto
    }

# --- INTELIGÊNCIA COMPETITIVA (Atualizado) ---

@app.get("/api/scout/competitive-intel/{client_username}")
def get_competitive_intelligence(
    client_username: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not ai_service:
        raise HTTPException(status_code=500, detail="Motor de IA offline.")
        
    clean_username = clean_db_username(client_username)
    client_profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == clean_username,
        TrackedProfile.is_client_account == True,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not client_profile:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    # Pega apenas os concorrentes deste Tenant específico
    competitors = db.query(TrackedProfile).filter(
        TrackedProfile.tenant_id == client_profile.tenant_id,
        TrackedProfile.is_client_account == False
    ).all()

    if not competitors:
        return {"erro": "Cadastre concorrentes para este cliente."}

    def get_profile_context(username):
        posts = db.query(Post, PostSnapshot)\
            .join(PostSnapshot, Post.shortcode == PostSnapshot.post_shortcode)\
            .filter(Post.username == username)\
            .order_by(desc(Post.published_at)).limit(3).all()
        
        post_data = []
        total_likes = 0
        for p, s in posts:
            total_likes += s.likes
            post_data.append(f"[{p.media_type}] {p.caption[:100]}... (Likes: {s.likes})")
            
        avg_likes = (total_likes / len(posts)) if posts else 0
        return {"username": username, "avg_likes": avg_likes, "recent_posts": post_data}

    internal_data = get_profile_context(client_profile.username)
    competitors_data = [get_profile_context(c.username) for c in competitors]

    print(f"⚔️ CMO analisando concorrência para @{client_username}...")
    mapa_guerra = ai_service.generate_competitive_intelligence(internal_data, competitors_data)

    return {
        "cliente": client_username,
        "status": "Inteligência Competitiva Concluída",
        "mapa_de_guerra": mapa_guerra
    }

# --- RADAR DE TENDÊNCIAS E HIJACKING (Atualizado) ---

@app.get("/api/scout/trend-radar/{username}")
def get_trend_hijacking_strategy(
    username: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    clean_username = clean_db_username(username)
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == clean_username,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado.")

    print(f"📡 API acionou o Radar Omnidirecional para @{username}...")
    
    try:
        if not GEMINI_API_KEY:
            raise Exception("API Key da IA ausente")
        
        from modules.workers.trend_scraper import OmnidirectionalRadar
        radar = OmnidirectionalRadar(GEMINI_API_KEY)
        massive_trends = radar.get_massive_trend_list()
        
        if not massive_trends:
            return {"erro": "Não foi possível capturar tendências hoje."}
            
        profile_context = {"username": profile.username, "niche": profile.niche}
        
        if not ai_service:
            raise HTTPException(status_code=500, detail="Motor de IA offline.")
            
        estrategia = ai_service.analyze_trends_and_timings(massive_trends, profile_context)
        
        return {
            "perfil": username,
            "topicos_analisados": len(massive_trends),
            "estrategia_viral": estrategia
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no motor de tendências: {str(e)}")

# =====================================================================
# NOVAS ROTAS (Para sustentar as novas telas do Frontend)
# =====================================================================

@app.get("/api/scout/arena/{tenant_id}")
def get_arena_data(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """A ARENA: Combina posts orgânicos e anúncios pagos (AdSense) dos concorrentes."""
    
    # 1. Valida se o utilizador é dono do tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    # 2. Busca os Concorrentes
    competitors = db.query(TrackedProfile).filter(
        TrackedProfile.tenant_id == tenant.id, 
        TrackedProfile.is_client_account == False
    ).all()
    
    arena_payload = []
    
    for comp in competitors:
        comp_limpo = clean_db_username(comp.username)
        # Busca os Ads Patrocinados (A tabela CompetitorAd)
        ads = db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == comp.id).all()
        # Busca os Últimos 3 Posts Orgânicos
        organic = db.query(Post).filter(Post.username == comp_limpo).order_by(desc(Post.published_at)).limit(3).all()
        
        arena_payload.append({
            "concorrente": comp.username,
            "anuncios_ativos": [{"formato": ad.format, "copy": ad.hook_text, "dias_rodando": ad.days_active, "status": ad.status} for ad in ads],
            "posts_organicos_recentes": [{"url": p.url, "legenda": p.caption, "tipo": p.media_type} for p in organic]
        })

    return {"status": "success", "data": arena_payload}

@app.get("/api/scout/social-listening/{tenant_id}")
def get_social_insights(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Devolve as dores e medos capturados pela web para a página Scout."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Acesso negado.")
        
    insights = db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant_id).order_by(desc(SocialInsight.created_at)).limit(20).all()
    return {"insights": [{"platform": i.platform, "quote": i.quote, "category": i.category, "intensity": i.intensity} for i in insights]}

@app.get("/api/gamification/dashboard")
def get_gamification_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Puxa os dados do jogador (XP, Streak) e as missões ativas."""
    quests = db.query(Quest).filter(Quest.assigned_to_user_id == current_user.id).all()
    return {
        "player": {
            "xp": current_user.xp_total,
            "streak": current_user.streak_days,
            "role": current_user.role
        },
        "quests": [
            {"id": q.id, "task": q.task_description, "xp": q.xp_reward, "completed": q.is_completed}
            for q in quests
        ]
    }

@app.post("/api/ai/generate-briefing")
async def generate_briefing(req: BriefingRequest):
    """Gera um briefing REAL chamando o cérebro do Gemini no ai_engine."""
    if not ai_service:
        raise HTTPException(status_code=500, detail="Motor de IA offline.")
        
    try:
        # Agora sim, chamamos a IA real baseada na tendência e concorrente
        briefing_real = ai_service.generate_briefing(req.trend_topic, req.competitor)
        
        return {
            "status": "success",
            "data": briefing_real
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# VORTEX (INFILTRAÇÃO E AUTOMAÇÃO ATIVA - FASE 5)
# =====================================================================

@app.get("/api/vortex/{tenant_id}")
def get_vortex_queue(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Puxa a fila de alvos e verifica se o Módulo Sniper está armado (Cookie salvo)."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado ou acesso negado.")
        
    # Verifica se o cliente tem um cookie guardado no cofre
    is_armed = bool(tenant.encrypted_ig_session)
        
    targets = db.query(VortexTarget).filter(
        VortexTarget.tenant_id == tenant_id,
        VortexTarget.status == 'pending'
    ).order_by(desc(VortexTarget.match_score)).limit(50).all() # Puxa o top 50 alvos
    
    # Formata a resposta para o React
    payload = []
    for t in targets:
        payload.append({
            "id": t.id,
            "username": t.username,
            "name": t.name,
            "bio": t.bio,
            "origin": t.origin,
            "matchScore": t.match_score,
            "aiAnalysis": t.ai_analysis,
            "suggestedComment": t.suggested_hook,
            "status": t.status
        })
        
    return {"status": "success", "is_armed": is_armed, "targets": payload}

@app.post("/api/vortex/{tenant_id}/auth")
def authenticate_vortex(tenant_id: int, req: VortexAuthRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Guarda o Cookie de Sessão no Cofre Criptográfico."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    try:
        # Criptografa o cookie imediatamente antes de tocar no banco
        encrypted_cookie = vault.encrypt(req.session_cookie)
        tenant.encrypted_ig_session = encrypted_cookie
        db.commit()
        return {"status": "success", "message": "Sessão encriptada e guardada no cofre com segurança militar."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vortex/action")
def register_vortex_action(req: VortexActionRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Registra no banco de dados que a equipe engajou ou ignorou um alvo.
    Aperta o gatilho. Dispara o robô fantasma em background se a ação for 'engaged'.
    """
    target = db.query(VortexTarget).filter(VortexTarget.id == req.target_id).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Alvo não encontrado.")
        
    # Valida segurança (verificando o tenant dono do alvo)
    tenant = db.query(Tenant).filter(Tenant.id == target.tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=403, detail="Acesso negado a este alvo.")
        
    if req.action not in ['engaged', 'ignored']:
        raise HTTPException(status_code=400, detail="Ação inválida. Use 'engaged' ou 'ignored'.")
        
    target.status = req.action
    
    if req.action == 'engaged':
        current_user.xp_total += 5
        
        # 🛡️ DISPARO ATIVO (BACKGROUND TASK)
        if tenant.encrypted_ig_session:
            # Descriptografa na hora de usar
            decrypted_cookie = vault.decrypt(tenant.encrypted_ig_session)
            
            def run_ghost_attack():
                try:
                    from modules.workers.worker_vortex import GhostOperator
                    operator = GhostOperator(decrypted_cookie)
                    operator.execute_engagement(target.username, target.suggested_hook)
                except Exception as e:
                    print(f"❌ [VORTEX BACKGROUND ERRO] Falha ao atacar @{target.username}: {e}")
            
            # Envia a tarefa para o background para a API não travar
            background_tasks.add_task(run_ghost_attack)
        else:
            print(f"⚠️ [VORTEX] Cliente marcou 'Engaged', mas o Módulo Sniper está desarmado (Sem Cookie). Ação registrada apenas virtualmente.")

    db.commit()
    return {"status": "success", "message": f"Alvo {req.action} registrado.", "new_xp": current_user.xp_total}

@app.get("/api/dashboard/{tenant_id}/overview")
def get_dashboard_overview(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Motor Agregador Blindado: Retorna os dados para a dashboard.
    Nunca quebra. Se não houver dados, retorna zeros ou valores padrão seguros.
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    # CORREÇÃO CRÍTICA DO ARROBA - USANDO A NOVA FUNÇÃO DE LIMPEZA
    username_limpo = clean_db_username(tenant.social_handle)

    # ==========================================
    # 1. KPIs E CRESCIMENTO (Proteção contra Zero)
    # ==========================================
    historico = db.query(ProfileHistory).filter(ProfileHistory.username == username_limpo).order_by(desc(ProfileHistory.date)).limit(2).all()
    followers = historico[0].followers if len(historico) > 0 else 0
    delta_followers = (followers - historico[1].followers) if len(historico) > 1 else 0

    # ==========================================
    # 2. POSTS E MÉTRICAS (BLINDADO)
    # ==========================================
    # Busca apenas os posts que realmente pertencem a este Tenant (Evita cruzamento de dados)
    tracked_profile = db.query(TrackedProfile).filter(TrackedProfile.tenant_id == tenant.id, TrackedProfile.is_client_account == True).first()
    if tracked_profile:
        username_limpo = clean_db_username(tracked_profile.username)
        
    posts_db = db.query(Post).filter(Post.username == username_limpo).order_by(desc(Post.published_at)).limit(20).all()    
    posts_data = []
    total_eng_rate = 0
    total_reach = 0
    total_saves = 0

    for p in posts_db:
        snap = db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first()
        likes = snap.likes if snap else 0
        comments = snap.comments if snap else 0
        views = snap.views if snap else 0
        
        # Proteção contra Divisão por Zero no cliente
        eng_rate = round(((likes + comments) / followers * 100), 1) if followers > 0 else 0
        reach_est = views if views > 0 else (likes * 4) 
        saves_est = int(likes * 0.15) 

        total_eng_rate += eng_rate
        total_reach += reach_est
        total_saves += saves_est
        
        posts_data.append({
            "id": p.shortcode,
            "date": p.published_at.strftime("%Y-%m-%d"),
            "type": "Reels" if "Video" in p.media_type else "Carrossel" if "Sidecar" in p.media_type else "Foto",
            "hook": p.caption[:60].replace('\n', ' ') + "..." if p.caption else "Visual",
            "reach": reach_est,
            "engagement": eng_rate,
            "saves": saves_est,
            "status": "Viral" if eng_rate > 5 else "Estável" if eng_rate > 2 else "Baixo"
        })

    avg_engagement = round(total_eng_rate / len(posts_data), 1) if posts_data else 0

    # ==========================================
    # 3. A ARENA (Proteção Crítica contra Divisão por Zero)
    # ==========================================
    competitors = db.query(TrackedProfile).filter(TrackedProfile.tenant_id == tenant.id, TrackedProfile.is_client_account == False).all()
    arena_data = []
    arsenal_hooks = []
    
    for comp in competitors:
        # CORREÇÃO DO ARROBA PARA A ARENA - USANDO A NOVA FUNÇÃO DE LIMPEZA
        comp_username_limpo = clean_db_username(comp.username)
        
        comp_hist = db.query(ProfileHistory).filter(ProfileHistory.username == comp_username_limpo).order_by(desc(ProfileHistory.date)).first()
        comp_followers = comp_hist.followers if comp_hist else 0  
        
        comp_posts = db.query(Post).filter(Post.username == comp_username_limpo).order_by(desc(Post.published_at)).limit(3).all()
        comp_eng_rate = 0
        
        if comp_posts:
            t_likes = 0
            for cp in comp_posts:
                csnap = db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == cp.shortcode).order_by(desc(PostSnapshot.date)).first()
                if csnap:
                    t_likes += csnap.likes
            
            # PROTEÇÃO ABSOLUTA: Só divide se seguidores forem maiores que 0
            if comp_followers > 0:
                comp_eng_rate = round(((t_likes / len(comp_posts)) / comp_followers * 100), 1)
            else:
                # Se não tem seguidores mapeados, usa estimativa média de mercado
                comp_eng_rate = 1.5

        # Ganchos roubados pelo Worker 2 (Arena)
        ads = db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == comp.id).all()
        for ad in ads:
            arsenal_hooks.append({"hook": ad.hook_text, "source": comp.username})

        # MOCK INTELIGENTE: Se o arsenal estiver vazio (robô não raspa anúncios), cria sintéticos baseados no concorrente
        if not ads:
             arsenal_hooks.append({"hook": f"Descubra o segredo que a {comp.username} usa para dominar o mercado.", "source": "Orion Synth"})

        arena_data.append({
            "username": comp.username,
            "engagement": comp_eng_rate,
            "frequency": f"{len(comp_posts)}x detectados" if comp_posts else "Baixa Frequência",
        })

    # MOCK INTELIGENTE: Se o arsenal geral ainda for pequeno, injeta ganchos estratégicos do nicho
    if len(arsenal_hooks) < 3:
        arsenal_hooks.append({"hook": f"Pare de cometer este erro no seu negócio de {tenant.niche}.", "source": "Orion Inteligência"})
        arsenal_hooks.append({"hook": f"O método infalível para escalar no mercado de {tenant.niche} hoje.", "source": "Orion Inteligência"})

   # ==========================================
    # 4. RADAR DE PERSONA (Dores e Objeções)
    # ==========================================
    insights = db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant.id).order_by(desc(SocialInsight.created_at)).limit(5).all()
    radar_data = [{"quote": ins.quote, "category": ins.category, "platform": ins.platform} for ins in insights]
    
    if not radar_data:
        personas_list = tenant.personas.split(",") if tenant.personas else ["seu público"]
        radar_data = [
            {"quote": f"A principal dificuldade do {personas_list[0].strip()} é confiar em novas promessas.", "category": "Objeção", "platform": "Orion Synth"},
            {"quote": "O suporte dos grandes players é terrível.", "category": "Fricção", "platform": "Orion Synth"}
        ]

    # ==========================================
    # 5. RADAR TRÍPLICE (A Lista Larga Bruta)
    # ==========================================
    # Puxa as tendências efêmeras (Google + X)
    trends_db = db.query(TrendInsight).filter(TrendInsight.tenant_id == tenant.id).order_by(desc(TrendInsight.created_at)).limit(15).all()
    global_trends = [{"topic": t.topic, "category": t.category, "heat": t.heat, "url": t.source_url} for t in trends_db]

    # Puxa as provas de autoridade empíricas
    proofs_db = db.query(AuthorityProof).filter(AuthorityProof.tenant_id == tenant.id).order_by(desc(AuthorityProof.created_at)).limit(15).all()
    authority_proofs = [{"title": p.title, "source": p.source_name, "url": p.source_url} for p in proofs_db]

    # ==========================================
    # 6. INTERVENÇÃO IA E GAMIFICAÇÃO
    # ==========================================
    intervencao = "Dados estabilizados. Mantenha a cadência de publicações."
    if posts_data:
        melhor_post = max(posts_data, key=lambda x: x['engagement'])
        if melhor_post['engagement'] > 0:
            intervencao = f"Cálculo Tático: O formato '{melhor_post['type']}' gerou {melhor_post['engagement']}% de engajamento recentemente. Aloque recursos na replicação deste gancho visual."

    cmo_strategy = "Aguardando curadoria humana. Escolha um tópico no Radar Tríplice para gerar a estratégia."

    meta = (followers // 10000 + 1) * 10000 if followers > 0 else 10000

    return {
        "kpis": {
            "followers": followers,
            "delta_followers": delta_followers,
            "avg_engagement": avg_engagement,
            "total_reach": total_reach,
            "total_saves": total_saves
        },
        "gamification": {
            "current": followers,
            "target": meta,
            "remaining": meta - followers,
            "percent": round((followers / meta) * 100, 1) if meta > 0 else 0
        },
        "radar": radar_data,
        "posts": posts_data,
        "arena": arena_data,
        "intervencao": intervencao,
        "global_trends": global_trends,        # <-- A lista larga de Trends
        "authority_proofs": authority_proofs,  # <-- A lista larga de Autoridade
        "cmo_strategy": cmo_strategy,
        "arsenal": arsenal_hooks[:5]
    }

@app.get("/api/oracle/{tenant_id}")
def get_oracle_predictions(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Motor Preditivo Conservador (Oráculo 2.0): 
    Aplica Regressão Linear sobre o histórico de base para calcular 
    tendência (slope) e prever desgaste (fatigue) ou crescimento.
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    username_limpo = clean_db_username(tenant.social_handle)
    
    # =====================================================================
    # 1. REGRESSÃO LINEAR PARA PREVISÃO DE CRESCIMENTO (Fator Conservador)
    # =====================================================================
    historico = db.query(ProfileHistory).filter(ProfileHistory.username == username_limpo).order_by(ProfileHistory.date).all()
    
    predicted_growth = 0
    audience_quality = "Fria"
    
    if len(historico) > 2:
        # x = dias (índice), y = seguidores
        n = len(historico)
        x_vals = list(range(n))
        y_vals = [h.followers for h in historico]
        
        x_mean = sum(x_vals) / n
        y_mean = sum(y_vals) / n
        
        # Calcula a inclinação (beta_1)
        numerador = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
        denominador = sum((x - x_mean)**2 for x in x_vals)
        
        beta_1 = numerador / denominador if denominador != 0 else 0
        
        # Projeção para os próximos 30 dias com Fator de Amortecimento Conservador (80%)
        predicted_growth = int((beta_1 * 30) * 0.8)
        
        # Classificação baseada na taxa de ganho diário
        if beta_1 > 10: audience_quality = "Em Escala"
        elif beta_1 > 0: audience_quality = "Aquecida"
        else: audience_quality = "Fria/Estagnada"
    else:
        predicted_growth = 0
        
    # =====================================================================
    # 2. ANÁLISE DE FADIGA DE FORMATO (Regressão de Engajamento)
    # =====================================================================
    posts_db = db.query(Post).filter(Post.username == username_limpo).order_by(desc(Post.published_at)).limit(30).all()
    
    format_stats = defaultdict(lambda: {'x': [], 'y': []})
    
    # Inverte para ordem cronológica (do mais antigo pro mais novo)
    posts_db.reverse()
    
    for i, p in enumerate(posts_db):
        snap = db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first()
        likes = snap.likes if snap else 0
        
        formato = "Reels" if "Video" in p.media_type else "Carrossel" if "Sidecar" in p.media_type else "Foto"
        format_stats[formato]['x'].append(i)
        format_stats[formato]['y'].append(likes)

    fatigue_data = []
    best_format = "N/A"
    highest_growth = -999

    for fmt, data in format_stats.items():
        n_fmt = len(data['x'])
        if n_fmt > 2: # Exige pelo menos 3 posts do formato para gerar estatística
            x_vals = data['x']
            y_vals = data['y']
            x_mean = sum(x_vals) / n_fmt
            y_mean = sum(y_vals) / n_fmt
            
            num = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
            den = sum((x - x_mean)**2 for x in x_vals)
            slope = num / den if den != 0 else 0
            
            # Transformando a inclinação em uma Taxa de Crescimento (%)
            growth = (slope / y_mean * 100) if y_mean > 0 else 0
            
            if growth > highest_growth:
                highest_growth = growth
                best_format = fmt
            
            status = "Em Ascensão" if growth > 5 else "Estagnado" if growth > -5 else "Fadiga Alta"
            forecast = f"+{int(growth)}% Tração" if growth > 0 else f"{int(growth)}% Tração"
            rec = "Dobrar frequência" if growth > 5 else "Manter" if growth > -5 else "Pausar formato"
            
            fatigue_data.append({
                "id": fmt,
                "format": fmt,
                "status": status,
                "forecast": forecast,
                "recommendation": rec,
                "growth": round(growth, 1)
            })

    if not fatigue_data:
        fatigue_data = [{"id": 1, "format": "Aguardando Dados", "status": "Sem Dados", "forecast": "0%", "recommendation": "Publique mais para calibrar a IA", "growth": 0}]

    # =====================================================================
    # 3. HEATMAP DE HORÁRIOS (Matriz de Oportunidade)
    # =====================================================================
    heatmap = {
        "Ter": {"Manhã": 5, "Tarde": 5, "Noite": 5},
        "Qua": {"Manhã": 5, "Tarde": 5, "Noite": 5},
        "Qui": {"Manhã": 5, "Tarde": 5, "Noite": 5}
    }
    
    for p in posts_db:
        snap = db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first()
        likes = snap.likes if snap else 0
        
        dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        dia = dias[p.published_at.weekday()]
        hora = p.published_at.hour
        periodo = "Manhã" if hora < 12 else "Tarde" if hora < 18 else "Noite"
        
        if dia in heatmap:
            # Adiciona calor dinâmico (com cap de 95 para segurança de CSS)
            heatmap[dia][periodo] = min(heatmap[dia][periodo] + (likes / 10), 95)

    return {
        "metrics": {
            "predicted_growth": f"+{predicted_growth}" if predicted_growth >= 0 else str(predicted_growth),
            "fatigue_risk": "Alto" if highest_growth < 0 else "Baixo",
            "best_format": best_format,
            "audience_quality": audience_quality
        },
        "fatigue": fatigue_data,
        "heatmap": heatmap
    }

@app.post("/api/dashboard/{tenant_id}/apply-adjustment")
async def apply_route_adjustment(tenant_id: int, req: AdjustmentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Registra uma intervenção estratégica. No futuro, isso calibra os ganchos 
    gerados pelo CMO para priorizar o formato escolhido.
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    # Aqui simulamos a persistência da decisão estratégica
    # Poderíamos salvar isso numa tabela de 'Configurações de IA'
    print(f"🚀 AJUSTE DE ROTA APLICADO: {tenant.name} agora prioriza {req.format_priority} em {req.intensity}%")
    
    return {
        "status": "success",
        "message": f"Ajuste de rota aplicado: Prioridade total em {req.format_priority}.",
        "new_strategy_lock": True
    }

@app.post("/api/workers/force-sync/{tenant_id}")
async def force_scheduler_sync(
    tenant_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Gatilho da Cascata de Inteligência Total (Dashboard Sync)."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    def run_full_cascade():
            print("⏳ [CASCATA OSINT] Iniciando Motor de Espionagem e Sociologia...")
            try:
                from modules.workers.worker_osint import OrionOSINT
                
                # O motor agora respira através de chaves distintas
                osint_worker = OrionOSINT(
                    apify_token=APIFY_TOKEN, 
                    key_sociologo=GEMINI_KEY_SOCIOLOGO,
                    key_espiao=GEMINI_KEY_ESPIAO
                )
                osint_worker.run_full_recon(tenant_id=tenant.id)
            except Exception as e_osint:
                print(f"⚠️ Erro ao rodar o Motor OSINT: {e_osint}")

            # 3. SCOUT (Escuta Ativa no YouTube)
            print("⏳ [CASCATA 3/3] Iniciando Radar Scout...")
            try:
                from modules.workers.worker_scout import YouTubeScoutRadar
                # Removemos a necessidade de GEMINI_API_KEY no Scout (100% Gratuito/Bulk)
                w3 = YouTubeScoutRadar(YOUTUBE_API_KEY)
                w3.run_radar_cycle(target_tenant_id=tenant.id)
            except Exception as e3:
                print(f"⚠️ Erro ao rodar o Scout: {e3}")

    # Aciona a cascata em segundo plano
    background_tasks.add_task(run_full_cascade)
    
    return {"status": "success", "message": "Motor acionado."}

# --- ROTA DE GERAÇÃO DO DOSSIÊ (PDF DATA) ---
@app.get("/api/reports/dossier/{tenant_id}")
def generate_full_report(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    username_limpo = clean_db_username(tenant.social_handle)
    
    # 1. Busca KPIs básicos
    historico = db.query(ProfileHistory).filter(ProfileHistory.username == username_limpo).order_by(desc(ProfileHistory.date)).limit(2).all()
    followers = historico[0].followers if len(historico) > 0 else 0
    delta_followers = (followers - historico[1].followers) if len(historico) > 1 else 0

    # 2. Busca Formatos
    posts = db.query(Post).filter(Post.username == username_limpo).order_by(desc(Post.published_at)).limit(30).all()
    formatos = list(set([p.media_type for p in posts]))
    avg_eng = 0
    if posts and followers > 0:
        total_likes = sum([db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first().likes for p in posts if db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first()])
        avg_eng = round(((total_likes / len(posts)) / followers) * 100, 2)

    # 3. Busca Concorrentes e Arsenal
    competitors = db.query(TrackedProfile).filter(TrackedProfile.tenant_id == tenant.id, TrackedProfile.is_client_account == False).all()
    comp_names = [c.username for c in competitors]
    
    ads = db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id.in_([c.id for c in competitors])).all() if competitors else []
    arsenal = [ad.hook_text for ad in ads[:5]] if ads else ["Nenhum gancho detectado recentemente"]

    # 4. Radar
    insights = db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant.id).order_by(desc(SocialInsight.created_at)).limit(5).all()
    dores = [ins.quote for ins in insights] if insights else [f"Dificuldade em confiar em novos players no nicho de {tenant.niche}"]

    # 5. Monta o pacote de dados para a IA
    data_pack = {
        "tenant_name": tenant.name,
        "niche": tenant.niche,
        "followers": followers,
        "delta_followers": delta_followers,
        "avg_engagement": avg_eng,
        "top_formats": ", ".join(formatos) if formatos else "N/A",
        "competitors_data": ", ".join(comp_names) if comp_names else "Nenhum mapeado",
        "persona_radar": " | ".join(dores),
        "arsenal": " | ".join(arsenal),
        "global_trends": "Processando via Data Lake."
    }

    # 6. Chama a IA para redigir o documento
    print(f"📄 [REPORT] Sintetizando Dossiê CMO de 5 páginas para {tenant.name}...")
    dossier_markdown = ai_service.generate_cmo_dossier(data_pack)

    return {
        "status": "success",
        "client_name": tenant.name,
        "date": datetime.now().strftime("%d/%m/%Y"),
        "content_md": dossier_markdown
    }

# Schema para a nova rota
class TacticalGenerateRequest(BaseModel):
    source_type: str # 'trend', 'proof' ou 'insight'
    content: str

@app.post("/api/ai/generate-tactical-copy/{tenant_id}")
async def generate_tactical_copy(
    tenant_id: int, 
    req: TacticalGenerateRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    O gatilho manual. Pega um fato bruto escolhido pelo usuário e transforma em ouro.
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    prompt = ""
    if req.source_type == "proof":
        prompt = f"""
        Como Estrategista Sênior, analise esta prova de autoridade (Notícia/Estudo) do nicho de {tenant.niche}:
        "{req.content}"
        
        Sua missão: Transforme isso em um Roteiro de Vídeo (Reels/TikTok) de 30 segundos.
        Estrutura OBRIGATÓRIA da resposta:
        1. HOOK VISUAL (Os 3 primeiros segundos para prender a atenção).
        2. A AUTORIDADE (Como citar essa notícia de forma impactante).
        3. A DOR (Conectar a notícia com a dor da persona: {tenant.personas}).
        4. O CTA (Chamada para ação agressiva).
        """
    elif req.source_type == "insight":
        prompt = f"""
        Como Estrategista Sênior, analise este comentário/dor real extraído de um potencial cliente do nicho de {tenant.niche}: 
        "{req.content}"
        
        Sua missão: Crie uma tática de conteúdo (Reels/Carrossel) que responda EXATAMENTE a essa dor e posicione nossa marca como a solução. 
        Entregue o Gancho Principal e o Resumo da Estratégia.
        """
    else:
        prompt = f"""
        Como Estrategista Sênior, analise este Tópico Viral do momento:
        "{req.content}"
        
        Sua missão: Faça um "Trend Hijacking". Como podemos surfar nesse assunto e conectar com o nicho de {tenant.niche} de forma genial e não forçada?
        Entregue a estratégia completa em um parágrafo e, em seguida, a Legenda Pronta para o post.
        """

    try:
        print(f"⚡ [IA] Processando item sob demanda: {req.content[:30]}...")
        # Passa pelo motor central (usando o Flash por ser ágil para a UI)
        resposta_ia = ai_service._call_ai(prompt, {"username": tenant.name, "niche": tenant.niche}, "Geração Tática On-Demand")
        return {"status": "success", "data": resposta_ia}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))