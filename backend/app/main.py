from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routers import contact
from app.routers import ibge
from .config import get_settings
import app.database as db
from .routers import auth, platform, tests
import logging

logging.basicConfig(level=logging.DEBUG)


settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # libera qualquer origem para não falhar no deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db.init_engine()

    masked = settings.sqlalchemy_url.replace(settings.database_password, "******") if settings.database_password else settings.sqlalchemy_url
    # opcional: mascarar também user / db
    masked = masked.replace(settings.database_user, "u_******").replace(settings.database_name, "db_******")
    print(f"DB URL (masked): {masked}")

    engine_ok = False
    session_ok = False
    try:
        with db.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("startup_event: Engine OK")
        engine_ok = True
    except Exception as e:
        print("startup_event: Engine FAIL ->", repr(e))

    try:
        with db.SessionLocal() as s:
            s.execute(text("SELECT 1"))
        print("startup_event: SessionLocal OK")
        session_ok = True
    except Exception as e:
        print("startup_event: SessionLocal FAIL ->", repr(e))

    # Só cria tabelas se tudo estiver ok
    if engine_ok and session_ok:
        db.create_all()
    else:
        print("⚠️ Skipping create_all(): Engine or Session failed.")

app.include_router(contact.router, prefix="/api/v1/contact", tags=["Contato"])
app.include_router(auth.router)
app.include_router(platform.router)
app.include_router(tests.router)
app.include_router(ibge.router)

@app.get("/health")
def healthcheck():
    try:
        with db.SessionLocal() as s:
            s.execute(text("SELECT 1"))
        return {"status": "ok", "db": "up"}
    except Exception as exc:
        return {"status": "degraded", "db_error": str(exc)}
