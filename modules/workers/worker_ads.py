# modules/workers/worker_ads.py
import sys
import os
from datetime import datetime, timezone
from apify_client import ApifyClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.connection import SessionLocal
from database.models import CompetitorAd, TrackedProfile, Tenant
from modules.core.key_manager import apify_balancer

class AdsIntelligenceWorker:
    """
    ESQUADRÃO 1: O Cão de Caça Financeiro.
    Raspa a Meta Ads Library para encontrar Dark Posts e Profit Pools.
    """
    def __init__(self):
        self.db = SessionLocal()
        # O ator oficial e mais robusto da Apify para Meta Ads
        self.meta_ads_actor = "apify/facebook-ads-scraper"

    def _get_client(self) -> ApifyClient:
        key = apify_balancer.get_healthy_key()
        if not key:
            raise Exception("🛑 Falha Crítica: Nenhuma chave Apify disponível.")
        return ApifyClient(key)

    def run_meta_ads_scan(self, tenant_id: int):
        print(f"\n💸 [ESQUADRÃO 1] Rastreando Fluxo de Capital (Meta Ads) para Tenant ID: {tenant_id}")
        
        competitors = self.db.query(TrackedProfile).filter(
            TrackedProfile.tenant_id == tenant_id,
            TrackedProfile.is_client_account == False
        ).all()

        if not competitors:
            print(" ⚠️ Nenhum concorrente mapeado para este cliente.")
            self.db.close()
            return

        client = self._get_client()

        for comp in competitors:
            print(f" 🔍 Infiltrando Meta Ads Library de: {comp.username}...")
            
            run_input = {
                "pageName": comp.username,
                "resultsLimit": 50,
                "proxyConfiguration": {"useApifyProxy": True} # Apify gere a camuflagem
            }

            try:
                run = client.actor(self.meta_ads_actor).call(run_input=run_input)
                ads_data = client.dataset(run["defaultDatasetId"]).list_items().items
                
                self._process_ads(comp.id, ads_data)
                
            except Exception as e:
                if "429" in str(e):
                    apify_balancer.burn_key(client.token)
                    print(f" ⚠️ Rate Limit atingido. Chave queimada. O Celery tentará novamente no próximo ciclo.")
                else:
                    print(f" ❌ Erro ao extrair anúncios de {comp.username}: {e}")

        self.db.close()
        print("✅ [ESQUADRÃO 1] Operação Follow the Money Concluída.")

    def _process_ads(self, profile_id: int, ads_data: list):
        """Filtra apenas os anúncios provados pelo mercado (> 30 dias)."""
        ads_salvos = 0
        now = datetime.now(timezone.utc)
        
        # Limpa o histórico velho deste perfil para manter a DB leve
        self.db.query(CompetitorAd).filter(CompetitorAd.tracked_profile_id == profile_id).delete()

        for ad in ads_data:
            start_date_str = ad.get("startDate")
            if not start_date_str: continue

            try:
                start_date = datetime.strptime(start_date_str[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                days_active = (now - start_date).days
                
                # A LEI DE EFICIÊNCIA DO TRÁFEGO: Só nos importa o que dá lucro.
                if days_active < 3: 
                    continue # Ignora lixo em fase de teste
                    
                status = "Vencedor" if days_active > 30 else "Escalando"
                
                novo_ad = CompetitorAd(
                    tracked_profile_id=profile_id,
                    format=ad.get("mediaType", "Desconhecido"),
                    hook_text=ad.get("primaryText", "")[:500], # Os 500 primeiros caracteres são o Gancho
                    days_active=days_active,
                    status=status,
                    last_seen_at=now
                )
                self.db.add(novo_ad)
                ads_salvos += 1
                
            except Exception as e:
                continue

        self.db.commit()
        print(f"  💾 {ads_salvos} Dark Posts lucrativos extraídos e gravados.")