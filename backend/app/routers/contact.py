from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()
router = APIRouter()

class ContactForm(BaseModel):
    nome: str
    email: EmailStr
    mensagem: str


def send_email_background(to_email: str, subject: str, body: str):
    """Função síncrona simples pra enviar e-mail."""
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.smtp_user
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_pass)
            server.send_message(msg)
    except Exception as e:
        print("Erro ao enviar e-mail:", e)
        raise


@router.post("/send")
async def send_contact_message(form: ContactForm, background_tasks: BackgroundTasks):
    try:
        # E-mail para você (destino principal)
        body_admin = (
            f"Nova mensagem de contato recebida pelo site PLATAA:\n\n"
            f"Nome: {form.nome}\n"
            f"E-mail: {form.email}\n"
            f"Mensagem:\n{form.mensagem}\n"
        )
        background_tasks.add_task(
            send_email_background,
            settings.email_destino,
            f"[PLATAA] Nova mensagem de {form.nome}",
            body_admin,
        )

        # E-mail automático para o remetente (confirmação)
        body_user = (
            f"Olá {form.nome},\n\n"
            f"Recebemos sua mensagem e nossa equipe retornará em até 48 horas úteis.\n\n"
            f"Mensagem enviada:\n{form.mensagem}\n\n"
            f"Atenciosamente,\nEquipe PLATAA"
        )
        background_tasks.add_task(
            send_email_background,
            form.email,
            "[PLATAA] Confirmação de recebimento",
            body_user,
        )

        return {"status": "ok", "message": "E-mails agendados com sucesso."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar e-mail: {str(e)}")
