# patch_db.py
from database.connection import engine
from sqlalchemy import text

def apply_database_patch():
    """
    Força a adição das novas colunas na tabela 'tenants' sem destruir os dados existentes.
    """
    print("🚀 Iniciando Patch de Banco de Dados Orion...")
    
    with engine.connect() as conn:
        try:
            # Injeta a coluna keywords (Fase 4)
            conn.execute(text("ALTER TABLE tenants ADD COLUMN keywords VARCHAR;"))
            print("✅ Coluna 'keywords' injetada com sucesso.")
        except Exception as e:
            print(f"⚠️ Aviso (A coluna 'keywords' pode já existir): {e}")

        try:
            # Injeta a coluna do cofre de senhas do Vortex (Fase 5)
            conn.execute(text("ALTER TABLE tenants ADD COLUMN encrypted_ig_session TEXT;"))
            print("✅ Coluna 'encrypted_ig_session' injetada com sucesso.")
        except Exception as e:
            print(f"⚠️ Aviso (A coluna 'encrypted_ig_session' pode já existir): {e}")
        
        conn.commit()

if __name__ == "__main__":
    apply_database_patch()
    print("🎉 Patch concluído! O Banco de Dados está agora na versão Elite.")