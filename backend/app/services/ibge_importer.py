# Processa e importa dados brutos do Excel do IBGE para o DB 
import pandas as pd
from sqlalchemy.orm import Session
from app.models import IndigenousAutismStatistic
from app.config import get_settings

settings = get_settings()

def import_ibge_autism_file(db: Session, file_path: str):
    # Lê a planilha, deixando pandas decidir o engine
    df = pd.read_excel(file_path, header=1)  
    # header=1 → significa: "a segunda linha contém os nomes das colunas"

    # Renomeia as colunas exatamente para o que precisamos
    df.columns = [
        "location",
        "indigenous_population",
        "autism_count",
        "autism_percentage"
    ]

    # Remove linhas totalmente vazias
    df = df.dropna(subset=["location"])

    # Remove linhas do tipo "Fonte: IBGE..."
    df = df[~df["location"].astype(str).str.contains("Fonte", na=False)]

    # Converte os números
    df["indigenous_population"] = pd.to_numeric(df["indigenous_population"], errors="coerce")
    df["autism_count"] = pd.to_numeric(df["autism_count"], errors="coerce")
    df["autism_percentage"] = pd.to_numeric(df["autism_percentage"], errors="coerce")

    # Remove linhas onde não há números
    df = df.dropna(subset=["indigenous_population", "autism_count"])

    # Converte para int / float
    df["indigenous_population"] = df["indigenous_population"].astype(int)
    df["autism_count"] = df["autism_count"].astype(int)
    df["autism_percentage"] = df["autism_percentage"].astype(float)

    # Insere no banco
    for _, row in df.iterrows():
        record = IndigenousAutismStatistic(
            location=row["location"],
            indigenous_population=row["indigenous_population"],
            autism_count=row["autism_count"],
            autism_percentage=row["autism_percentage"]
        )
        db.add(record)

    db.commit()

    return len(df)
