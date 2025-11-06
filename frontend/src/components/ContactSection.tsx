import React, { useState } from "react";

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  type Status = "idle" | "sending" | "ok" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");


  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // evita navegar para /platform/... (404 do Vite)
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());

      setStatus("ok");
      setForm({ nome: "", email: "", mensagem: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Falha ao enviar a mensagem.");
    }
  };

  return (
    <section className="section" id="contato">
      <div className="container">
        <h2 className="section-title">Entre em contato</h2>
        <p className="section-subtitle">Nossa equipe retorna em até 48 horas úteis.</p>

        <form className="card" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label>Mensagem</label>
            <textarea name="mensagem" rows={6} value={form.mensagem} onChange={onChange} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando..." : "Enviar mensagem"}
          </button>

          {status === "ok" && (
            <div className="alert alert-success">
              Mensagem enviada! Você receberá um e-mail de confirmação.
            </div>
          )}
          {status === "error" && <div className="alert alert-error">{errorMsg || "Não foi possível enviar sua mensagem agora."}</div>}
        </form>
      </div>
    </section>
  );
};
