from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routers import contact
from .config import get_settings
import app.database as db
from .routers import auth, platform, tests

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

    try:
        with db.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("startup_event: Engine OK")
    except Exception as e:
        print("startup_event: Engine FAIL ->", repr(e))

    try:
        with db.SessionLocal() as s:
            s.execute(text("SELECT 1"))
        print("startup_event: SessionLocal OK")
    except Exception as e:
        print("startup_event: SessionLocal FAIL ->", repr(e))

    db.create_all()

app.include_router(contact.router, prefix="/api/v1/contact", tags=["Contato"])
app.include_router(auth.router)
app.include_router(platform.router)
app.include_router(tests.router)

@app.get("/health")
def healthcheck():
    try:
        with db.SessionLocal() as s:
            s.execute(text("SELECT 1"))
        return {"status": "ok", "db": "up"}
    except Exception as exc:
        return {"status": "degraded", "db_error": str(exc)}
