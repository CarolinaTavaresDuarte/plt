from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ibge_importer import import_ibge_autism_file
from app.schemas import IndigenousAutismStatisticResponse
from app.models import IndigenousAutismStatistic
from app.services.ibge_students_autism_by_race import import_ibge_students_autism_by_race
from app.models import IBGEStudentAutism
from app.schemas import IBGEStudentAutismByRaceResponse
from app.schemas import IndigenousAutismStatisticResponse, IndigenousAutismSummary 
from app.services.ibge_analytics import get_indigenous_autism_summary

# Criação do roteador, definindo o prefixo da URL e as tags para o Swagger UI
router = APIRouter(prefix="/api/v1/ibge", tags=["IBGE"])

# autismo em indigenas
@router.post("/autism-indigenous/import")
def import_autism_indigenous(db: Session = Depends(get_db)):
    import_ibge_autism_file(db, "data/autismo_em_indigenas.xlsx")
    return {"status": "import completed"}

# Rota que retorna uma LISTA de objetos.
# Exemplo: [{"UF": "SP", "casos": 100}, {"UF": "RJ", "casos": 50}, ...]
@router.get("/autism-indigenous", response_model=list[IndigenousAutismStatisticResponse])
def list_autism_indigenous(db: Session = Depends(get_db)):
    return db.query(IndigenousAutismStatistic).all()

# Rota que retorna um ÚNICO objeto com a soma total.
# Exemplo: {"total_populacao": 1000000, "total_casos": 5000}
@router.get("/autism-indigenous/summary", response_model=IndigenousAutismSummary)
def list_autism_indigenous_summary(db: Session = Depends(get_db)):
    return get_indigenous_autism_summary(db)

# autismo em estudantes por cor
@router.post("/students-autism-by-race/import")
def import_students_autism_by_race_route(db: Session = Depends(get_db)):
    import_ibge_students_autism_by_race(db, "data/autismo_estudantes_cor.xlsx")
    return {"status": "import completed"}

@router.get("/students-autism-by-race")
def list_students_autism_by_race(db: Session = Depends(get_db)):
    return db.query(IBGEStudentAutism).all()

