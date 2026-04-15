# modules/workers/worker_churn.py
import sys
import os
from datetime import datetime, timezone
from apify_client import ApifyClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal
from database.models import Tenant, SocialInsight, TrackedProfile
from modules.core.key_manager import apify_balancer

class ChurnAuditorWorker:
    """
    ESQUADRÃO 2: O Caçador de Dores (Deep Web & Churn).
    Vareja Reddit e Reclame Aqui (via Apify Google Search) em busca de atrito.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.reddit_actor = "trudax/reddit-scraper"
        self.google_actor = "apify/google-search-scraper" # Usado para Reclame Aqui/Trustpilot

    def _get_client(self) -> ApifyClient:
        return ApifyClient(apify_balancer.get_healthy_key())

    def run_churn_audit(self, tenant_id: int):
        print(f"\n☠️ [ESQUADRÃO 2] Iniciando Auditoria de Churn para Tenant ID: {tenant_id}")
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        
        competitors = self.db.query(TrackedProfile).filter(
            TrackedProfile.tenant_id == tenant_id, TrackedProfile.is_client_account == False
        ).all()

        client = self._get_client()
        insights_capturados = []

        # 1. VARREDURA REDDIT (Dores do Nicho)
        if tenant.keywords:
            print(" 🔍 Mapeando Subreddits de Nicho...")
            keywords = [k.strip() for k in tenant.keywords.split(',')]
            for kw in keywords[:2]: # Limite tático
                try:
                    run = client.actor(self.reddit_actor).call(run_input={
                        "searchQueries": [kw],
                        "maxItems": 20,
                        "sort": "hot"
                    })
                    reddit_data = client.dataset(run["defaultDatasetId"]).list_items().items
                    
                    for post in reddit_data:
                        text = post.get("title", "") + " " + post.get("text", "")
                        if len(text) > 30:
                            insights_capturados.append({
                                "platform": "Reddit",
                                "quote": text[:1000],
                                "category": "Dor Latente / JTBD"
                            })
                except Exception as e:
                    print(f" ⚠️ Erro no Reddit Scraper: {e}")

        # 2. VARREDURA RECLAME AQUI (Dores do Concorrente)
        for comp in competitors:
            print(f" 🔍 Buscando reclamações ativas de {comp.username}...")
            query = f'"{comp.username}" site:reclameaqui.com.br'
            
            try:
                run = client.actor(self.google_actor).call(run_input={
                    "queries": query,
                    "resultsPerPage": 10,
                    "countryCode": "br"
                })
                google_data = client.dataset(run["defaultDatasetId"]).list_items().items
                
                for res in google_data:
                    for organic in res.get("organicResults", []):
                        snippet = organic.get("description", "")
                        if snippet:
                            insights_capturados.append({
                                "platform": "Reclame Aqui",
                                "quote": snippet,
                                "category": "Fricção / Churn Audit"
                            })
            except Exception as e:
                print(f" ⚠️ Erro no Google/ReclameAqui Scraper: {e}")

        # Gravação Massiva no Banco
        if insights_capturados:
            self.db.query(SocialInsight).filter(
                SocialInsight.tenant_id == tenant_id,
                SocialInsight.category.in_(["Fricção / Churn Audit", "Dor Latente / JTBD"])
            ).delete()

            batch = [
                SocialInsight(
                    tenant_id=tenant_id,
                    platform=i["platform"],
                    quote=i["quote"],
                    category=i["category"],
                    intensity="Alta",
                    created_at=datetime.now(timezone.utc)
                ) for i in insights_capturados
            ]
            self.db.add_all(batch)
            self.db.commit()
            print(f"  💾 {len(batch)} Insights de Churn e Dores registrados no Córtex.")

        self.db.close()