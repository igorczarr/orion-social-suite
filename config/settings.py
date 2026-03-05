import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Configurações do Projeto
PROJECT_NAME = "Orion Social Suite"
VERSION = "1.0.0"

# Configurações de Dados
# Por enquanto usaremos SQLite (um arquivo local)
DB_NAME = "orion_data.db"
DATABASE_URL = f"sqlite:///{DB_NAME}"

# Diretórios Importantes
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Cria a pasta de dados se ela não existir
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

print(f"[{PROJECT_NAME}] Configurações carregadas com sucesso.")