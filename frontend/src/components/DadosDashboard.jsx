import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi"; 
import BrazilMapD3 from './BrazilMapD3'; 

export default function DadosDashboard() {
  // Agora a desestruturação { get } funciona porque atualizamos o hook
  const { get } = useApi(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inicializa como arrays vazios para evitar erros de leitura
  const [geoData, setGeoData] = useState([]); 
  const [ibgeData, setIbgeData] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. BUSCA DADOS DA SUA API
        // O hook atualizado já retorna os dados limpos (response.data)
        const ibgeDataRaw = await get("/api/v1/ibge/autism-indigenous");
        
        // Garante que seja um array
        const dataArray = Array.isArray(ibgeDataRaw) ? ibgeDataRaw : (ibgeDataRaw.data || []);
        setIbgeData(dataArray); 

        // 2. BUSCA O MAPA DO BRASIL (GeoJSON Online)
        const geoResponse = await fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson');
        
        if (!geoResponse.ok) {
            throw new Error(`Falha ao baixar o mapa: ${geoResponse.statusText}`);
        }
        
        const mapJson = await geoResponse.json();
        
        if (mapJson && mapJson.features) {
            setGeoData(mapJson.features); 
        } else {
            throw new Error("Formato do GeoJSON inválido.");
        }

      } catch (e) {
        console.error("Erro no Dashboard:", e);
        setError("Não foi possível carregar os dados. Verifique se o backend está rodando.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [get]); 

  if (loading) {
      return (
          <div className="dashboard-content">
              <h2>Dashboard de Dados do IBGE</h2>
              <p>Carregando visualizações...</p>
          </div>
      );
  }
  
  if (error) {
      return (
          <div className="dashboard-content">
              <h2>Dashboard de Dados do IBGE</h2>
              <h3 style={{ color: 'red' }}>Erro: {error}</h3>
          </div>
      );
  }
  
  return (
    <div className="dashboard-content">
      <h2>Dashboard de Dados do IBGE</h2>
      
      {/* Renderiza o mapa apenas se tiver dados geográficos */}
      {geoData.length > 0 ? (
        <BrazilMapD3 ibgeData={ibgeData} geoData={geoData} />
      ) : (
        <p>Aguardando dados do mapa...</p>
      )}
      
    </div>
  );
}