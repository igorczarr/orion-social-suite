# modules/workers/trend_scraper.py
import sys
import os
import urllib.parse
import asyncio
import aiohttp
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from dotenv import load_dotenv

# Ajuste de PATH para garantir importações corretas do banco
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import Tenant, TrendInsight, AuthorityProof

class HighPerformanceRadar:
    """
    Motor Async (GT3 RS) para coleta massiva de tendências.
    Opera com concorrência total para minimizar o tempo de I/O de rede.
    """
    def __init__(self):
        self.db = SessionLocal()
        self.google_news_base = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    async def _fetch_url(self, session: aiohttp.ClientSession, url: str) -> str:
        """Função base de I/O para buscar HTML ou RSS na velocidade da luz."""
        try:
            async with session.get(url, headers=self.headers, timeout=15) as response:
                if response.status == 200:
                    return await response.text()
                return ""
        except Exception as e:
            print(f"   [Motor] Falha de Injeção na URL {url[:30]}... Erro: {e}")
            return ""

    async def get_x_trends_async(self, session: aiohttp.ClientSession) -> list:
        """FRENTE 2: Trending Topics X/Twitter (Assíncrono)"""
        print(" 🐦 [Thread 2] Acelerando busca de Cultura Pop (X)...")
        html = await self._fetch_url(session, "https://trends24.in/brazil/")
        if not html: return []

        x_trends = []
        soup = BeautifulSoup(html, 'html.parser')
        
        for a_tag in soup.select('.trend-card__list li a')[:15]:
            trend_name = a_tag.text.strip()
            x_trends.append({
                "topic": trend_name,
                "category": "Entretenimento BR (X)",
                "heat": "Extremo",
                "url": f"https://twitter.com/search?q={urllib.parse.quote(trend_name)}"
            })
        return x_trends

    async def get_global_news_async(self, session: aiohttp.ClientSession) -> list:
        """FRENTE 1: Notícias Globais (Assíncrono)"""
        print(" 🌍 [Thread 1] Acelerando busca de Notícias Globais...")
        xml_data = await self._fetch_url(session, self.google_news_base)
        if not xml_data: return []

        news_trends = []
        # O feedparser lida com strings nativamente
        feed = feedparser.parse(xml_data)
        for entry in feed.entries[:15]:
            clean_title = entry.title.rsplit(" - ", 1)[0] if " - " in entry.title else entry.title
            source = entry.source.title if hasattr(entry, 'source') else "Google News"
            news_trends.append({
                "topic": clean_title,
                "category": f"Notícia Quente ({source})",
                "heat": "Alto",
                "url": entry.link
            })
        return news_trends

    async def get_niche_proofs_async(self, session: aiohttp.ClientSession, niche: str, keywords: str) -> list:
        """FRENTE 3: Rastreador Específico de Autoridade (Assíncrono)"""
        core_term = keywords.split(',')[0].strip() if keywords else niche
        print(f" 🔬 [Thread 3] Buscando Provas Empíricas para: {core_term}...")
        
        search_query = f'"{core_term}" AND (estudo OR pesquisa OR especialista OR descobre OR mercado)'
        encoded_query = urllib.parse.quote(search_query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=pt-BR&gl=BR&ceid=BR:pt-419"

        xml_data = await self._fetch_url(session, rss_url)
        if not xml_data: return []

        proofs = []
        feed = feedparser.parse(xml_data)
        for entry in feed.entries[:15]:
            clean_title = entry.title.rsplit(" - ", 1)[0] if " - " in entry.title else entry.title
            source_name = entry.source.title if hasattr(entry, 'source') else "Portal Especializado"
            proofs.append({
                "title": clean_title[:500],
                "source_url": entry.link,
                "source_name": source_name[:100]
            })
        return proofs

    async def _execute_parallel_harvest(self, tenants: list):
        """O Coração do Motor V8: Orquestra todas as requisições HTTP ao mesmo tempo."""
        async with aiohttp.ClientSession() as session:
            # 1. Dispara as buscas GLOBAIS simultaneamente
            global_task = asyncio.create_task(self.get_global_news_async(session))
            x_task = asyncio.create_task(self.get_x_trends_async(session))
            
            global_news, x_trends = await asyncio.gather(global_task, x_task)
            all_generic_trends = global_news + x_trends
            
            print(f" 🏁 Buscas globais concluídas em tempo recorde: {len(all_generic_trends)} itens.")

            # 2. Dispara as buscas de NICHO (Autoridade) para TODOS os clientes simultaneamente
            proof_tasks = {}
            for tenant in tenants:
                task = asyncio.create_task(self.get_niche_proofs_async(session, tenant.niche, tenant.keywords))
                proof_tasks[tenant.id] = task

            # Aguarda todos os clientes carregarem
            await asyncio.gather(*proof_tasks.values())

            # 3. Transação de Banco de Dados (Bulk Insert para não engasgar o PostgreSQL)
            print("\n💾 [DB] Iniciando gravação em lote (Bulk Insert)...")
            for tenant in tenants:
                # Limpa legado
                self.db.query(TrendInsight).filter(TrendInsight.tenant_id == tenant.id).delete()
                self.db.query(AuthorityProof).filter(AuthorityProof.tenant_id == tenant.id).delete()
                
                # Prepara Trends
                trend_objects = [
                    TrendInsight(
                        tenant_id=tenant.id, topic=t["topic"], category=t["category"],
                        heat=t["heat"], source_url=t.get("url", ""), created_at=datetime.now(timezone.utc)
                    ) for t in all_generic_trends
                ]
                
                # Recupera as provas específicas que a Task assíncrona gerou
                proofs_raw = proof_tasks[tenant.id].result()
                proof_objects = [
                    AuthorityProof(
                        tenant_id=tenant.id, title=p["title"], source_url=p["source_url"],
                        source_name=p["source_name"], created_at=datetime.now(timezone.utc)
                    ) for p in proofs_raw
                ]

                # Inserção massiva
                if trend_objects: self.db.add_all(trend_objects)
                if proof_objects: self.db.add_all(proof_objects)
                self.db.commit()
                print(f"  ✅ Cliente {tenant.name}: {len(trend_objects)} Trends e {len(proof_objects)} Provas salvas.")

    def run_harvest_cycle(self, target_tenant_id=None):
        print("\n" + "="*60)
        print("🏎️ INICIANDO MOTOR DE ALTA PERFORMANCE (ASYNC HARVESTER)")
        print("="*60 + "\n")
        
        start_time = datetime.now()
        
        query = self.db.query(Tenant)
        if target_tenant_id:
            query = query.filter(Tenant.id == target_tenant_id)
            
        tenants = query.all()
        if not tenants:
            print("⚠️ Sem alvos mapeados.")
            self.db.close()
            return

        # Roda o Loop de Eventos Assíncrono
        try:
            asyncio.run(self._execute_parallel_harvest(tenants))
        except Exception as e:
            print(f"❌ Falha Crítica no Motor Async: {e}")
        finally:
            self.db.close()
            
        end_time = datetime.now()
        print(f"\n🔒 Ciclo Finalizado. Tempo total da operação: {(end_time - start_time).seconds} segundos.")

if __name__ == "__main__":
    load_dotenv()
    
    # 🛠️ OPERAÇÃO DE BLINDAGEM: Garante que as novas tabelas sejam criadas no Neon antes de gravar
    try:
        from database.connection import init_db
        print("⚙️ Verificando e criando novas tabelas no banco de dados...")
        init_db()
    except Exception as e:
        print(f"⚠️ Erro ao inicializar banco: {e}")

    worker = HighPerformanceRadar()
    worker.run_harvest_cycle()