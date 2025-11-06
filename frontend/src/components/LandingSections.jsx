import React from 'react';

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
    title: 'ASSQ e AQ-10',
    description:
      'Questionários para crianças, adolescentes e adultos, com perguntas de baixo estímulo visual.',
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

export const Header = ({ onLoginClick, isAuthenticated, onLogout, activeSection }) => (
  <header className="sticky-nav" id="inicio">
    <div className="container nav-bar">
      <a
        href="#inicio"
        style={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem',
        }}
      >
        <img
          src="/logo.png"
          alt="PLATAA"
          style={{ height: '32px' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        PLATAA
      </a>

      <nav>
        <ul className="nav-links">
          <li>
            <a href="#inicio" className={activeSection === 'inicio' ? 'active' : ''}>
              Início
            </a>
          </li>
          <li>
            <a href="#sobre" className={activeSection === 'sobre' ? 'active' : ''}>
              Sobre
            </a>
          </li>
          <li>
            <a href="#servicos" className={activeSection === 'servicos' ? 'active' : ''}>
              Serviços
            </a>
          </li>
          <li>
            <a href="#processo" className={activeSection === 'processo' ? 'active' : ''}>
              Como Funciona
            </a>
          </li>
          <li>
            <a href="#contato" className={activeSection === 'contato' ? 'active' : ''}>
              Contato
            </a>
          </li>

          {isAuthenticated ? (
            <>
              <li><a href="#dashboard">Dashboard</a></li>
              <li>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onLogout}
                  style={{ padding: '0.35rem 1rem' }}
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
                style={{ padding: '0.35rem 1rem' }}
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

export const Services = () => (
  <section className="section" id="servicos" style={{ backgroundColor: '#f8f9fa' }}>
    <div className="container">
      <h2 className="section-title">Triagem especializada</h2>
      <p className="section-subtitle">
        Cards interativos com os principais protocolos de triagem oferecidos pela PLATAA.
      </p>
      <div className="grid cards-grid">
        {services.map((service) => (
          <article key={service.title} className="card card--service">
            <div className="card-icon" aria-hidden="true">
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p style={{ margin: '1rem 0', lineHeight: 1.6 }}>{service.description}</p>
            <a className="btn btn-primary" href={service.href}>
              Saiba mais
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

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
