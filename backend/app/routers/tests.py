from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services import classify_orientation, compute_test_score

router = APIRouter(prefix="/api/v1/tests", tags=["tests"])

TESTE_FAIXAS = {
    "mchat": "16-30 meses",
    "assq": "6-17 anos",
    "aq10": "Adultos",
    "ados2": "Clinico",
    "adir": "Clinico",
}


@router.post(
    "/{cpf}/iniciar",
    response_model=schemas.TestSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_test(
    cpf: str,
    payload: schemas.TestResultCreate,
    db: Session = Depends(get_db),
    current_user: models.UserAccount = Depends(get_current_user),
):
    testado = db.query(models.TestedIndividual).filter(models.TestedIndividual.documento_cpf == cpf).first()
    if not testado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CPF não cadastrado para triagem")

    existing = (
        db.query(models.TestResult)
        .join(models.TestedIndividual)
        .filter(models.TestedIndividual.documento_cpf == cpf, models.TestResult.teste_tipo == payload.teste_tipo)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe teste para este CPF e tipo")

    score, classificacao = compute_test_score(payload.teste_tipo, payload.respostas)
    resultado = models.TestResult(
        testado_id=testado.id,
        usuario_id=current_user.id,
        teste_tipo=payload.teste_tipo,
        respostas=[item.model_dump() for item in payload.respostas],
        score=score,
        classificacao=classificacao,
        faixa_etaria=payload.faixa_etaria,
        regiao_geografica=payload.regiao_geografica,
        criado_em=datetime.utcnow(),
    )
    db.add(resultado)
    db.flush()

    if testado.consentimento_pesquisa:
        anonimizado = models.AnonymisedRecord(
            resultado_id=resultado.id,
            faixa_etaria=payload.faixa_etaria,
            regiao_geografica=payload.regiao_geografica,
            score=score,
            teste_tipo=payload.teste_tipo,
        )
        db.add(anonimizado)

    db.commit()
    db.refresh(resultado)

    orientacao = classify_orientation(classificacao, payload.teste_tipo)
    return schemas.TestSubmissionResponse(
        resultado=schemas.TestResultResponse(
            id=resultado.id,
            teste_tipo=resultado.teste_tipo,
            faixa_etaria=resultado.faixa_etaria,
            regiao_geografica=resultado.regiao_geografica,
            score=resultado.score,
            classificacao=resultado.classificacao,
            criado_em=resultado.criado_em,
            respostas=[schemas.TestResponseItem(**item) for item in resultado.respostas],
        ),
        mensagem_orientacao=orientacao,
    )


@router.post("/testados", response_model=schemas.TestedIndividualResponse, status_code=status.HTTP_201_CREATED)
def create_tested_individual(
    payload: schemas.TestedIndividualCreate,
    db: Session = Depends(get_db),
    current_user: models.UserAccount = Depends(get_current_user),
):
    if current_user.role not in {"responsavel", "especialista"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Perfil não autorizado")

    existing = db.query(models.TestedIndividual).filter(models.TestedIndividual.documento_cpf == payload.documento_cpf).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado")

    testado = models.TestedIndividual(**payload.model_dump(), responsavel_id=current_user.id if current_user.role == "responsavel" else None)
    db.add(testado)
    db.commit()
    db.refresh(testado)
    return testado


@router.get("/paciente/{cpf}", response_model=schemas.PatientDashboardResponse)
def get_patient_dashboard(
    cpf: str,
    db: Session = Depends(get_db),
    current_user: models.UserAccount = Depends(get_current_user),
):
    testado = db.query(models.TestedIndividual).filter(models.TestedIndividual.documento_cpf == cpf).first()
    if not testado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CPF não encontrado")

    if current_user.role == "responsavel" and testado.responsavel_id not in {None, current_user.id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito aos seus registros")

    cards: List[schemas.PatientDashboardCard] = []
    for resultado in testado.resultados:
        cards.append(
            schemas.PatientDashboardCard(
                teste_tipo=resultado.teste_tipo,
                data=resultado.criado_em,
                risco=resultado.classificacao,
            )
        )

    transparencia = [
        f"Idade: {resultado.faixa_etaria}",
        f"Região: {resultado.regiao_geografica}",
        f"Score: {resultado.score}",
    ] if testado.resultados else []

    return schemas.PatientDashboardResponse(
        cpf=testado.documento_cpf,
        cards=cards,
        transparencia_ibge=transparencia,
    )


@router.get("/responsavel/resultados", response_model=schemas.ResponsibleDashboardResponse)
def get_responsavel_results(
    db: Session = Depends(get_db),
    current_user: models.UserAccount = Depends(require_role("responsavel")),
):
    resultados = (
        db.query(models.TestResult)
        .join(models.TestResult.testado)
        .filter(models.TestResult.usuario_id == current_user.id)
        .order_by(models.TestResult.criado_em.desc())
        .all()
    )

    agrupado: dict[int, dict] = {}
    for resultado in resultados:
        testado = resultado.testado
        if not testado:
            continue
        grupo = agrupado.setdefault(
            testado.id,
            {
                "nome": testado.nome_completo,
                "cpf": testado.documento_cpf,
                "regiao_bairro": testado.regiao_bairro,
                "resultados": [],
            },
        )
        grupo["resultados"].append(
            {
                "teste_tipo": resultado.teste_tipo,
                "data": resultado.criado_em,
                "risco": resultado.classificacao,
                "score": resultado.score,
                "faixa_etaria": resultado.faixa_etaria,
                "regiao_geografica": resultado.regiao_geografica,
                "orientacao": classify_orientation(resultado.classificacao, resultado.teste_tipo),
            }
        )

    pacientes = [
        schemas.ResponsiblePatientResult(
            nome=valor["nome"],
            cpf=valor["cpf"],
            regiao_bairro=valor["regiao_bairro"],
            resultados=[
                schemas.ResponsibleTestResult(**res)
                for res in valor["resultados"]
            ],
        )
        for valor in agrupado.values()
    ]

    return schemas.ResponsibleDashboardResponse(pacientes=pacientes)


@router.get("/especialista/dashboard", response_model=schemas.SpecialistDashboardResponse)
def get_specialist_dashboard(
    db: Session = Depends(get_db),
    current_user: models.UserAccount = Depends(require_role("especialista")),
):
    resultados = db.query(models.TestResult).all()

    totais_por_risco: dict[str, int] = {}
    pacientes: List[schemas.SpecialistDashboardItem] = []
    for resultado in resultados:
        totais_por_risco[resultado.classificacao] = totais_por_risco.get(resultado.classificacao, 0) + 1
        pacientes.append(
            schemas.SpecialistDashboardItem(
                nome_completo=resultado.testado.nome_completo,
                faixa_etaria=resultado.faixa_etaria,
                regiao_bairro=resultado.testado.regiao_bairro,
                contato_principal=resultado.testado.contato_telefone,
                risco=resultado.classificacao,
                teste_tipo=resultado.teste_tipo,
                data=resultado.criado_em,
            )
        )

    return schemas.SpecialistDashboardResponse(totais_por_risco=totais_por_risco, pacientes=pacientes)
