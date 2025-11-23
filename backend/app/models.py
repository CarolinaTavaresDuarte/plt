from datetime import datetime
from sqlalchemy import (
    Boolean, CheckConstraint, Column, DateTime, Enum, ForeignKey,
    Integer, JSON, String, Text, UniqueConstraint, Float
)
from sqlalchemy.orm import relationship
from .config import get_settings
from .database import Base
from datetime import datetime 

settings = get_settings()


# ===================== USERS =====================

class UserAccount(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"schema": settings.user_schema}

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)
    role = Column(
        Enum("responsavel", "especialista", name="user_role", schema=settings.user_schema),
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    especialista = relationship("SpecialistProfile", back_populates="usuario", uselist=False)
    testados = relationship("TestedIndividual", back_populates="responsavel")
    resultados = relationship("TestResult", back_populates="usuario")
    contatos = relationship("ContactMessage", back_populates="usuario")


# ===================== SPECIALISTS =====================

class SpecialistProfile(Base):
    __tablename__ = "especialistas"
    __table_args__ = {"schema": settings.specialist_schema}

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer,
        ForeignKey(f"{settings.user_schema}.usuarios.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )
    conselho = Column(String(255), nullable=True)
    especialidade = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    usuario = relationship("UserAccount", back_populates="especialista")


# ===================== TESTED INDIVIDUALS =====================

class TestedIndividual(Base):
    __tablename__ = "testados"
    __table_args__ = {"schema": settings.tests_schema}

    id = Column(Integer, primary_key=True, index=True)
    responsavel_id = Column(
        Integer,
        ForeignKey(f"{settings.user_schema}.usuarios.id", ondelete="SET NULL"),
        nullable=True
    )
    nome_completo = Column(String(255), nullable=False)
    documento_cpf = Column(String(14), nullable=False, unique=True, index=True)
    regiao_bairro = Column(String(255), nullable=False)
    contato_telefone = Column(String(32), nullable=False)
    contato_email = Column(String(255), nullable=False)
    consentimento_pesquisa = Column(Boolean, nullable=False, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    resultados = relationship("TestResult", back_populates="testado", cascade="all, delete-orphan")
    responsavel = relationship("UserAccount", back_populates="testados")


# ===================== TEST RESULTS =====================

class TestResult(Base):
    __tablename__ = "resultados_testes"
    __table_args__ = (
        UniqueConstraint("testado_id", "teste_tipo", name="uq_resultado_testado_tipo"),
        CheckConstraint("score >= 0", name="check_score_positive"),
        {"schema": settings.tests_schema},
    )

    id = Column(Integer, primary_key=True, index=True)
    testado_id = Column(
        Integer,
        ForeignKey(f"{settings.tests_schema}.testados.id", ondelete="CASCADE"),
        nullable=False
    )
    usuario_id = Column(
        Integer,
        ForeignKey(f"{settings.user_schema}.usuarios.id", ondelete="SET NULL"),
        nullable=True
    )
    teste_tipo = Column(String(64), nullable=False)
    respostas = Column(JSON, nullable=False)
    score = Column(Integer, nullable=False)
    classificacao = Column(String(64), nullable=False)
    faixa_etaria = Column(String(64), nullable=False)
    regiao_geografica = Column(String(128), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    testado = relationship("TestedIndividual", back_populates="resultados")
    usuario = relationship("UserAccount", back_populates="resultados")
    anonimizado = relationship("AnonymisedRecord", back_populates="resultado", uselist=False, cascade="all, delete-orphan")


# ===================== ANONYMISED RECORDS =====================

class AnonymisedRecord(Base):
    __tablename__ = "registros_anonimizados"
    __table_args__ = {"schema": settings.tests_schema}

    id = Column(Integer, primary_key=True, index=True)
    resultado_id = Column(
        Integer,
        ForeignKey(f"{settings.tests_schema}.resultados_testes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )
    faixa_etaria = Column(String(64), nullable=False)
    regiao_geografica = Column(String(128), nullable=False)
    score = Column(Integer, nullable=False)
    teste_tipo = Column(String(64), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    resultado = relationship("TestResult", back_populates="anonimizado")


# ===================== CONTACT MESSAGES =====================

class ContactMessage(Base):
    __tablename__ = "contatos"
    __table_args__ = {"schema": settings.user_schema}

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    usuario_id = Column(Integer, ForeignKey(f"{settings.user_schema}.usuarios.id", ondelete="SET NULL"), nullable=True)
    usuario = relationship("UserAccount", back_populates="contatos")

# ===================== IBGE ESTATISTICAS INDÍGENAS =====================
class IndigenousAutismStatistic(Base):
    __tablename__ = "indigenous_autism_statistics"
    __table_args__ = {"schema": settings.ibge_data_schema}

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), nullable=False)
    indigenous_population = Column(Integer, nullable=False)
    autism_count = Column(Integer, nullable=False)
    autism_percentage = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ===================== IBGE ESTATISTICAS ESTUDANTES =====================
class IBGEStudentAutism(Base):
    __tablename__ = "student_autism_statistics"
    __table_args__ = {"schema": settings.ibge_data_schema}

    id = Column(Integer, primary_key=True)
    location = Column(String(255), nullable=False)

    # ============================
    # 1. Total de estudantes
    # ============================
    total_total = Column(Integer)
    total_6_14 = Column(Integer)
    total_15_17 = Column(Integer)
    total_18_24 = Column(Integer)
    total_25_mais = Column(Integer)

    # Raça: Branca
    branca_total = Column(Integer)
    branca_6_14 = Column(Integer)
    branca_15_17 = Column(Integer)
    branca_18_24 = Column(Integer)
    branca_25_mais = Column(Integer)

    # Raça: Preta
    preta_total = Column(Integer)
    preta_6_14 = Column(Integer)
    preta_15_17 = Column(Integer)
    preta_18_24 = Column(Integer)
    preta_25_mais = Column(Integer)

    # Raça: Amarela
    amarela_total = Column(Integer)
    amarela_6_14 = Column(Integer)
    amarela_15_17 = Column(Integer)
    amarela_18_24 = Column(Integer)
    amarela_25_mais = Column(Integer)

    # Raça: Parda
    parda_total = Column(Integer)
    parda_6_14 = Column(Integer)
    parda_15_17 = Column(Integer)
    parda_18_24 = Column(Integer)
    parda_25_mais = Column(Integer)

    # Raça: Indígena
    indigena_total = Column(Integer)
    indigena_6_14 = Column(Integer)
    indigena_15_17 = Column(Integer)
    indigena_18_24 = Column(Integer)
    indigena_25_mais = Column(Integer)

    # ============================
    # 2. Estudantes diagnosticados com autismo
    # ============================
    aut_total_total = Column(Integer)
    aut_total_6_14 = Column(Integer)
    aut_total_15_17 = Column(Integer)
    aut_total_18_24 = Column(Integer)
    aut_total_25_mais = Column(Integer)

    aut_branca_total = Column(Integer)
    aut_branca_6_14 = Column(Integer)
    aut_branca_15_17 = Column(Integer)
    aut_branca_18_24 = Column(Integer)
    aut_branca_25_mais = Column(Integer)

    aut_preta_total = Column(Integer)
    aut_preta_6_14 = Column(Integer)
    aut_preta_15_17 = Column(Integer)
    aut_preta_18_24 = Column(Integer)
    aut_preta_25_mais = Column(Integer)

    aut_amarela_total = Column(Integer)
    aut_amarela_6_14 = Column(Integer)
    aut_amarela_15_17 = Column(Integer)
    aut_amarela_18_24 = Column(Integer)
    aut_amarela_25_mais = Column(Integer)

    aut_parda_total = Column(Integer)
    aut_parda_6_14 = Column(Integer)
    aut_parda_15_17 = Column(Integer)
    aut_parda_18_24 = Column(Integer)
    aut_parda_25_mais = Column(Integer)

    aut_indigena_total = Column(Integer)
    aut_indigena_6_14 = Column(Integer)
    aut_indigena_15_17 = Column(Integer)
    aut_indigena_18_24 = Column(Integer)
    aut_indigena_25_mais = Column(Integer)

    # ============================
    # 3. Percentual diagnosticado com autismo
    # ============================
    pct_total_total = Column(Float)
    pct_total_6_14 = Column(Float)
    pct_total_15_17 = Column(Float)
    pct_total_18_24 = Column(Float)
    pct_total_25_mais = Column(Float)

    pct_branca_total = Column(Float)
    pct_branca_6_14 = Column(Float)
    pct_branca_15_17 = Column(Float)
    pct_branca_18_24 = Column(Float)
    pct_branca_25_mais = Column(Float)

    pct_preta_total = Column(Float)
    pct_preta_6_14 = Column(Float)
    pct_preta_15_17 = Column(Float)
    pct_preta_18_24 = Column(Float)
    pct_preta_25_mais = Column(Float)

    pct_amarela_total = Column(Float)
    pct_amarela_6_14 = Column(Float)
    pct_amarela_15_17 = Column(Float)
    pct_amarela_18_24 = Column(Float)
    pct_amarela_25_mais = Column(Float)

    pct_parda_total = Column(Float)
    pct_parda_6_14 = Column(Float)
    pct_parda_15_17 = Column(Float)
    pct_parda_18_24 = Column(Float)
    pct_parda_25_mais = Column(Float)

    pct_indigena_total = Column(Float)
    pct_indigena_6_14 = Column(Float)
    pct_indigena_15_17 = Column(Float)
    pct_indigena_18_24 = Column(Float)
    pct_indigena_25_mais = Column(Float)

# ===================== IBGE ESTATISTICAS POPULAÇÃO RESIDENTE =====================
class ResidentAutismStatistic(Base):
    __tablename__ = " resident_autism_statistics"
    __table_args__ = {
        "schema": settings.ibge_data_schema
    }

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), nullable=False)
    
    total_residentes = Column(Integer, nullable=False) # Total Residentes
    total_residentes_homens = Column(Integer, nullable=False) # Total Residentes Homens
    total_residentes_mulheres = Column(Integer, nullable=False) # Total Residentes Mulheres
    total_residentes_autismo = Column(Integer, nullable=False) # Total Residentes Autismo
    total_residentes_homens_autismo = Column(Integer, nullable=False) # Total Residentes Homens Autismo
    total_residentes_mulheres_autismo = Column(Integer, nullable=False) # Total Residentes Mulheres Autismo
    
    porcentagem_homens_autismo = Column(Float, nullable=False)
    porcentagem_mulheres_autismo = Column(Float, nullable=False)
    porcentagem_total_autismo = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)