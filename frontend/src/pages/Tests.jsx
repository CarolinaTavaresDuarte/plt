import React, { useMemo, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { Header, Footer } from "../components/LandingSections";
import { TestWizard } from "../components/TestWizard";

export default function Tests() {
  const { token, profile, setToken, setProfile } = useAuth();
  const api = useApi();

  // proteção de rota: só responsável logado
  if (!token) return <Navigate to="/" replace />;
  if (profile?.role !== "responsavel") return <Navigate to="/" replace />;

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
  };

  // === estado que estava no App ===
  const [cpfSelecionado, setCpfSelecionado] = useState("");
  const [testFlowActive, setTestFlowActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testadoForm, setTestadoForm] = useState({
    nome_completo: "",
    documento_cpf: "",
    regiao_bairro: "",
    contato_telefone: "",
    contato_email: "",
    consentimento_pesquisa: false,
  });

  const formComplete = useMemo(
    () =>
      Boolean(
        testadoForm.nome_completo &&
          testadoForm.documento_cpf &&
          testadoForm.regiao_bairro &&
          testadoForm.contato_telefone &&
          testadoForm.contato_email
      ),
    [testadoForm]
  );

  const registerTestado = useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/tests/testados", {
        ...testadoForm,
        consentimento_pesquisa: Boolean(testadoForm.consentimento_pesquisa),
      });
    },
    onSuccess: () => {
      setCpfSelecionado(testadoForm.documento_cpf);
    },
  });

  useEffect(() => {
    registerTestado.reset();
  }, [testadoForm.documento_cpf]);

  const handleStartTest = () => {
    if (!cpfSelecionado) return;
    setTestFlowActive(true);
    setTestResult(null);
  };

  const handleTestFinish = (result) => {
    setTestResult(result);
    setTestFlowActive(false);
  };

  return (
    <>
      {/* activeSection="triagens" evita highlights das âncoras da landing */}
      <Header
        onLoginClick={() => {}}
        isAuthenticated
        role={profile?.role}
        onLogout={handleLogout}
        activeSection="triagens"
      />

      <main className="section">
        <div className="container">
          <h2 className="section-title">Triagens disponíveis</h2>
          <p className="section-subtitle">
            Selecione o CPF do avaliado e escolha um dos protocolos M-CHAT-R/F, ASSQ ou AQ-10.
          </p>

          {/* Card: cadastro do avaliado */}
          <div className="card" style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
            <h3>Cadastro do avaliado</h3>
            <p style={{ lineHeight: 1.6 }}>
              Preencha os dados do avaliado antes de iniciar a triagem. O CPF é usado para garantir a
              regra de unicidade por teste.
            </p>

            <div
              className="grid"
              style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
            >
              <div className="form-group">
                <label htmlFor="nome-completo">Nome completo</label>
                <input
                  id="nome-completo"
                  type="text"
                  value={testadoForm.nome_completo}
                  onChange={(e) =>
                    setTestadoForm((p) => ({ ...p, nome_completo: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="cpf-form">CPF</label>
                <input
                  id="cpf-form"
                  type="text"
                  value={testadoForm.documento_cpf}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTestadoForm((p) => ({ ...p, documento_cpf: value }));
                    setCpfSelecionado(value);
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bairro">Região/Bairro</label>
                <input
                  id="bairro"
                  type="text"
                  value={testadoForm.regiao_bairro}
                  onChange={(e) => setTestadoForm((p) => ({ ...p, regiao_bairro: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  value={testadoForm.contato_telefone}
                  onChange={(e) =>
                    setTestadoForm((p) => ({ ...p, contato_telefone: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-contato">E-mail</label>
                <input
                  id="email-contato"
                  type="email"
                  value={testadoForm.contato_email}
                  onChange={(e) =>
                    setTestadoForm((p) => ({ ...p, contato_email: e.target.value }))
                  }
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <input
                type="checkbox"
                checked={testadoForm.consentimento_pesquisa}
                onChange={(e) =>
                  setTestadoForm((p) => ({ ...p, consentimento_pesquisa: e.target.checked }))
                }
              />
              Autorizo o uso anonimizado dos dados para pesquisa.
            </label>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => registerTestado.mutate()}
              disabled={registerTestado.isLoading || !formComplete}
            >
              {registerTestado.isLoading
                ? "Salvando..."
                : formComplete
                ? "Salvar dados do avaliado"
                : "Preencha todos os campos"}
            </button>

            {registerTestado.isSuccess && (
              <div className="alert alert-success">Cadastro realizado com sucesso!</div>
            )}
            {registerTestado.isError && (
              <div className="alert alert-error">Não foi possível cadastrar este CPF.</div>
            )}
          </div>

          {/* Card: selecionar cpf e iniciar */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="cpf-testado">CPF do avaliado</label>
              <input
                id="cpf-testado"
                type="text"
                value={cpfSelecionado}
                onChange={(e) => setCpfSelecionado(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={handleStartTest}
              disabled={!cpfSelecionado}
            >
              Iniciar triagem
            </button>

            {testResult && (
              <div className="alert alert-success">
                Resultado registrado! Classificação: {testResult.classificacao} • Pontuação:{" "}
                {testResult.score}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* wizard (modal) */}
      {testFlowActive && <TestWizard cpf={cpfSelecionado} onClose={handleTestFinish} />}

      <Footer />
    </>
  );
}
