from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import ResidentAutismStatistic 

def get_resident_gender_autism_distribution(db: Session):
    """
    Calcula a distribuição de casos por sexo (Homens vs Mulheres) 
    em relação ao total de casos (TRA).
    """
    
    # Consulta: Soma os totais de casos de autismo em todas as localidades
    result = db.query(
        func.sum(func.coalesce(ResidentAutismStatistic. total_residentes_homens_autismo, 0)).label("total_male_cases"),
        func.sum(func.coalesce(ResidentAutismStatistic. total_residentes_mulheres_autismo, 0)).label("total_female_cases"),
        func.sum(func.coalesce(ResidentAutismStatistic. total_residentes_autismo, 0)).label("total_overall_cases") # Soma total de casos (TRA)
    ).first()

    total_male_cases = result.total_male_cases or 0
    total_female_cases = result.total_female_cases or 0
    total_overall_cases = total_male_cases + total_female_cases # Recalculamos o total geral para segurança

    # Se não houver casos de autismo em geral, retorna vazio.
    if total_overall_cases == 0:
        return {} 

    # Cálculo das Porcentagens de Distribuição (sobre o total de casos)
    # Sua regra de negócio: (Casos Homens / Total Geral de Casos) * 100
    male_percent = (total_male_cases / total_overall_cases) * 100
    female_percent = (total_female_cases / total_overall_cases) * 100

    return {
        "male_percentage": round(male_percent, 2),
        "female_percentage": round(female_percent, 2),
        "total_male_cases": total_male_cases,
        "total_female_cases": total_female_cases
    }