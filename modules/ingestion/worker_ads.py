# modules/ingestion/worker_ads.py
import sys
import os
import time
import re
import json
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError
from apify_client import ApifyClient

# Ajuste de PATH para importações a partir da raiz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, TrackedProfile, CompetitorAd, SwipeFile
from config.settings import settings
from modules.core.key_manager import apify_balancer

class CapitalAlchemistWorker:
    """
    ESQUADRÃO FOLLOW THE MONEY (O Alquimista).
    Espionagem de Tráfego Pago, Filtragem de Profit Pools (>30 dias) e Arbitragem Global.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.ads_actor = settings.ApifyActors.META_ADS 

        # Mapa de Arbitragem Global (Os mercados onde a liquidez é maior)
        self.markets = ["BR", "US", "GB"]

    def _get_client(self) -> ApifyClient:
        key = apify_balancer.get_healthy_key()
        if not key:
            raise Exception("🛑 [CRÍTICO] Cofre Vazio: Nenhuma chave Apify disponível para a Infiltração na Meta.")
        return ApifyClient(key)

    def clean_ad_copy(self, raw_text: str) -> str:
        """
        [SÊNIOR] Purificação da Copy.
        Remove UTMs de rastreamento, links poluídos e HTML injetado, 
        deixando apenas a psicologia de vendas pura para a nossa IA ler.
        """
        if not raw_text: return ""
        # Remove URLs (especialmente com fbclid e utm_source)
        clean_text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', raw_text)
        # Limpa quebras de linha duplas excessivas
        clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
        return clean_text.strip()

    def extract_hook(self, copy: str) -> str:
        """Extrai as primeiras 3 linhas do anúncio (O Hook que compra a atenção)."""
        lines = [line for line in copy.split('\n') if line.strip()]
        return " \n".join(lines[:3]) if lines else "Sem Hook Detectável"

    def run_financial_recon(self, tenant_id: int):
        print(f"\n💸 [O ALQUIMISTA] Iniciando Auditoria de Tráfego Pago para Tenant: {tenant_id}")
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            print(" ⚠️ Operação abortada: Cliente não encontrado.")
            self.db.close()
            return

        keywords = [k.strip() for k in (tenant.keywords or "").split(',') if k.strip()]
        
        # 1. Alvos Locais (Concorrentes Diretos do Cliente)
        tracked_profiles = self.db.query(TrackedProfile).filter(
            TrackedProfile.tenant_id == tenant_id, 
            TrackedProfile.is_active == True,
            TrackedProfile.is_client_account == False
        ).all()
        
        target_pages = [p.username for p in tracked_profiles if p.username]

        if not target_pages and not keywords:
            print(" ⚠️ Sem Alvos (Páginas ou Keywords) configurados. Abortando.")
            self.db.close()
            return

        client = self._get_client()

        # FASE 1: Montagem do Payload de Extração (Local + Global)
        # O apify/facebook-ads-scraper permite procurar por nomes de páginas OU termos de busca.
        search_terms = target_pages + [keywords[0]] if keywords else target_pages

        for market in self.markets:
            print(f"\n 🌍 [MERCADO: {market}] Analisando Liquidez e Anúncios Ativos...")
            
            run_input = {
                "searchTerms": search_terms,
                "country": market,
                "activeStatus": "active",
                "resultsLimit": 50 # Limite tático para não torrar créditos com lixo
            }

            try:
                print(" ⏳ Invadindo Meta Ads Library... Triangulando Profit Pools.")
                run = client.actor(self.ads_actor).call(run_input=run_input)
                dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items
                
                print(f" ✅ Matriz Quebrada! Analisando {len(dataset_items)} anúncios injetados no mercado {market}.")
                self._process_and_filter_ads(dataset_items, tenant_id, market)
                
            except Exception as e:
                if "429" in str(e) or "Timeout" in str(e):
                    apify_balancer.burn_key(client.token)
                    print(f" 🔥 [EVASÃO] Sistema de Defesa da Meta ativado no mercado {market}. Chave queimada.")
                else:
                    print(f" ❌ Erro Crítico na Extração de Anúncios: {e}")
            
            # Evasão: Pausa tática entre mercados para não disparar firewalls da Apify
            time.sleep(3)

        self.db.close()
        print(f"\n🏁 [O ALQUIMISTA] Extração Financeira Finalizada.")

    def _process_and_filter_ads(self, items: list, tenant_id: int, market: str):
        """
        [O CÓRTEX FINANCEIRO]
        Aplica a Matemática de Kahneman: Calcula os dias ativos e separa o Lixo do Ouro.
        """
        now = datetime.now(timezone.utc)
        ads_salvos = 0
        swipe_files_gerados = 0

        for ad in items:
            start_date_str = ad.get('startDate')
            if not start_date_str: continue

            # Normalização de Data do Meta Ads
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except ValueError:
                continue

            # A MÉTRICA DE OURO: Há quantos dias este anúncio queima dinheiro (ou gera lucro)?
            days_active = (now - start_date).days
            
            # [FILTRO SÊNIOR] Se tem menos de 7 dias, é teste. Lixo. Ignora.
            if days_active < 7:
                continue

            page_name = ad.get('pageName', 'Desconhecido')
            raw_copy = ad.get('primaryText', '')
            clean_copy = self.clean_ad_copy(raw_copy)
            hook = self.extract_hook(clean_copy)
            
            # Determina o Status Preditivo
            if days_active > 30:
                status = "Vencedor (Profit Pool)"
            elif days_active >= 15:
                status = "Escalando"
            else:
                status = "Validado"

            # Tenta vincular o anúncio a um Perfil Rastreado existente
            tracked_profile = self.db.query(TrackedProfile).filter(
                TrackedProfile.tenant_id == tenant_id,
                TrackedProfile.username.ilike(f"%{page_name}%")
            ).first()

            profile_id = tracked_profile.id if tracked_profile else None

            # --- 1. SALVAR NO RADAR LOCAL (Se o perfil estiver na nossa base) ---
            if profile_id:
                # Idempotência: Verifica se o anúncio já existe pelo texto exato
                existente = self.db.query(CompetitorAd).filter(
                    CompetitorAd.tracked_profile_id == profile_id,
                    CompetitorAd.hook_text == hook
                ).first()

                if existente:
                    # Se já existe, apenas atualiza a contagem de dias (o inimigo continua gastando)
                    existente.days_active = days_active
                    existente.status = status
                    existente.last_seen_at = now
                else:
                    novo_ad = CompetitorAd(
                        tracked_profile_id=profile_id,
                        format=ad.get('mediaType', 'Desconhecido'),
                        hook_text=hook,
                        days_active=days_active,
                        status=status,
                        last_seen_at=now
                    )
                    self.db.add(novo_ad)
                ads_salvos += 1

            # --- 2. A ARBITRAGEM GLOBAL (SWIPE FILE INJECTION) ---
            # Se o anúncio está no ar há mais de 30 dias (PROFIT POOL), ele é Ouro puro.
            # Vamos injetá-lo na Biblioteca de Ouro do cliente (Swipe File) mesmo que não seja um concorrente direto rastreado.
            if days_active > 30:
                # Evita duplicatas no Swipe File
                swipe_existente = self.db.query(SwipeFile).filter(
                    SwipeFile.tenant_id == tenant_id,
                    SwipeFile.category == 'Ad Creative',
                    SwipeFile.content.ilike(f"%{hook[:50]}%") # Busca parcial rápida
                ).first()

                if not swipe_existente:
                    ad_intel = {
                        "market": market,
                        "page_name": page_name,
                        "days_active": days_active,
                        "format": ad.get('mediaType', 'Desconhecido')
                    }
                    
                    novo_swipe = SwipeFile(
                        tenant_id=tenant_id,
                        category='Ad Creative',
                        content=f"HOOK:\n{hook}\n\nCOPY COMPLETA:\n{clean_copy}",
                        source_url=ad.get('adArchiveUrl', ''),
                        performance_score=days_active, # O Score é literalmente o número de dias no ar
                        ai_breakdown=ad_intel
                    )
                    self.db.add(novo_swipe)
                    swipe_files_gerados += 1

        try:
            self.db.commit()
            print(f"    🎯 Anúncios Válidos Encontrados: {ads_salvos}")
            print(f"    🏆 Novos 'Profit Pools' adicionados ao Swipe File: {swipe_files_gerados}")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"    ❌ [CRÍTICO] Falha ao injetar inteligência no Banco: {e}")

# =====================================================================
# BLOCO DE TESTE ISOLADO
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = CapitalAlchemistWorker()
    worker.run_financial_recon(tenant_id=1)