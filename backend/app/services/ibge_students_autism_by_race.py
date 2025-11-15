import pandas as pd
from sqlalchemy.orm import Session
from app.models import IBGEStudentAutism
import logging

logger = logging.getLogger("uvicorn.error")

# Mapeamento Excel → nome das colunas do MODELO
COLUMN_MAP = {
    # Total estudantes
    "Total": "total_total",
    "6 a 14 anos": "total_6_14",
    "15 a 17 anos": "total_15_17",
    "18 a 24 anos": "total_18_24",
    "25 anos ou mais": "total_25_mais",

    # Branca
    "Total.1": "branca_total",
    "6 a 14 anos.1": "branca_6_14",
    "15 a 17 anos.1": "branca_15_17",
    "18 a 24 anos.1": "branca_18_24",
    "25 anos ou mais.1": "branca_25_mais",

    # Preta
    "Total.2": "preta_total",
    "6 a 14 anos.2": "preta_6_14",
    "15 a 17 anos.2": "preta_15_17",
    "18 a 24 anos.2": "preta_18_24",
    "25 anos ou mais.2": "preta_25_mais",

    # Amarela
    "Total.3": "amarela_total",
    "6 a 14 anos.3": "amarela_6_14",
    "15 a 17 anos.3": "amarela_15_17",
    "18 a 24 anos.3": "amarela_18_24",
    "25 anos ou mais.3": "amarela_25_mais",

    # Parda
    "Total.4": "parda_total",
    "6 a 14 anos.4": "parda_6_14",
    "15 a 17 anos.4": "parda_15_17",
    "18 a 24 anos.4": "parda_18_24",
    "25 anos ou mais.4": "parda_25_mais",

    # Indígena
    "Total.5": "indigena_total",
    "6 a 14 anos.5": "indigena_6_14",
    "15 a 17 anos.5": "indigena_15_17",
    "18 a 24 anos.5": "indigena_18_24",
    "25 anos ou mais.5": "indigena_25_mais",

    # Autismo total
    "Total.6": "aut_total_total",
    "6 a 14 anos.6": "aut_total_6_14",
    "15 a 17 anos.6": "aut_total_15_17",
    "18 a 24 anos.6": "aut_total_18_24",
    "25 anos ou mais.6": "aut_total_25_mais",

    # Autismo branca
    "Total.7": "aut_branca_total",
    "6 a 14 anos.7": "aut_branca_6_14",
    "15 a 17 anos.7": "aut_branca_15_17",
    "18 a 24 anos.7": "aut_branca_18_24",
    "25 anos ou mais.7": "aut_branca_25_mais",

    # Autismo preta
    "Total.8": "aut_preta_total",
    "6 a 14 anos.8": "aut_preta_6_14",
    "15 a 17 anos.8": "aut_preta_15_17",
    "18 a 24 anos.8": "aut_preta_18_24",
    "25 anos ou mais.8": "aut_preta_25_mais",

    # Autismo amarela
    "Total.9": "aut_amarela_total",
    "6 a 14 anos.9": "aut_amarela_6_14",
    "15 a 17 anos.9": "aut_amarela_15_17",
    "18 a 24 anos.9": "aut_amarela_18_24",
    "25 anos ou mais.9": "aut_amarela_25_mais",

    # Autismo parda
    "Total.10": "aut_parda_total",
    "6 a 14 anos.10": "aut_parda_6_14",
    "15 a 17 anos.10": "aut_parda_15_17",
    "18 a 24 anos.10": "aut_parda_18_24",
    "25 anos ou mais.10": "aut_parda_25_mais",

    # Autismo indígena
    "Total.11": "aut_indigena_total",
    "6 a 14 anos.11": "aut_indigena_6_14",
    "15 a 17 anos.11": "aut_indigena_15_17",
    "18 a 24 anos.11": "aut_indigena_18_24",
    "25 anos ou mais.11": "aut_indigena_25_mais",

    # Percentual
    "Total.12": "pct_total_total",
    "6 a 14 anos.12": "pct_total_6_14",
    "15 a 17 anos.12": "pct_total_15_17",
    "18 a 24 anos.12": "pct_total_18_24",
    "25 anos ou mais.12": "pct_total_25_mais",

    "Total.13": "pct_branca_total",
    "6 a 14 anos.13": "pct_branca_6_14",
    "15 a 17 anos.13": "pct_branca_15_17",
    "18 a 24 anos.13": "pct_branca_18_24",
    "25 anos ou mais.13": "pct_branca_25_mais",

    "Total.14": "pct_preta_total",
    "6 a 14 anos.14": "pct_preta_6_14",
    "15 a 17 anos.14": "pct_preta_15_17",
    "18 a 24 anos.14": "pct_preta_18_24",
    "25 anos ou mais.14": "pct_preta_25_mais",

    "Total.15": "pct_amarela_total",
    "6 a 14 anos.15": "pct_amarela_6_14",
    "15 a 17 anos.15": "pct_amarela_15_17",
    "18 a 24 anos.15": "pct_amarela_18_24",
    "25 anos ou mais.15": "pct_amarela_25_mais",

    "Total.16": "pct_parda_total",
    "6 a 14 anos.16": "pct_parda_6_14",
    "15 a 17 anos.16": "pct_parda_15_17",
    "18 a 24 anos.16": "pct_parda_18_24",
    "25 anos ou mais.16": "pct_parda_25_mais",

    "Total.17": "pct_indigena_total",
    "6 a 14 anos.17": "pct_indigena_6_14",
    "15 a 17 anos.17": "pct_indigena_15_17",
    "18 a 24 anos.17": "pct_indigena_18_24",
    "25 anos ou mais.17": "pct_indigena_25_mais",
}


def sanitize_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str) and value.strip() == "-":
        return None
    try:
        return float(value)
    except Exception:
        return None


def import_ibge_students_autism_by_race(db: Session, file_path: str):
    logger.info("🔍 Iniciando importação...")
    df = pd.read_excel(file_path, header=5)
    logger.info(f"📄 Colunas originais: {list(df.columns)}")

    # Garante que a PRIMEIRA coluna vire 'location'
    first_col = df.columns[0]
    if first_col != "location":
        df.rename(columns={first_col: "location"}, inplace=True)

    # Renomeia as demais colunas para os nomes do modelo
    df.rename(columns=COLUMN_MAP, inplace=True)
    logger.info(f"📄 Colunas após rename: {list(df.columns)}")

    # IMPORTAÇÃO
    for index, row in df.iterrows():
        # se não tiver location, pula
        if "location" not in row or pd.isna(row["location"]):
            logger.info(f"⚠ Linha {index} ignorada: location vazio")
            continue

        data = {
            "location": str(row["location"])
        }

        # Agora usamos os NOMES DO MODELO (já renomeados)
        for model_col in COLUMN_MAP.values():
            data[model_col] = sanitize_value(row.get(model_col))

        logger.debug(f"➡ Linha {index} → {data}")
        db.add(IBGEStudentAutism(**data))

    db.commit()
    logger.info("✅ Importação concluída!")
