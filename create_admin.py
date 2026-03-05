import bcrypt
from database.connection import SessionLocal
from database.models import User

def create_first_user():
    db = SessionLocal()
    
    email_admin = "admin@vrtice.com"
    senha_admin = "vrtice2026"
    
    # Verifica se o utilizador já existe para não duplicar
    usuario_existente = db.query(User).filter(User.email == email_admin).first()
    
    if usuario_existente:
        print(f"⚠️ O utilizador {email_admin} já existe no banco de dados!")
        return

    print("Forjando a Chave Mestra...")
    
    # Criptografa a senha (Nunca guardamos senhas em texto limpo)
    senha_criptografada = bcrypt.hashpw(senha_admin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Cria o utilizador
    novo_admin = User(
        email=email_admin,
        hashed_password=senha_criptografada,
        role="admin"
    )
    
    db.add(novo_admin)
    db.commit()
    
    print("✅ Sucesso! O seu acesso foi criado.")
    print(f"📧 Email: {email_admin}")
    print(f"🔑 Senha: {senha_admin}")
    
    db.close()

if __name__ == "__main__":
    create_first_user()