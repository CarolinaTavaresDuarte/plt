import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Função para processar os dados (apenas autismo)
const processData = (data) => {
  console.log('Dados da API:', data); // Verifique os dados para confirmar as chaves

  return [
    { race: "Branca", autismo: data.aut_branca_total }, // Apenas autismo
    { race: "Preta", autismo: data.aut_preta_total }, // Apenas autismo
    { race: "Amarela", autismo: data.aut_amarela_total }, // Apenas autismo
    { race: "Parda", autismo: data.aut_parda_total }, // Apenas autismo
  ];
};

const EthnicityBars = ({ data, width = 800, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    // Processamento dos dados
    const processedData = processData(data);

    console.log('Dados processados:', processedData); // Verificar os dados processados

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // Limpar o SVG antes de desenhar novamente

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escala do eixo X (para as raças)
    const x0 = d3
      .scaleBand()
      .domain(processedData.map((d) => d.race))
      .range([0, chartWidth])
      .padding(0.2);

    // Escala do eixo Y (autismo)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.autismo)]) // Usando apenas autismo
      .nice()
      .range([chartHeight, 0]);

    // Array de cores para cada raça
    const colors = {
      Branca: "#007bff", // Azul para Branca
      Preta: "#e74c3c",  // Vermelho para Preta
      Amarela: "#f39c12", // Amarelo para Amarela
      Parda: "#2ecc71", // Verde para Parda
    };

    // Desenhando as barras de "Autismo" com cores diferentes para cada raça
    chart
      .selectAll("g.bar-group")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${x0(d.race)}, 0)`)
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.autismo))
      .attr("width", x0.bandwidth())
      .attr("height", (d) => chartHeight - y(d.autismo))
      .attr("fill", (d) => colors[d.race]); // Cor definida por raça

    // Adicionando os números sobre as barras
    chart
      .selectAll("g.bar-group")
      .append("text")
      .attr("x", x0.bandwidth() / 2) // Centralizar o texto na barra
      .attr("y", (d) => y(d.autismo) - 10) // Posicionar o texto um pouco acima da barra
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333") // Cor do texto
      .text((d) => d.autismo.toLocaleString()); // Exibir o valor formatado

    // Eixo X
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "translate(0,10)") // Ajuste de posição dos rótulos
      .style("text-anchor", "middle")
      .style("font-size", "16px") // Tamanho da fonte
      .style("font-weight", "600"); // Estilo em negrito

    // Eixo Y
    chart.append("g").call(d3.axisLeft(y));
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default EthnicityBars;
