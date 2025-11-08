import React, { useEffect, useMemo, useState } from 'react';
import { Header, Hero, Institutional, Services, Process, Footer } from '../components/LandingSections';
import { ContactSection } from '../components/ContactSection';
import { useMutation } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { LoginModal } from '../components/LoginModal';
import { TestWizard } from '../components/TestWizard';
import { PatientDashboard, SpecialistDashboard } from '../components/Dashboards';

// const DashboardArea = ({ cpf, role }) => (
//   <div id="dashboard">
//     {role === 'responsavel' && <PatientDashboard cpf={cpf} />}
//     {role === 'especialista' && <SpecialistDashboard />}
//   </div>
// );

const AppContent = () => {
  const { token, profile, setToken, setProfile } = useAuth();
  const api = useApi();
  const [showLogin, setShowLogin] = useState(false);
  const [cpfSelecionado, setCpfSelecionado] = useState('');
  const [testFlowActive, setTestFlowActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testadoForm, setTestadoForm] = useState({
    nome_completo: '',
    documento_cpf: '',
    regiao_bairro: '',
    contato_telefone: '',
    contato_email: '',
    consentimento_pesquisa: false
  });

  const [activeSection, setActiveSection] = useState('inicio');

  const isAuthenticated = Boolean(token);

  // AppContent (dentro do componente)
  const educationalLinks = useMemo(() => ([
    {
      label: 'Guia TEA Ministério da Saúde',
      href: 'https://www.gov.br/saude/pt-br/assuntos/autismo',
      icon: '📘',
      desc: 'Materiais oficiais do Ministério da Saúde sobre TEA: diretrizes, direitos e orientações práticas para familiares e profissionais.'
    },
    {
      label: 'ADOS-2 - Pearson',
      href: 'https://www.bloomy.com.br/blog/ados-2',
      icon: '📘',
      desc: 'Protocolo observacional ADOS-2: módulos, faixas etárias, aplicação clínica e interpretação dos resultados.'
    },
    {
      label: 'ADI-R - WPS',
      href: 'https://genialcare.com.br/blog/entrevista-diagnostica-estruturada-adi-r/?nab=0',
      icon: '📘',
      desc: 'Entrevista diagnóstica estruturada ADI-R: estrutura, domínios avaliados e quando utilizar em conjunto com o ADOS-2.'
    }
  ]), []);

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
  };

  const handleStartTest = () => {
    if (!cpfSelecionado) return;
    setTestFlowActive(true);
    setTestResult(null);
  };

  const handleTestFinish = (result) => {
    setTestResult(result);
    setTestFlowActive(false);
  };

  const registerTestado = useMutation({
    mutationFn: async () => {
      await api.post('/api/v1/tests/testados', {
        ...testadoForm,
        consentimento_pesquisa: Boolean(testadoForm.consentimento_pesquisa)
      });
    },
    onSuccess: () => {
      setCpfSelecionado(testadoForm.documento_cpf);
    }
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

  useEffect(() => {
    registerTestado.reset();
  }, [testadoForm.documento_cpf]);

  // Observe sections to update active nav link
  useEffect(() => {
    const targets = [
      { id: 'hero', key: 'inicio' },
      { id: 'sobre', key: 'sobre' },
      { id: 'servicos', key: 'servicos' },
      { id: 'processo', key: 'processo' },
      { id: 'contato', key: 'contato' },
    ];

    const elements = targets
      .map((t) => ({ ...t, el: document.getElementById(t.id) }))
      .filter((t) => t.el);

    if (!elements.length) return;

    let current = 'inicio';
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const match = elements.find((e) => e.el === visible.target);
          const next = match?.key || 'inicio';
          if (next !== current) {
            current = next;
            setActiveSection(next);
          }
        }
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.25, 0.5, 0.75] }
    );

    elements.forEach(({ el }) => observer.observe(el));
    setActiveSection('inicio');

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <Header
        onLoginClick={() => setShowLogin(true)}
        isAuthenticated={isAuthenticated}
        role={profile?.role}
        onLogout={handleLogout}
        activeSection={activeSection}
      />
      <Hero />
      <section className="section" id="educacao">
      <div className="container">
        <h2 className="section-title">Conteúdos educativos</h2>
        <p className="section-subtitle">
          Estudos, artigos e protocolos de referência mundial sobre TEA.
        </p>

        <div className="resources-grid">
          {educationalLinks.map((item) => (
            <article key={item.href} className="card resource-card">
              <div className="resource-head">
                <div className="resource-icon">{item.icon}</div>
                <h3>{item.label}</h3>
              </div>

              {/* Cada card com seu próprio texto */}
              <p>{item.desc}</p>

              <a className="btn btn-primary" href={item.href} target="_blank" rel="noreferrer">
                Acessar recurso
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>

      <Institutional />
      <Services />
      <Process />

      {isAuthenticated && profile?.role === 'responsavel' && (
        <section className="section" id="testes">
          <div className="container">
            <h2 className="section-title">Triagens disponíveis</h2>
            <p className="section-subtitle">Selecione o CPF do avaliado e escolha um dos protocolos M-CHAT-R/F, ASSQ ou AQ-10.</p>
            <div className="card" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <h3>Cadastro do avaliado</h3>
              <p style={{ lineHeight: 1.6 }}>
                Preencha os dados do avaliado antes de iniciar a triagem. O CPF é usado para garantir a regra de unicidade por teste.
              </p>
              <div className="grid" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="form-group">
                  <label htmlFor="nome-completo">Nome completo</label>
                  <input id="nome-completo" type="text" value={testadoForm.nome_completo} onChange={(event) => setTestadoForm((prev) => ({ ...prev, nome_completo: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="cpf-form">CPF</label>
                  <input id="cpf-form" type="text" value={testadoForm.documento_cpf} onChange={(event) => {
                    const value = event.target.value;
                    setTestadoForm((prev) => ({ ...prev, documento_cpf: value }));
                    setCpfSelecionado(value);
                  }} />
                </div>
                <div className="form-group">
                  <label htmlFor="bairro">Região/Bairro</label>
                  <input id="bairro" type="text" value={testadoForm.regiao_bairro} onChange={(event) => setTestadoForm((prev) => ({ ...prev, regiao_bairro: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input id="telefone" type="tel" value={testadoForm.contato_telefone} onChange={(event) => setTestadoForm((prev) => ({ ...prev, contato_telefone: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="email-contato">E-mail</label>
                  <input id="email-contato" type="email" value={testadoForm.contato_email} onChange={(event) => setTestadoForm((prev) => ({ ...prev, contato_email: event.target.value }))} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={testadoForm.consentimento_pesquisa} onChange={(event) => setTestadoForm((prev) => ({ ...prev, consentimento_pesquisa: event.target.checked }))} />
                Autorizo o uso anonimizado dos dados para pesquisa.
              </label>
              <button className="btn btn-outline" type="button" onClick={() => registerTestado.mutate()} disabled={registerTestado.isLoading || !formComplete}>
                {registerTestado.isLoading ? 'Salvando...' : formComplete ? 'Salvar dados do avaliado' : 'Preencha todos os campos'}
              </button>
              {registerTestado.isSuccess && <div className="alert alert-success">Cadastro realizado com sucesso!</div>}
              {registerTestado.isError && <div className="alert alert-error">Não foi possível cadastrar este CPF.</div>}
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="cpf-testado">CPF do avaliado</label>
                <input id="cpf-testado" type="text" value={cpfSelecionado} onChange={(event) => setCpfSelecionado(event.target.value)} placeholder="000.000.000-00" />
              </div>
              <button className="btn btn-primary" type="button" onClick={handleStartTest} disabled={!cpfSelecionado}>
                Iniciar triagem
              </button>
              {testResult && (
                <div className="alert alert-success">
                  Resultado registrado! Classificação: {testResult.classificacao} • Pontuação: {testResult.score}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {testFlowActive && <TestWizard cpf={cpfSelecionado} onClose={handleTestFinish} />}

      <ContactSection />
      <Footer />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default function App() {
  return <AppContent />;
}

