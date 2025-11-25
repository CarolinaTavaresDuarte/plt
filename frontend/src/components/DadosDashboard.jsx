import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi"; 
import BrazilMapD3 from './BrazilMapD3'; 
import GenderPieChart from './GenderPieChart';

// Componente para exibir os totais em destaque
const TotalKpiCard = ({ title, value, unit, color }) => (
    <div style={{ 
        flex: '1', 
        minWidth: '150px', 
        padding: '20px', 
        backgroundColor: color, 
        color: '#fff', 
        borderRadius: '8px', 
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
        <p style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>{title}</p>
        <h3 style={{ fontSize: '24px', margin: 0, fontWeight: 700 }}>{value}</h3>
        <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>{unit}</p>
    </div>
);


export default function DadosDashboard() {
  const { get } = useApi(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [geoData, setGeoData] = useState([]); 
  const [ibgeData, setIbgeData] = useState([]); // Dados de Região/UF
  const [brasilData, setBrasilData] = useState(null); // Dados totais do Brasil
  const [genderData, setGenderData] = useState({ male_percentage: 0, female_percentage: 0 }); // Dados de gênero
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. BUSCA DADOS DA SUA API
        const ibgeDataRaw = await get("/api/v1/ibge/autism-indigenous");
        const dataArray = Array.isArray(ibgeDataRaw) ? ibgeDataRaw : (ibgeDataRaw.data || []);
        
        // --- PROCESSO DE FILTRAGEM E ISOLAMENTO DOS DADOS TOTAIS ---
        
        // Isola a linha "Brasil" para o card de total
        const totalBrasil = dataArray.find(item => item.location === "Brasil");
        setBrasilData(totalBrasil);
        
        // Filtra a linha "Brasil" e as Regiões (Norte, Nordeste, etc.) da tabela e mapa
        const filteredForMapAndTable = dataArray.filter(item => 
            !["Brasil", "Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"].includes(item.location)
        );

        setIbgeData(filteredForMapAndTable); 
        
        // 2. BUSCA OS DADOS DE GÊNERO
        const genderDataRaw = await get("/api/v1/ibge/resident_gender_distribution");
        console.log(genderDataRaw.data);  // Verifique os dados retornados
        setGenderData(genderDataRaw.data); // Armazena os dados de gênero

        // 3. BUSCA O MAPA DO BRASIL (GeoJSON LOCAL)
        const geoResponse = await fetch('/brazil-states.geojson');

        if (!geoResponse.ok) {
            throw new Error(`Falha ao baixar o mapa: ${geoResponse.statusText}`);
        }

        const mapJson = await geoResponse.json();

        if (mapJson && mapJson.features) {
            setGeoData(mapJson.features);
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

  // --- LÓGICA DE FILTRO ---
  const filteredData = ibgeData.filter(item => 
    item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="container section"><p>Carregando visualizações...</p></div>;
  if (error) return <div className="container section"><h3 style={{ color: 'red' }}>{error}</h3></div>;
  
  // Dados formatados do Brasil para o Card
  const totalPop = brasilData?.indigenous_population?.toLocaleString() || 'N/D';
  const totalCasos = brasilData?.autism_count?.toLocaleString() || 'N/D';
  const totalPercentual = brasilData?.autism_percentage?.toFixed(2) || 'N/D';

  return (
    <div className="container section">
      <h2>Dashboard de Dados do IBGE</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
          Análise do autismo na população indígena por Unidade Federativa.
      </p>
      
      {/*Totais em destaque*/}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <TotalKpiCard 
              title="População Indígena Total" 
              value={totalPop} 
              unit="Pessoas" 
              color="#007bff"
          />
          <TotalKpiCard 
              title="Casos Diagnosticados (TEA)" 
              value={totalCasos} 
              unit="Casos" 
              color="#28a745"
          />
          <TotalKpiCard 
              title="Total Percentual (%)" 
              value={`${totalPercentual}%`} 
              unit="do total da Pop. Indígena" 
              color="#ffc107"
          />
      </div>

      {/* LAYOUT FLEXBOX */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* ESQUERDA: O Mapa */}
        <div style={{ flex: '2', minWidth: '400px', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
           {geoData.length > 0 ? (
            <BrazilMapD3 ibgeData={ibgeData} geoData={geoData} />
          ) : (
            <p>Carregando mapa...</p>
          )}
        </div>

        {/* DIREITA: Painel de Busca e Tabela */}
        <div style={{ flex: '1', minWidth: '300px' }}>
            {/* Barra de Pesquisa */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Pesquisar UF ou Região:
                </label>
                <input 
                    type="text" 
                    placeholder="Ex: Amazonas..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />
            </div>

            {/* Tabela com Scroll */}
            <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {filteredData.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th style={thStyle}>UF/Região</th>
                                <th style={thStyle}>População</th>
                                <th style={thStyle}>Casos</th>
                                <th style={thStyle}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}><strong>{item.location}</strong></td>
                                    <td style={tdStyle}>{item.indigenous_population.toLocaleString()}</td>
                                    <td style={tdStyle}>{item.autism_count.toLocaleString()}</td>
                                    <td style={{
                                        ...tdStyle, 
                                        color: '#b61212ff', 
                                        fontWeight: 'bold'
                                    }}>
                                        {item.autism_percentage.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        Nenhum estado encontrado para "{searchTerm}"
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'right' }}>
                Mostrando {filteredData.length} estados (UFs).
            </div>
                
            {genderData && (
                <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#444', fontSize: '16px' }}>
                        Distribuição Percentual de Casos de TEA por Sexo (IBGE - 2022)
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GenderPieChart 
                            malePercentage={genderData.male_percentage} 
                            femalePercentage={genderData.female_percentage} 
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Estilos simples
const thStyle = { padding: '12px 10px', textAlign: 'left', color: '#444', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '10px', verticalAlign: 'middle' };
