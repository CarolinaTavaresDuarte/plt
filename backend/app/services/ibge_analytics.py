from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import IndigenousAutismStatistic 
from app.schemas import IndigenousAutismStatisticResponse, IndigenousAutismSummary

def get_indigenous_autism_by_location(db: Session) -> list[IndigenousAutismStatisticResponse]:
    """
    Busca todas as estatísticas desagregadas por localização.
    """
    records = db.query(IndigenousAutismStatistic).all()
    return records

def get_indigenous_autism_summary(db: Session) -> IndigenousAutismSummary:
    """
    Calcula a população indígena total e os casos de autismo total
    para a dashboard.
    """
    # Consulta SQLAlchemy para SOMAR (SUM) os dados de todas as linhas
    result = db.query(
        func.sum(IndigenousAutismStatistic.indigenous_population).label('total_population'),
        func.sum(IndigenousAutismStatistic.autism_count).label('total_autism_cases')
    ).first()
    
    # Verifica se retornou algo válido
    if result and result.total_population is not None:
        return IndigenousAutismSummary(
            total_population=result.total_population,
            total_autism_cases=result.total_autism_cases
        )
    
    # Retorno padrão se o banco estiver vazio
    return IndigenousAutismSummary(total_population=0, total_autism_cases=0)