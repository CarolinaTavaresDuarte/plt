import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Define as dimensões do mapa 
const width = 800;
const height = 500;

// Configuração da projeção (centrada no Brasil)
const projection = d3.geoMercator()
  .scale(650) // Escala ajustada
  .center([-52, -15])
  .translate([width / 2, height / 2]);

const path = d3.geoPath()
  .projection(projection);

// Cria uma escala de cores D3 (Amarelo para Baixo, Vermelho para Alto)
const colorScale = d3.scaleQuantize()
  .domain([0, 3]) 
  .range(d3.schemeReds[5]); 

// --- FUNÇÃO DE NORMALIZAÇÃO (CRUCIAL PARA OS NOMES BATEREM) ---
// Remove acentos, espaços extras e coloca tudo em minúsculo
// Ex: "São Paulo" -> "sao paulo"
// Ex: "Ceará" -> "ceara"
const normalizeName = (name) => {
    if (!name) return "";
    return name
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

export default function BrazilMapD3({ ibgeData, geoData }) {
  const svgRef = useRef(null); 

  useEffect(() => {
    // --- CHECAGEM DE SEGURANÇA ---
    if (!geoData || !Array.isArray(geoData) || geoData.length === 0) {
      return; 
    }

    try {
      const safeIbgeData = Array.isArray(ibgeData) ? ibgeData : [];

      // 1. Mapeamento de Dados: Usamos a chave NORMALIZADA
      const dataMap = safeIbgeData.reduce((acc, item) => {
        if (item && item.location) {
           // Normaliza o nome que vem do Banco de Dados (ex: "São Paulo" -> "sao paulo")
           const key = normalizeName(item.location);
           acc[key] = item.autism_percentage; 
        }
        return acc;
      }, {});

      // 2. Setup do SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Limpa o SVG anterior
      const g = svg.append("g");

      // 3. Lógica de Zoom
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
          g.selectAll("path").style("stroke-width", 1.5 / event.transform.k + "px"); 
        });

      svg.call(zoom);

      // 4. Desenho dos Estados (Polígonos)
      g.selectAll(".state")
          .data(geoData) 
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("d", path)
          .style("fill", (d) => {
            // Pega o nome original do GeoJSON (ex: "Sao Paulo" ou "São Paulo")
            const rawName = d.properties ? d.properties.name : "";
            
            // Normaliza o nome do GeoJSON para bater com a chave do banco (ex: "sao paulo")
            const searchKey = normalizeName(rawName);
            
            const percentage = dataMap[searchKey];
            
            // Se encontrou, pinta com a cor da escala. Se não, cinza (#eee).
            return (percentage !== undefined && percentage !== null) 
                ? colorScale(percentage) 
                : "#eee"; 
          })
          .style("stroke", "#666")
          .style("stroke-width", "0.5px")
          .on("mouseover", function(event, d) {
              const rawName = d.properties ? d.properties.name : "Desconhecido";
              // Normaliza também para o tooltip achar o valor correto
              const searchKey = normalizeName(rawName);
              const percentage = dataMap[searchKey];
              
              const displayValue = (percentage !== undefined && percentage !== null) 
                  ? `${percentage.toFixed(2)}%` 
                  : 'N/D';
              
              d3.select(".tooltip").remove(); 
              d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("position", "absolute")
                  .style("background", "white")
                  .style("padding", "8px")
                  .style("border", "1px solid #ccc")
                  .style("border-radius", "4px")
                  .style("pointer-events", "none")
                  .style("z-index", "9999")
                  .html(`<strong>${rawName}</strong><br/>Percentual: ${displayValue}`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
              d3.select(".tooltip").remove();
          });

    } catch (error) {
      console.error("Erro ao desenhar o mapa:", error);
    }

  }, [ibgeData, geoData]); 

  return (
    <div style={{ margin: '20px auto', maxWidth: '800px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Percentual de Autismo Indígena por Localização (IBGE)</h3>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`}></svg>
      </div>
      <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '10px'}}>
        Passe o mouse sobre os estados para ver o percentual.
      </p>
    </div>
  );
}