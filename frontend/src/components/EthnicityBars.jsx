import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const processData = (data) => {
  console.log('Dados da API:', data); // Verifique os dados para confirmar as chaves
  return [
    { race: "Branca", total: data.branca_total, autismo: data.aut_branca_total },
    { race: "Preta", total: data.preta_total, autismo: data.aut_preta_total },
    { race: "Amarela", total: data.amarela_total, autismo: data.aut_amarela_total },
    { race: "Parda", total: data.parda_total, autismo: data.aut_parda_total },
  ];
};

const EthnicityBars = ({ data, width = 800, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const processedData = processData(data);

    // Coloque o console.log aqui, após a definição de processedData
    console.log('Dados processados:', processedData);

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand()
      .domain(processedData.map((d) => d.race))
      .range([0, chartWidth])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(["Total", "Autismo"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => Math.max(d.total, d.autismo))])
      .nice()
      .range([chartHeight, 0]);

    /** ▬▬▬▬▬▬▬▬▬▬ DESENHA AS BARRAS ▬▬▬▬▬▬▬▬▬▬ */
    chart
      .selectAll("g.bar-group")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${x0(d.race)}, 0)`)
      .selectAll("rect")
      .data((d) => [
        { label: "Total", value: d.total },
        { label: "Autismo", value: d.autismo },
      ])
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.label))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => chartHeight - y(d.value))
      .attr("fill", (d) => (d.label === "Total" ? "#007bff" : "#28a745"));

    /** ▬▬▬▬▬▬▬▬▬▬ EIXO X ▬▬▬▬▬▬▬▬▬▬ */
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "translate(0,10)") 
      .style("text-anchor", "middle")
      .style("font-size", "16px") // Aumenta o tamanho da fonte dos rótulos do eixo X
      .style("font-weight", "600"); // Deixa os rótulos do eixo X em negrito

    /** ▬▬▬▬▬▬▬▬▬▬ EIXO Y ▬▬▬▬▬▬▬▬▬▬ */
    chart.append("g").call(d3.axisLeft(y));
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default EthnicityBars;
