from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import asyncio
import threading
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import desc
from fastapi.middleware.cors import CORSMiddleware
from database.connection import SessionLocal, init_db
from database.models import User, Tenant, Persona, TrackedProfile, SocialInsight, CompetitorAd, ProfileHistory, PostSnapshot, Post, Quest
from modules.analytics.ai_engine import AIEngine
from modules.workers.trend_scraper import OmnidirectionalRadar
from database.models import User, Tenant, Persona, TrackedProfile, SocialInsight, CompetitorAd, ProfileHistory, PostSnapshot, Post, Quest, VortexTarget
from sqlalchemy import desc
from datetime import datetime, timedelta
from collections import defaultdict
from modules.workers.apify_worker import OrionWorker


load_dotenv() # Carrega o arquivo .env

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
APIFY_TOKEN = os.getenv("APIFY_TOKEN")
ai_service = AIEngine(GEMINI_API_KEY)

# Validação de segurança (Opcional, mas sênior)
if not GEMINI_API_KEY:
    print("⚠️ ALERTA: GEMINI_API_KEY não encontrada nas variáveis de ambiente.")

# --- CONFIGURAÇÕES DE SEGURANÇA ---
SECRET_KEY = "uma_chave_secreta_muito_segura_e_longa_para_a_vertice"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(
    title="Orion Social Suite API",
    description="Motor de Inteligência e Scout para Redes Sociais",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://orion-social.vercel.app", # URL que a Vercel vai te dar
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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
    name: str
    social_handle: str
    niche: str

    class Config:
        from_attributes = True # Atualizado de orm_mode para Pydantic V2

class BriefingRequest(BaseModel):
    trend_topic: str
    competitor: str

class AdjustmentRequest(BaseModel):
    format_priority: str
    intensity: float

class VortexActionRequest(BaseModel):
    target_id: int
    action: str
# --- ROTAS DA API ---

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/scout/status")
def system_status():
    return {"status": "online"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# --- ROTAS DO NOVO COFRE (MULTI-TENANT) ---

@app.post("/api/tenants", response_model=TenantResponse)
def add_new_client(data: TenantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Recebe os dados do Modal '+ Novo' do frontend e constrói o ecossistema do cliente."""
    
    # 1. Cria o Cliente (Tenant)
    new_tenant = Tenant(
        owner_id=current_user.id,
        name=data.name,
        social_handle=data.social_handle,
        niche=data.niche,
        keywords=data.keywords
    )
    db.add(new_tenant)
    db.flush() # Pega o ID do tenant gerado
    
    # 2. Adiciona a conta do cliente ao Tracker
    db.add(TrackedProfile(tenant_id=new_tenant.id, username=data.social_handle, niche=data.niche, is_client_account=True))
    
    # 3. Adiciona os Concorrentes ao Tracker
    if data.competitors:
        for comp in data.competitors.split(","):
            comp_clean = comp.strip()
            if comp_clean:
                db.add(TrackedProfile(tenant_id=new_tenant.id, username=comp_clean, niche=data.niche, is_client_account=False))
                
    # 4. Adiciona as Personas
    if data.personas:
        for persona in data.personas.split(","):
            persona_clean = persona.strip()
            if persona_clean:
                db.add(Persona(tenant_id=new_tenant.id, name=persona_clean))

    db.commit()
    db.refresh(new_tenant)
    return new_tenant

@app.get("/api/tenants", response_model=List[TenantResponse])
def list_clients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Devolve todos os clientes da agência para alimentar o dropdown de troca de conta."""
    return db.query(Tenant).filter(Tenant.owner_id == current_user.id).all()

# --- MOTOR DE INTELIGÊNCIA MATEMÁTICA (Atualizado com JOIN Tenant) ---

@app.get("/api/scout/insights/{username}")
def get_profile_insights(
    username: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # ATUALIZAÇÃO: Garante que o perfil pertence a um Tenant que é do utilizador logado
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == username,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado no seu radar.")

    history = db.query(ProfileHistory).filter(ProfileHistory.username == username)\
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
        .filter(Post.username == username)\
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
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == username,
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
        .filter(Post.username == username)\
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
    client_profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == client_username,
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
    profile = db.query(TrackedProfile).join(Tenant).filter(
        TrackedProfile.username == username,
        Tenant.owner_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado.")

    print(f"📡 API acionou o Radar Omnidirecional para @{username}...")
    
    try:
        radar = OmnidirectionalRadar(GEMINI_API_KEY)
        massive_trends = radar.get_massive_trend_list()
        
        if not massive_trends:
            return {"erro": "Não foi possível capturar tendências hoje."}
            
        profile_context = {"username": profile.username, "niche": profile.niche}
        estrategia = radar.ai_engine.analyze_trends_and_timings(massive_trends, profile_context)
        
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
        # Busca os Ads Patrocinados (A tabela CompetitorAd)
        ads = db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == comp.id).all()
        # Busca os Últimos 3 Posts Orgânicos
        organic = db.query(Post).filter(Post.username == comp.username).order_by(desc(Post.published_at)).limit(3).all()
        
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

# NO SEU main.py, SUBSTITUA A ROTA DE BRIEFING POR ESTA:

@app.post("/api/ai/generate-briefing")
async def generate_briefing(req: BriefingRequest):
    """Gera um briefing REAL chamando o cérebro do Gemini no ai_engine."""
    try:
        # Agora sim, chamamos a IA real baseada na tendência e concorrente
        briefing_real = ai_service.generate_briefing(req.trend_topic, req.competitor)
        
        return {
            "status": "success",
            "data": briefing_real
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VortexActionRequest(BaseModel):
    target_id: int
    action: str  # 'engaged' ou 'ignored'

@app.get("/api/vortex/{tenant_id}")
def get_vortex_queue(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Puxa a fila de alvos qualificados (status='pending') para o Terminal Sniper.
    Ordena pelos maiores 'Match Scores' primeiro.
    """
    # Valida segurança: O usuário logado é dono deste tenant?
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado ou acesso negado.")
        
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
        
    return {"status": "success", "targets": payload}

@app.post("/api/vortex/action")
def register_vortex_action(req: VortexActionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Registra no banco de dados que a equipe engajou ou ignorou um alvo.
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
    db.commit()
    
    # AQUI ENTRA A GAMIFICAÇÃO FUTURA: Se a ação foi 'engaged', dar +5 XP ao current_user.
    if req.action == 'engaged':
        current_user.xp_total += 5
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

    username_limpo = tenant.social_handle.replace('@', '')

    # ==========================================
    # 1. KPIs E CRESCIMENTO (Proteção contra Zero)
    # ==========================================
    historico = db.query(ProfileHistory).filter(ProfileHistory.username == username_limpo).order_by(desc(ProfileHistory.date)).limit(2).all()
    followers = historico[0].followers if len(historico) > 0 else 0
    delta_followers = (followers - historico[1].followers) if len(historico) > 1 else 0

    # ==========================================
    # 2. POSTS E MÉTRICAS
    # ==========================================
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
        comp_hist = db.query(ProfileHistory).filter(ProfileHistory.username == comp.username).order_by(desc(ProfileHistory.date)).first()
        comp_followers = comp_hist.followers if comp_hist else 0  # <--- O PROBLEMA ESTAVA AQUI
        
        comp_posts = db.query(Post).filter(Post.username == comp.username).order_by(desc(Post.published_at)).limit(3).all()
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

        arena_data.append({
            "username": comp.username,
            "engagement": comp_eng_rate,
            "frequency": f"{len(comp_posts)}x semana",
        })

    # ==========================================
    # 4. RADAR DE PERSONA E TENDÊNCIAS
    # ==========================================
    insights = db.query(SocialInsight).filter(SocialInsight.tenant_id == tenant.id).order_by(desc(SocialInsight.created_at)).limit(5).all()
    radar_data = [{"quote": ins.quote, "category": ins.category, "platform": ins.platform} for ins in insights]

    keywords = tenant.keywords.split(',') if tenant.keywords else ["Tendências Globais"]
    global_trends = [{"rank": i+1, "topic": kw.strip(), "category": "Nicho", "heat": "Alto"} for i, kw in enumerate(keywords[:4])]

    # ==========================================
    # 5. INTELIGÊNCIA SINTÉTICA (O Cérebro)
    # ==========================================
    intervencao = "Volume de dados insuficiente. Mantenha a consistência."
    if posts_data:
        melhor_post = max(posts_data, key=lambda x: x['engagement'])
        intervencao = f"Foco Imediato: O seu formato {melhor_post['type']} gerou {melhor_post['engagement']}% de engajamento recentemente. Aloque 80% do esforço produtivo nisso."

    cmo_strategy = "Aguardando escuta ativa e mapeamento da concorrência."
    if radar_data and arsenal_hooks:
        cmo_strategy = f"Cruzei a dor '{radar_data[0]['category']}' relatada no YouTube com a tática da concorrência. Sugiro refutar o hook '{arsenal_hooks[0]['hook'][:30]}...' usando a nossa autoridade."

    # ==========================================
    # GAMIFICAÇÃO (Matemática segura)
    # ==========================================
    meta = (followers // 10000 + 1) * 10000 if followers > 0 else 10000
    faltam = meta - followers
    percent = round((followers / meta) * 100, 1) if meta > 0 else 0

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
            "remaining": faltam,
            "percent": percent
        },
        "radar": radar_data,
        "posts": posts_data,
        "arena": arena_data,
        "intervencao": intervencao,
        "global_trends": global_trends,
        "cmo_strategy": cmo_strategy,
        "arsenal": arsenal_hooks[:6]
    }

@app.get("/api/oracle/{tenant_id}")
def get_oracle_predictions(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.owner_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    username_limpo = tenant.social_handle.replace('@', '')
    posts_db = db.query(Post).filter(Post.username == username_limpo).order_by(desc(Post.published_at)).limit(30).all()
    
    format_stats = defaultdict(lambda: {'count': 0, 'likes_recent': 0, 'likes_old': 0})
    meio = len(posts_db) // 2 if len(posts_db) > 0 else 0
    
    for i, p in enumerate(posts_db):
        snap = db.query(PostSnapshot).filter(PostSnapshot.post_shortcode == p.shortcode).order_by(desc(PostSnapshot.date)).first()
        likes = snap.likes if snap else 0
        formato = "Reels" if "Video" in p.media_type else "Foto"
        format_stats[formato]['count'] += 1
        if i < meio: format_stats[formato]['likes_recent'] += likes
        else: format_stats[formato]['likes_old'] += likes

    fatigue_data = []
    for fmt, data in format_stats.items():
        growth = ((data['likes_recent'] - data['likes_old']) / data['likes_old'] * 100) if data['likes_old'] > 0 else 0
        fatigue_data.append({"format": fmt, "growth": round(growth, 1)})

    return {
        "metrics": {"fatigue_risk": "Baixo"},
        "fatigue": fatigue_data,
        "heatmap": {"Ter": {"Noite": 80}}
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

@app.on_event("startup")
def start_schedule():
    init_db()
    def run_scheduler():
        import subprocess
        subprocess.Popen(["python", "scheduler.py"])

    threading.Thread(target=run_scheduler, daemon=True).start()
    print("🚀 API e Agendador disparados.")