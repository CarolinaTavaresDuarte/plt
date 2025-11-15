from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

RoleType = Literal["responsavel", "especialista"]
TesteTipo = Literal[
    "mchat",
    "assq",
    "aq10",
    "ados2",
    "adir",
]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: RoleType


class UserBaseSchema(BaseModel):
    nome: str = Field(..., max_length=255)
    email: EmailStr
    role: RoleType


class UserCreateSchema(UserBaseSchema):
    senha: str = Field(..., min_length=6)


class UserResponseSchema(UserBaseSchema):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SpecialistProfileSchema(BaseModel):
    conselho: Optional[str]
    especialidade: Optional[str]
    bio: Optional[str]


class SpecialistProfileResponse(SpecialistProfileSchema):
    id: int
    usuario_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestedIndividualBase(BaseModel):
    nome_completo: str
    documento_cpf: str = Field(..., min_length=11, max_length=14)
    regiao_bairro: str
    contato_telefone: str
    contato_email: EmailStr
    consentimento_pesquisa: bool


class TestedIndividualCreate(TestedIndividualBase):
    pass


class TestedIndividualResponse(TestedIndividualBase):
    id: int
    responsavel_id: Optional[int]
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class TestResponseItem(BaseModel):
    pergunta_id: str
    resposta: str


class TestResultCreate(BaseModel):
    teste_tipo: TesteTipo
    faixa_etaria: str
    regiao_geografica: str
    respostas: List[TestResponseItem]


class TestResultResponse(BaseModel):
    id: int
    teste_tipo: str
    faixa_etaria: str
    regiao_geografica: str
    score: int
    classificacao: str
    criado_em: datetime
    respostas: List[TestResponseItem]

    model_config = ConfigDict(from_attributes=True)


class TestSubmissionResponse(BaseModel):
    resultado: TestResultResponse
    mensagem_orientacao: str


class DashboardMetric(BaseModel):
    label: str
    value: str


class ContactRequest(BaseModel):
    nome: str
    email: EmailStr
    mensagem: str


class ContactResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    mensagem: str
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class PlatformStatsResponse(BaseModel):
    triagens_realizadas: int
    especialistas_cadastrados: int
    ultima_atualizacao: datetime


class SpecialistDashboardItem(BaseModel):
    nome_completo: str
    faixa_etaria: str
    regiao_bairro: str
    contato_principal: str
    risco: str
    teste_tipo: str
    data: datetime


class SpecialistDashboardResponse(BaseModel):
    totais_por_risco: dict
    pacientes: List[SpecialistDashboardItem]


class PatientDashboardCard(BaseModel):
    teste_tipo: str
    data: datetime
    risco: str


class PatientDashboardResponse(BaseModel):
    cpf: str
    cards: List[PatientDashboardCard]
    transparencia_ibge: List[str]

class IndigenousAutismStatisticBase(BaseModel):
    location: str
    indigenous_population: int
    autism_count: int
    autism_percentage: float

class IndigenousAutismStatisticCreate(IndigenousAutismStatisticBase):
    pass

class IndigenousAutismStatisticResponse(IndigenousAutismStatisticBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IBGEStudentAutismByRaceBase(BaseModel):
    location: str | None = None

    total_total: int | None = None
    total_6_14: int | None = None
    total_15_17: int | None = None
    total_18_24: int | None = None
    total_25_mais: int | None = None

    branca_total: int | None = None
    branca_6_14: int | None = None
    branca_15_17: int | None = None
    branca_18_24: int | None = None
    branca_25_mais: int | None = None

    preta_total: int | None = None
    preta_6_14: int | None = None
    preta_15_17: int | None = None
    preta_18_24: int | None = None
    preta_25_mais: int | None = None

    amarela_total: int | None = None
    amarela_6_14: int | None = None
    amarela_15_17: int | None = None
    amarela_18_24: int | None = None
    amarela_25_mais: int | None = None

    parda_total: int | None = None
    parda_6_14: int | None = None
    parda_15_17: int | None = None
    parda_18_24: int | None = None
    parda_25_mais: int | None = None

    indigena_total: int | None = None
    indigena_6_14: int | None = None
    indigena_15_17: int | None = None
    indigena_18_24: int | None = None
    indigena_25_mais: int | None = None

    aut_total_total: int | None = None
    aut_total_6_14: int | None = None
    aut_total_15_17: int | None = None
    aut_total_18_24: int | None = None
    aut_total_25_mais: int | None = None

    aut_branca_total: int | None = None
    aut_branca_6_14: int | None = None
    aut_branca_15_17: int | None = None
    aut_branca_18_24: int | None = None
    aut_branca_25_mais: int | None = None

    aut_preta_total: int | None = None
    aut_preta_6_14: int | None = None
    aut_preta_15_17: int | None = None
    aut_preta_18_24: int | None = None
    aut_preta_25_mais: int | None = None

    aut_amarela_total: int | None = None
    aut_amarela_6_14: int | None = None
    aut_amarela_15_17: int | None = None
    aut_amarela_18_24: int | None = None
    aut_amarela_25_mais: int | None = None

    aut_parda_total: int | None = None
    aut_parda_6_14: int | None = None
    aut_parda_15_17: int | None = None
    aut_parda_18_24: int | None = None
    aut_parda_25_mais: int | None = None

    aut_indigena_total: int | None = None
    aut_indigena_6_14: int | None = None
    aut_indigena_15_17: int | None = None
    aut_indigena_18_24: int | None = None
    aut_indigena_25_mais: int | None = None

    pct_total_total: float | None = None
    pct_total_6_14: float | None = None
    pct_total_15_17: float | None = None
    pct_total_18_24: float | None = None
    pct_total_25_mais: float | None = None

    pct_branca_total: float | None = None
    pct_branca_6_14: float | None = None
    pct_branca_15_17: float | None = None
    pct_branca_18_24: float | None = None
    pct_branca_25_mais: float | None = None

    pct_preta_total: float | None = None
    pct_preta_6_14: float | None = None
    pct_preta_15_17: float | None = None
    pct_preta_18_24: float | None = None
    pct_preta_25_mais: float | None = None

    pct_amarela_total: float | None = None
    pct_amarela_6_14: float | None = None
    pct_amarela_15_17: float | None = None
    pct_amarela_18_24: float | None = None
    pct_amarela_25_mais: float | None = None

    pct_parda_total: float | None = None
    pct_parda_6_14: float | None = None
    pct_parda_15_17: float | None = None
    pct_parda_18_24: float | None = None
    pct_parda_25_mais: float | None = None

    pct_indigena_total: float | None = None
    pct_indigena_6_14: float | None = None
    pct_indigena_15_17: float | None = None
    pct_indigena_18_24: float | None = None
    pct_indigena_25_mais: float | None = None


class IBGEStudentAutismByRaceResponse(IBGEStudentAutismByRaceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
