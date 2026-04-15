from sqlalchemy.orm import Session
from database.models import ClientBriefing

class BriefingManager:
    @staticmethod
    def save_briefing(db: Session, tenant_id: int, data: dict):
        # Transforma o JSON do formulário no modelo de banco de dados
        new_briefing = ClientBriefing(
            tenant_id=tenant_id,
            product_name=data.get('product_name'),
            product_description=data.get('product_description'),
            target_audience=data.get('target_audience'),
            main_pain_points=data.get('pain_points'),
            unique_selling_point=data.get('usp')
        )
        db.add(new_briefing)
        db.commit()
        return new_briefing

    @staticmethod
    def get_context_for_ai(db: Session, tenant_id: int) -> str:
        # Recupera o briefing mais recente para guiar o Gemini
        briefing = db.query(ClientBriefing).filter_by(tenant_id=tenant_id).first()
        if not briefing:
            return "Aviso: Nenhum briefing específico fornecido pelo cliente."
        
        return f"""
        CONTEXTO DO PRODUTO: {briefing.product_name}
        DESCRIÇÃO: {briefing.product_description}
        PÚBLICO-ALVO: {briefing.target_audience}
        DORES PRINCIPAIS: {briefing.main_pain_points}
        """