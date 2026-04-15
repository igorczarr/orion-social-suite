# modules/generation/copy_chief/memory_cortex.py
import sys
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from database.models import CopyGenerationLog

class MemoryCortex:
    """
    O LÓBULO DE MEMÓRIA DE CIRCUITO FECHADO (The Autonomous Historian).
    Integra a Telemetria da Apify (Mundo Real) com o Histórico de Geração (IA).
    A IA sabe matematicamente o que fatura e o que falha.
    """
    def __init__(self, db_session: Session):
        self.db = db_session

    def _calculate_autonomous_truth(self, log: CopyGenerationLog) -> int:
        """
        O Juiz de Ferro.
        Se o cliente deu nota 100, mas o anúncio (Apify) caiu em 2 dias, o cliente está errado.
        A máquina calcula o peso real da performance.
        """
        final_score = 0
        
        # Se temos dados reais da Apify, eles dominam a nota (70% de peso)
        if log.autonomous_score is not None:
            final_score += log.autonomous_score * 0.7
            if log.client_score:
                final_score += log.client_score * 0.3
            else:
                final_score = log.autonomous_score
        # Se ainda não temos a telemetria, confiamos no cliente provisoriamente
        elif log.client_score is not None:
            final_score = log.client_score
            
        return int(final_score)

    def get_historical_context(self, tenant_id: int, asset_type: str) -> str:
        """
        Lê as campanhas passadas. Puxa APENAS o que foi validado pela Telemetria
        ou por Feedback explícito do cliente.
        """
        print(f" 🧠 [MEMORY CORTEX] Acessando Telemetria Histórica para: {asset_type.upper()}")
        
        # Puxa o histórico bruto do cliente
        history = self.db.query(CopyGenerationLog).filter(
            CopyGenerationLog.tenant_id == tenant_id,
            CopyGenerationLog.asset_type == asset_type
        ).order_by(CopyGenerationLog.created_at.desc()).limit(20).all()

        if not history:
            return "ALERTA TÁTICO: Tela em branco. Nenhuma campanha anterior registrada para este ativo."

        successes = []
        failures = []

        # Processamento Matemático do Histórico
        for log in history:
            truth_score = self._calculate_autonomous_truth(log)
            
            # Filtro de Ouro (Score > 80 é máquina de fazer dinheiro)
            if truth_score >= 80:
                successes.append((truth_score, log))
            # Filtro de Lixo (Score < 40 ou cliente relatou falha grave)
            elif truth_score > 0 and truth_score < 40:
                failures.append((truth_score, log))

        # Ordena para pegar os absolutos melhores e piores
        successes.sort(key=lambda x: x[0], reverse=True)
        failures.sort(key=lambda x: x[0]) # Os de menor nota primeiro

        memory_string = "### TELEMETRIA DE SUCESSO (O QUE A MATEMÁTICA PROVOU QUE FUNCIONA) ###\n"
        
        if successes:
            memory_string += "\n[PADRÕES DE ALTA CONVERSÃO - REPLICAR ESTRUTURA]:\n"
            for score, log in successes[:2]: # Top 2
                fonte = "Validado via Apify" if log.autonomous_score else "Validado pelo Cliente"
                memory_string += f"- Score de Validação: {score}/100 ({fonte})\n"
                memory_string += f"- Raciocínio Usado pela IA: {log.ai_reasoning}\n"
                memory_string += f"- A Copy que Venceu (Extrair a essência, não copiar palavra por palavra): {log.generated_copy[:500]}...\n"
                
        if failures:
            memory_string += "\n[FALHAS CRÍTICAS - ESTRITAMENTE PROIBIDO REPETIR]:\n"
            for score, log in failures[:2]: # Bottom 2
                memory_string += f"- Raciocínio que Falhou: {log.ai_reasoning}\n"
                if log.client_feedback:
                    memory_string += f"- Feedback/Motivo da Falha: {log.client_feedback}\n"
                if log.apify_days_active > 0:
                    memory_string += f"- Morte Rápida: Este anúncio sobreviveu apenas {log.apify_days_active} dias antes de o cliente o desligar por falta de ROI.\n"

        return memory_string

    def log_generation(self, tenant_id: int, asset_type: str, briefing: str, generated_copy: str, ai_reasoning: str) -> int:
        """Guarda a nova peça gerada. Inicia a vigilância."""
        try:
            new_log = CopyGenerationLog(
                tenant_id=tenant_id,
                asset_type=asset_type,
                briefing=briefing,
                generated_copy=generated_copy,
                ai_reasoning=ai_reasoning
            )
            self.db.add(new_log)
            self.db.commit()
            self.db.refresh(new_log)
            print(f"    📡 Peça registrada no diário. ID de Vigilância: {new_log.id}")
            return new_log.id
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f" ❌ [ERRO DE MEMÓRIA] Falha ao registrar log: {e}")
            return 0

    def attach_telemetry_tracker(self, log_id: int, external_url: str) -> bool:
        """
        O 'Grampo'. O Frontend chama isto quando o cliente publica a copy gerada.
        Isto vincula o texto da IA a uma URL real no Instagram, YouTube ou Meta Ads.
        """
        try:
            log = self.db.query(CopyGenerationLog).filter(CopyGenerationLog.id == log_id).first()
            if log:
                log.external_tracking_url = external_url
                self.db.commit()
                print(f"    🔗 Telemetria ativada. Orion agora monitoriza: {external_url}")
                return True
            return False
        except SQLAlchemyError:
            self.db.rollback()
            return False

    def sync_apify_metrics(self, log_id: int, days_active: int = 0, engagement: int = 0):
        """
        O Motor de Realidade. Os workers da Fase 1 chamam isto de madrugada.
        Atualiza o 'autonomous_score' baseado em matemática pura.
        """
        try:
            log = self.db.query(CopyGenerationLog).filter(CopyGenerationLog.id == log_id).first()
            if not log: return False
            
            log.apify_days_active = max(log.apify_days_active or 0, days_active)
            log.apify_engagement = engagement
            log.last_telemetry_sync = datetime.now(timezone.utc)
            
            # Lógica de Pontuação Absoluta (Ajustável consoante a estratégia)
            # Exemplo Ads: Se sobreviveu mais de 30 dias no ar, é um vencedor (100).
            # Se sobreviveu 7 dias, é medíocre (30).
            if log.asset_type == 'meta_ad':
                if log.apify_days_active >= 30:
                    log.autonomous_score = 100
                elif log.apify_days_active >= 14:
                    log.autonomous_score = 75
                elif log.apify_days_active <= 5 and log.apify_days_active > 0:
                    log.autonomous_score = 20 # Desligado rapidamente = Torrou dinheiro sem conversão
            
            # Exemplo Posts: Engajamento relativo pode ditar o score.
            elif log.asset_type == 'hook' or 'post' in log.asset_type:
                # Simplificação: Mais de 1000 de engajamento é excelente.
                if engagement > 1000:
                    log.autonomous_score = 90
                elif engagement < 50:
                    log.autonomous_score = 30
                    
            self.db.commit()
            print(f"    📊 Telemetria Sincronizada para o Log {log_id}. Autonomous Score: {log.autonomous_score}")
            return True
        except SQLAlchemyError:
            self.db.rollback()
            return False