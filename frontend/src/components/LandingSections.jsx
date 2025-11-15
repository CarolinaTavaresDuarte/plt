import { NavLink, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

const services = [
  {
    icon: '🧩',
    title: 'M-CHAT-R/F',
    description:
      'Triagem para crianças de 16 a 30 meses focada em atenção conjunta, linguagem e comportamentos motores.',
    href: '/services/test/mchat',
  },
  {
    icon: '📋',
    title: 'ASSQ (6 a 17 anos)',
    description:
      'Questionário de triagem para crianças e adolescentes, com perguntas simples e de baixo estímulo visual voltadas a comportamento social e comunicação.',
    href: '/services/test/assq',
  },
  {
    icon: '🩺',
    title: 'ADOS-2 e ADI-R',
    description:
      'Protocolos observacionais e entrevistas estruturadas para profissionais de saúde e análise de resultados.',
    href: '/services/test/ados-2',
  },
];

const processSteps = [
  {
    icon: '1',
    title: 'Cadastro seguro',
    description:
      'Escolha seu perfil, crie sua conta e acesse conteúdos educativos personalizados.',
  },
  {
    icon: '2',
    title: 'Triagem guiada',
    description:
      'Escolha o teste adequado e responda perguntas com foco e acessibilidade.',
  },
  {
    icon: '3',
    title: 'Resultados claros',
    description:
      'Receba orientações automáticas, classificações de risco e próximos passos.',
  },
  {
    icon: '4',
    title: 'Acompanhamento contínuo',
    description:
      'O sistema gera dashboards e exporta dados anonimizados para pesquisa, garantindo um acompanhamento seguro.',
  },
];

export const Header = ({ onLoginClick, isAuthenticated, onLogout, activeSection, role }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  // rolar até uma seção da landing (ou navegar pra home e rolar)
  const goTo = (sectionId) => (e) => {
    e.preventDefault();
    const isHome = window.location.pathname === "/";

    const scrollTo = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (isHome) {
      scrollTo();
    } else {
      navigate("/", { replace: false });
      // espera o paint da home para rolar
      setTimeout(scrollTo, 0);
    }
  };

  return (
    <header className="sticky-nav" id="inicio">
      <div className="container nav-bar">
        {/* Logo sempre volta pra home */}
        <NavLink
          to="/"
          end
          style={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <img
            src="/logo.png"
            alt="PLATAA"
            style={{ height: "32px" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          PLATAA
        </NavLink>

        <nav>
          <ul className="nav-links">
            {/* Home (rota) */}
            <li>
              {isHome ? (
                <a
                  href="#hero"
                  onClick={goTo("hero")}
                  className={activeSection === "inicio" ? "active" : ""}
                >
                  Início
                </a>
              ) : (
                <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                  Início
                </NavLink>
              )}
            </li>

            {/* Seções da landing: viram botões que chamam goTo() */}
            <li>
              <a href="#sobre" onClick={goTo("sobre")}
                 className={activeSection === "sobre" ? "active" : ""}>
                Sobre
              </a>
            </li>
            <li>
              <a href="#servicos" onClick={goTo("servicos")}
                 className={activeSection === "servicos" ? "active" : ""}>
                Serviços
              </a>
            </li>
            <li>
              <a href="#processo" onClick={goTo("processo")}
                 className={activeSection === "processo" ? "active" : ""}>
                Como Funciona
              </a>
            </li>
            <li>
              <a href="#contato" onClick={goTo("contato")}
                 className={activeSection === "contato" ? "active" : ""}>
                Contato
              </a>
            </li>

            {/* separador visual entre âncoras e rotas */}
            <li className="nav-sep" aria-hidden="true" />

            {/* Novo botão Dados*/}
            <li>
              <NavLink
                to="/dados"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Dados
              </NavLink>
            </li>

            {/* separador visual entre Dados e Entrar */}
            <li className="nav-sep" aria-hidden="true" />

            {isAuthenticated ? (
              <>
                {/* Triagens: só para responsável */}
                {role === "responsavel" && (
                  <li>
                    <NavLink to="/triagens" className={({ isActive }) => (isActive ? "active" : "")}>
                      Triagens
                    </NavLink>
                  </li>
                )}

                {/* Dashboard: para qualquer perfil logado */}
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onLogout}
                    style={{ padding: "0.35rem 1rem" }}
                  >
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onLoginClick}
                  style={{ padding: "0.35rem 1rem" }}
                >
                  Entrar
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
export const Hero = () => (
  <section
    id="hero"
    className="hero"
    style={{
      position: 'relative',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1rem',
      // ✅ Escurece o fundo sem afetar o texto:
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/fundo.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div
      className="container"
      style={{
        maxWidth: '900px',
        color: '#fff',
        textShadow: '0 3px 10px rgba(0,0,0,0.6)',
        // ✅ garante que nada fique semitransparente
        opacity: 1,
      }}
    >
      <h1
        style={{
          color: '#fff',
          opacity: 1,
          fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
          fontWeight: 800,
          marginBottom: '1.5rem',
          lineHeight: 1.2,
        }}
      >
        PLATAA – Plataforma de Triagem e Atendimento ao Autista
      </h1>

      <p
        style={{
          color: '#fff',
          opacity: 1,
          fontSize: '1.25rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        Um ecossistema completo para responsáveis e especialistas acompanharem sinais
        do Transtorno do Espectro Autista com acolhimento, ciência e tecnologia.
      </p>

      <a
        href="#servicos"
        className="btn btn-primary"
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '0.9rem 1.8rem',
          borderRadius: '999px',
          fontWeight: 600,
          boxShadow: '0 8px 25px rgba(0,123,255,0.35)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,123,255,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,123,255,0.35)';
        }}
      >
        Ver serviços
      </a>
    </div>
  </section>
);


export const Institutional = () => (
  <section className="section" id="sobre">
    <div className="container">
      <div className="institutional-card">
        {/* Texto (esquerda) */}
        <div className="institutional-copy">
          <h2 className="section-title">PLATAA: inclusão e apoio</h2>

          <p className="institutional-p">
            A PLATAA é a sua aliada digital na jornada do Transtorno do Espectro Autista (TEA).
            Nosso propósito é simplificar a triagem primária e promover o acompanhamento contínuo
            com a máxima precisão.
          </p>

          <p className="institutional-p">
            Oferecemos uma plataforma segura, baseada em protocolos clínicos de triagem (como o
            M-CHAT-R/F), fornecendo recursos educativos detalhados sobre o TEA e orientações sobre
            a importância de protocolos avançados (como ADOS-2 e ADI-R) na busca por especialistas.
            Junte-se a nós na missão de um diagnóstico precoce e um suporte eficaz.
          </p>

          <a href="#contato" className="btn btn-outline">Fale conosco</a>
        </div>

        {/* Imagem (direita) */}
        <figure className="institutional-figure">
          <img
            src="/logo.jpg"         // arquivo em frontend/public/logo.jpg
            alt="Logo PLATAA"
            className="institutional-logo"
            loading="lazy"
          />
        </figure>
      </div>
    </div>
  </section>
);


const TEST_INFO = {
  mchat: {
    title: "🧩 M-CHAT-R/F (16 a 30 meses)",
    body: (
      <>
        <p>
          O <strong>M-CHAT-R/F</strong> é um questionário de triagem precoce
          desenvolvido para identificar sinais de risco para TEA em crianças de
          16 a 30 meses. Ajuda pais/cuidadores a observar atenção conjunta,
          contato visual, linguagem e comportamentos motores.
        </p>
        <h4 className="mt-2">Como funciona</h4>
        <ul>
          <li>O responsável responde a perguntas simples sobre a criança.</li>
          <li>O resultado indica baixo, médio ou alto risco de TEA.</li>
          <li>
            Em risco elevado, recomenda-se buscar avaliação com profissional de
            saúde/desenvolvimento infantil.
          </li>
        </ul>
        <p className="mt-2">
          <em>
            Importante: o M-CHAT-R/F não define diagnóstico, mas é uma
            ferramenta validada cientificamente para identificação precoce e
            encaminhamento.
          </em>
        </p>
        <p className="text-sm opacity-80 mt-2">
          🔗 Fonte: Robins, Fein &amp; Barton, 2009 — M-CHAT-R/F.
        </p>
      </>
    ),
  },
  assq: {
    title: "📋 ASSQ (6 a 17 anos)",
    body: (
      <>
        <p>
          O <strong>ASSQ</strong> é um instrumento de triagem para crianças e
          adolescentes com dificuldades sociais, de comunicação ou comportamentos
          repetitivos. Útil especialmente em casos de autismo leve/alto
          funcionamento.
        </p>
        <h4 className="mt-2">Como funciona</h4>
        <ul>
          <li>27 perguntas sobre relações sociais, linguagem e interesses.</li>
          <li>Pode ser preenchido por pais, professores ou cuidadores.</li>
          <li>
            O resultado indica se há indícios que justificam avaliação
            profissional.
          </li>
        </ul>
        <p className="mt-2">
          <em>
            Importante: é um rastreio, não um diagnóstico. Orienta famílias e
            escolas sobre a necessidade de acompanhamento clínico.
          </em>
        </p>
        <p className="text-sm opacity-80 mt-2">
          🔗 Fonte: Ehlers et al., 1999 — ASSQ.
        </p>
      </>
    ),
  },
  aq10: {
    title: "🧠 AQ-10 (Adultos)",
    body: (
      <>
        <p>
          O <strong>AQ-10</strong> é uma versão curta do Autism-Spectrum
          Quotient para triagem rápida de <em>traços autísticos</em> em adultos,
          especialmente com linguagem preservada e boa adaptação social.
        </p>
        <h4 className="mt-2">Como funciona</h4>
        <ul>
          <li>10 perguntas objetivas (interesse social, empatia, rotina etc.).</li>
          <li>
            Indica se há características que merecem avaliação mais aprofundada.
          </li>
        </ul>
        <p className="mt-2">
          <em>
            Importante: não substitui consulta diagnóstica; é um primeiro passo
            para autoconhecimento e encaminhamento adequado.
          </em>
        </p>
        <p className="text-sm opacity-80 mt-2">
          🔗 Fonte: Allison et al., 2012 — AQ-10.
        </p>
      </>
    ),
  },
};

export const Services = () => {
  const [openKey, setOpenKey] = useState(null);

  // fecha com Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="section" id="servicos">
      <div className="container">
        <h2 className="section-title">Triagem especializada</h2>
        <p className="section-subtitle">
          Cards interativos com os principais protocolos de triagem oferecidos
          pela PLATAA.
        </p>

        <div className="grid cards-grid">
          {/* M-CHAT-R/F */}
          <article className="card card--service">
            <div className="card-icon">🧩</div>
            <h3>M-CHAT-R/F</h3>
            <p>
              Triagem para crianças de 16 a 30 meses focada em atenção conjunta,
              linguagem e comportamentos motores.
            </p>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setOpenKey("mchat")}
              >
                Saiba mais
              </button>
            </div>
          </article>

          {/* ASSQ */}
          <article className="card card--service">
            <div className="card-icon">📋</div>
            <h3>ASSQ</h3>
            <p>
              Questionário de triagem para crianças e adolescentes, voltadas a comportamento social e comunicação.
            </p>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setOpenKey("assq")}
              >
                Saiba mais
              </button>
            </div>
          </article>

          {/* AQ-10 (Adultos) - agora só informativo que o foco são os 3 triagens */}
          <article className="card card--service">
            <div className="card-icon">🧠</div>
            <h3>AQ-10</h3>
            <p>
              Versão curta do Autism-Spectrum Quotient para triagem de traços
              autísticos em adultos.
            </p>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setOpenKey("aq10")}
              >
                Saiba mais
              </button>
            </div>
          </article>
        </div>
      </div>

      <InfoModal
        isOpen={Boolean(openKey)}
        title={openKey ? TEST_INFO[openKey].title : ""}
        onClose={() => setOpenKey(null)}
      >
        {openKey ? TEST_INFO[openKey].body : null}
      </InfoModal>
    </section>
  );
};

const InfoModal = ({ isOpen, title, children, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalId = "info-modal-title";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      className="ui-modal"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="ui-modal__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="ui-modal__card" role="document">
        <header className="ui-modal__header">
          <h3 id={modalId} className="ui-modal__title">
            {title}
          </h3>
        </header>

        <div className="ui-modal__body prose">{children}</div>

        <footer className="ui-modal__footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
};

export const Process = () => (
  <section className="section" id="processo">
    <div className="container">
      <h2 className="section-title">Triagem e atendimento</h2>
      <p className="section-subtitle">
        Acompanhe as etapas para responsáveis, especialistas e pesquisadores.
      </p>
      <div className="grid process-grid">
        {processSteps.map((step) => (
          <article key={step.title} className="card card--service">
            <div className="card-icon" aria-hidden="true">
              {step.icon}
            </div>
            <h3>{step.title}</h3>
            <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>{step.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const ContactSection = () => (
  <section className="section" id="contato">
    <div className="container">
      <h2 className="section-title">Entre em contato</h2>
      <p className="section-subtitle">Nossa equipe retorna em até 48 horas úteis.</p>
      <form
        className="card"
        style={{ maxWidth: '640px', margin: '0 auto' }}
        action="/api/v1/platform/contact/submit"
        method="post"
      >
        <div className="form-group">
          <label htmlFor="contato-nome">Nome</label>
          <input id="contato-nome" name="nome" type="text" required />
        </div>
        <div className="form-group">
          <label htmlFor="contato-email">E-mail</label>
          <input id="contato-email" name="email" type="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="contato-mensagem">Mensagem</label>
          <textarea
            id="contato-mensagem"
            name="mensagem"
            rows="4"
            style={{
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              padding: '0.75rem',
            }}
            required
          ></textarea>
        </div>
        <button className="btn btn-primary" type="submit">
          Enviar mensagem
        </button>
      </form>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="footer">
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>© 2024 PLATAA. Plataforma de triagem e atendimento ao autista.</p>
      <a href="https://plataa.example.com/politica" target="_blank" rel="noreferrer">
        Política de privacidade
      </a>
    </div>
  </footer>
);
