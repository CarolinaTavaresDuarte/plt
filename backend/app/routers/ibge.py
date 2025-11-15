from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ibge_importer import import_ibge_autism_file
from app.schemas import IndigenousAutismStatisticResponse
from app.models import IndigenousAutismStatistic
from app.services.ibge_students_autism_by_race import import_ibge_students_autism_by_race
from app.models import IBGEStudentAutism
from app.schemas import IBGEStudentAutismByRaceResponse

router = APIRouter(prefix="/api/v1/ibge", tags=["IBGE"])

# autismo em indigenas
@router.post("/autism-indigenous/import")
def import_autism_indigenous(db: Session = Depends(get_db)):
    import_ibge_autism_file(db, "data/autismo_em_indigenas.xlsx")
    return {"status": "import completed"}


@router.get("/autism-indigenous", response_model=list[IndigenousAutismStatisticResponse])
def list_autism_indigenous(db: Session = Depends(get_db)):
    return db.query(IndigenousAutismStatistic).all()

# autismo em estudantes por cor
@router.post("/students-autism-by-race/import")
def import_students_autism_by_race_route(db: Session = Depends(get_db)):
    import_ibge_students_autism_by_race(db, "data/autismo_estudantes_cor.xlsx")
    return {"status": "import completed"}

@router.get("/students-autism-by-race")
def list_students_autism_by_race(db: Session = Depends(get_db)):
    return db.query(IBGEStudentAutism).all()
