import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header, Footer } from "../components/LandingSections";
import { PatientDashboard, SpecialistDashboard } from "../components/Dashboards";

export default function Dashboard() {
  const { token, profile, setToken, setProfile } = useAuth();
  if (!token) return <Navigate to="/" replace />;

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
  };

  return (
    <>
      <Header
        onLoginClick={() => {}}
        isAuthenticated={Boolean(token)}
        role={profile?.role}
        onLogout={handleLogout}
        activeSection="dashboard"
      />
      <main className="section">
        <div className="container">
          {profile?.role === "especialista" && <SpecialistDashboard />}
          {profile?.role === "responsavel" && <PatientDashboard />}
        </div>
      </main>
      <Footer />
    </>
  );
}
