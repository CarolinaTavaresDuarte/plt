import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Header, Footer } from "../components/LandingSections";

// Componente que exibirá os gráficos, tabelas, etc.
import DadosDashboard from "../components/DadosDashboard";
import { LoginModal } from "../components/LoginModal";

export default function Dados() {
  const { token, profile, setToken, setProfile } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
  };

  return (
    <>
      <Header
        onLoginClick={() => setShowLogin(true)}
        isAuthenticated={Boolean(token)}
        role={profile?.role}
        onLogout={handleLogout}
        activeSection="dados"
      />

      <main className="section">
        <div className="container">
          <DadosDashboard />
        </div>
      </main>

      <Footer />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
