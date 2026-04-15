# modules/core/key_manager.py
import os
import time
import threading
from typing import Optional

class ApifyLoadBalancer:
    """
    O COFRE ROTATIVO DE MUNIÇÃO (Round-Robin Key Pool).
    Garante que o Orion nunca trave por 'Rate Limit' do Apify.
    Thread-safe para operar com Celery e FastAPI simultaneamente.
    """
    def __init__(self):
        self.keys = []
        self.cooldowns = {}
        self.cooldown_time = 3600  # 1 hora de castigo para chaves exaustas
        self._lock = threading.Lock() # Blindagem contra concorrência (Race Conditions)
        self._load_keys()

    def _load_keys(self):
        """
        [SÊNIOR] Varre todas as variáveis de ambiente em busca de chaves Apify,
        independentemente da nomenclatura (APIFY_TOKEN, APIFY_TOKEN_2, etc).
        """
        for key, value in os.environ.items():
            if key.startswith("APIFY_TOKEN") and value:
                clean_value = value.strip()
                # Evita carregar variáveis vazias ou preenchidas apenas com "."
                if clean_value and clean_value != ".":
                    if clean_value not in self.keys:
                        self.keys.append(clean_value)
                
        if not self.keys:
            print("❌ [CRÍTICO] Nenhuma chave válida do Apify configurada no .env!")
        else:
            print(f"🛡️ [MUNIÇÃO] Load Balancer Armado com {len(self.keys)} chave(s) Apify.")

    def get_healthy_key(self) -> Optional[str]:
        """Devolve a próxima chave saudável no esquema Round-Robin."""
        with self._lock:
            if not self.keys: 
                return None
            
            current_time = time.time()
            
            # Varre a lista de chaves (O(N) rápido)
            for _ in range(len(self.keys)):
                # Round-Robin: tira do início, põe no fim
                candidate_key = self.keys.pop(0)
                self.keys.append(candidate_key)
                
                if candidate_key in self.cooldowns:
                    if current_time > self.cooldowns[candidate_key]:
                        # O tempo de castigo acabou, a chave está curada
                        del self.cooldowns[candidate_key]
                        return candidate_key
                else:
                    return candidate_key
                    
            print("🚨 [CRÍTICO] TODAS as chaves Apify estão em Cooldown. O Motor de Extração aguarda...")
            return None

    def burn_key(self, key: str):
        """O Worker avisa o cofre que esta chave estourou o limite (Erro 429)."""
        with self._lock:
            if key in self.keys:
                self.cooldowns[key] = time.time() + self.cooldown_time
                print(f"🔥 [LOAD BALANCER] Chave Apify ejetada (Rate Limit). Cooldown de {self.cooldown_time}s ativado.")

# Instância Global Singleton (Para importar nos Workers)
apify_balancer = ApifyLoadBalancer()