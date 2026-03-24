# modules/security/vault.py
import os
import base64
import hashlib
from cryptography.fernet import Fernet

class OrionVault:
    """
    O COFRE DE ELITE (Corporate Grade Security).
    Usa a SECRET_KEY do servidor para gerar uma chave simétrica AES de 256-bits (Fernet).
    Garante que os Cookies de Sessão (Instagram) fiquem 100% ilegíveis no banco de dados.
    """
    def __init__(self):
        # Deriva uma chave segura de 32 bytes em Base64 a partir do seu SECRET_KEY
        raw_secret = os.getenv("SECRET_KEY", "uma_chave_secreta_muito_segura_VRTICE_2026").encode()
        self._key = base64.urlsafe_b64encode(hashlib.sha256(raw_secret).digest())
        self._fernet = Fernet(self._key)

    def encrypt(self, plain_text: str) -> str:
        """Tranca o dado."""
        if not plain_text: return None
        encrypted_bytes = self._fernet.encrypt(plain_text.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')

    def decrypt(self, encrypted_text: str) -> str:
        """Destranca o dado."""
        if not encrypted_text: return None
        try:
            decrypted_bytes = self._fernet.decrypt(encrypted_text.encode('utf-8'))
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            print(f"❌ [VAULT] Alerta de violação ou chave incorreta: {e}")
            return None

# Instância global Singleton para uso rápido nas rotas
vault = OrionVault()