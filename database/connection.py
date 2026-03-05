import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Adiciona a raiz do projeto ao path para conseguir importar o models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.models import Base

# Carrega as variáveis ocultas do ficheiro .env
load_dotenv()

# Pega a chave do cofre na nuvem (Neon.tech / PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("⚠️ ALERTA: DATABASE_URL não foi encontrada. Verifique se o ficheiro .env existe na raiz do projeto!")

# Correção de segurança
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Cria o Motor de Conexão para a Nuvem
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)

# Cria a 'Fábrica de Sessões' (As conversas com o banco)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Lê o models.py e cria as tabelas físicas no PostgreSQL caso não existam."""
    print("⏳ Conectando ao PostgreSQL na nuvem e a verificar o cofre...")
    
    # Removemos o drop_all(). Agora ele APENAS cria se faltar alguma coisa.
    Base.metadata.create_all(bind=engine)
    
    print("✅ Sucesso! O Banco de Dados VRTICE está online e estruturado.")

if __name__ == "__main__":
    init_db()