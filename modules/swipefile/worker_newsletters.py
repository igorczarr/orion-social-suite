# modules/swipefile/worker_newsletters.py
import sys
import os
import imaplib
import email
from email.header import decode_header
from datetime import datetime, timezone
from bs4 import BeautifulSoup
import markdownify
from sqlalchemy.exc import SQLAlchemyError

# Ajuste de PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.connection import SessionLocal
from database.models import SwipeSource, SwipeAsset
from config.settings import settings

class InboxGhostWorker:
    """
    ESQUADRÃO NEWSLETTERS (O Fantasma da Caixa de Entrada).
    Lê e-mails via IMAP, extrai Storytelling, Assuntos de Alta Abertura e Funis.
    """
    def __init__(self):
        self.db = SessionLocal()
        
        # Conexão IMAP (Fallback para testes locais se não configurado)
        self.imap_server = os.getenv("IMAP_SERVER", "imap.gmail.com")
        self.username = os.getenv("IMAP_EMAIL")
        self.password = os.getenv("IMAP_PASSWORD")

        # Classificação Automática por Remetente (Pode ser expandida no banco depois)
        self.source_mapping = {
            "morningbrew.com": {"name": "Morning Brew", "market": "US", "category": "Newsletter"},
            "thehustle.co": {"name": "The Hustle", "market": "US", "category": "Newsletter"},
            "bensettle.com": {"name": "Ben Settle", "market": "US", "category": "Email Marketing (Aggressive)"},
            "thenewscc.com.br": {"name": "The News", "market": "BR", "category": "Newsletter"},
            "blog.pablomarcal.com.br": {"name": "Marçal", "market": "BR", "category": "Newsletter"},
            "blog.pablomarcal.com.br": {"name": "Marçal", "market": "BR", "category": "Newsletter"},
        }

    def _get_or_create_source(self, sender_email: str, sender_name: str) -> SwipeSource:
        """Mapeia o remetente para uma Fonte de Autoridade no Grafo de Conhecimento."""
        domain = sender_email.split('@')[-1].lower() if '@' in sender_email else sender_email
        
        # Verifica se temos um mapeamento VIP para este domínio
        mapped_data = self.source_mapping.get(domain)
        
        source_name = mapped_data["name"] if mapped_data else sender_name or domain
        market = mapped_data["market"] if mapped_data else "Global"
        category = mapped_data["category"] if mapped_data else "Email Sequence"
        
        source = self.db.query(SwipeSource).filter(SwipeSource.name == source_name).first()
        if not source:
            source = SwipeSource(name=source_name, category=category, market=market, authority_score=85)
            self.db.add(source)
            self.db.commit()
            self.db.refresh(source)
        return source

    def _clean_email_body(self, html_content: str) -> str:
        """
        [SÊNIOR] Purificação de E-mail.
        Remove os Pixels de Rastreamento (imagens 1x1), links de unsubscribe, 
        e converte o HTML complexo em Markdown puro, focado apenas na COPY.
        """
        if not html_content:
            return ""
            
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Destrói links de rastreamento invisíveis e rodapés legais
        for img in soup.find_all('img'):
            if img.get('width') == '1' or img.get('height') == '1':
                img.decompose()
                
        # Converte o restante para Markdown mantendo links e negritos (A estrutura da Copy)
        markdown_text = markdownify.markdownify(str(soup), heading_style="ATX")
        
        # Limpeza de quebras de linha excessivas
        lines = [line.strip() for line in markdown_text.split('\n')]
        clean_markdown = '\n'.join([line for line in lines if line])
        
        return clean_markdown

    def _decode_string(self, s):
        """Decodifica os cabeçalhos bizarros do protocolo de e-mail."""
        if not s: return ""
        decoded_list = decode_header(s)
        text_parts = []
        for content, charset in decoded_list:
            if isinstance(content, bytes):
                try:
                    text_parts.append(content.decode(charset or 'utf-8'))
                except:
                    text_parts.append(content.decode('latin-1', errors='ignore'))
            else:
                text_parts.append(content)
        return "".join(text_parts)

    def extract_emails(self):
        if not self.username or not self.password:
            print(" ⚠️ [FANTASMA] Credenciais IMAP não configuradas. Operação abortada.")
            return

        print(f"\n👻 [O FANTASMA] Infiltrando a Caixa de Entrada: {self.username}...")
        
        try:
            # Conexão SSL Segura
            mail = imaplib.IMAP4_SSL(self.imap_server)
            mail.login(self.username, self.password)
            mail.select("inbox")
            
            # Busca todos os e-mails NÃO LIDOS
            status, messages = mail.search(None, "UNSEEN")
            email_ids = messages[0].split()
            
            if not email_ids:
                print(" 📭 Nenhum e-mail novo na caixa de entrada.")
                mail.logout()
                return
                
            print(f" 📥 {len(email_ids)} E-mails interceptados. Iniciando extração de Copy...")
            
            ativos_salvos = 0
            
            for e_id in email_ids:
                status, msg_data = mail.fetch(e_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        # Extrai Cabeçalhos (A Subject Line é o Hook!)
                        subject = self._decode_string(msg.get("Subject"))
                        from_ = self._decode_string(msg.get("From"))
                        
                        sender_name = from_.split('<')[0].strip() if '<' in from_ else from_
                        sender_email = from_.split('<')[1].replace('>', '').strip() if '<' in from_ else from_
                        
                        # Extrai o Corpo do E-mail
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))
                                
                                # Focamos no HTML (onde o design da copy está) ou Text
                                if "attachment" not in content_disposition:
                                    if content_type == "text/html":
                                        body = part.get_payload(decode=True).decode(errors='ignore')
                                        break # Se achou HTML, ignora o plain text
                                    elif content_type == "text/plain" and not body:
                                        body = part.get_payload(decode=True).decode(errors='ignore')
                        else:
                            body = msg.get_payload(decode=True).decode(errors='ignore')
                            
                        # Limpa o conteúdo
                        clean_copy = self._clean_email_body(body)
                        
                        if clean_copy and len(clean_copy) > 50:
                            # 1. Garante a Fonte
                            source = self._get_or_create_source(sender_email, sender_name)
                            
                            # 2. Injeção no Banco (Formatação especializada para E-mails)
                            asset = SwipeAsset(
                                source_id=source.id,
                                asset_type="Email Copy",
                                title_or_hook=subject, # A subject line é o Hook primário
                                clean_content=f"ASSUNTO: {subject}\nREMETENTE: {sender_name}\n\n{clean_copy}",
                                original_url=f"email://{sender_email}" # Identificador interno
                            )
                            self.db.add(asset)
                            ativos_salvos += 1
                            print(f"    ✅ E-mail salvo | Remetente: {sender_name} | Assunto: {subject[:40]}...")
                            
                # Marca como LIDO implicitamente ao buscar, ou poderíamos mover para uma pasta "Arquivados"
                
            self.db.commit()
            print(f"\n🏁 [O FANTASMA] Extração Finalizada. {ativos_salvos} E-mails de Alta Conversão injetados.")
            
            mail.logout()
            
        except imaplib.IMAP4.error as e:
            print(f" ❌ [CRÍTICO] Falha de Autenticação IMAP: {e}")
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f" ❌ [CRÍTICO] Erro de persistência no Banco: {e}")
        finally:
            self.db.close()

# =====================================================================
# BLOCO DE TESTE
# =====================================================================
if __name__ == "__main__":
    from database.connection import init_db
    try: init_db()
    except: pass
    
    worker = InboxGhostWorker()
    worker.extract_emails()