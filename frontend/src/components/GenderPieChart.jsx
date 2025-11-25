import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Define as dimensões do gráfico
const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

export default function GenderPieChart({ male_percentage, female_percentage }) {
    const svgRef = useRef(null);

    useEffect(() => {
        console.log('Dados do gráfico de gênero:', male_percentage, female_percentage);
        // CHECAGEM DE SEGURANÇA
        if (!male_percentage || !female_percentage) return;

        // Configuração do SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Definição dos dados
        const data = [
            { label: 'Homens', value: male_percentage, color: '#DC3545' },
            { label: 'Mulheres', value: female_percentage, color: '#007BFF' }
        ];

        // Gerador de pie e arco
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius * 0.8);

        // Desenho dos arcos
        const arcs = svg.selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        // Adiciona os rótulos de porcentagem no centro do arco
        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#fff")
            .style("font-weight", "bold")
            .text(d => d.data.value > 0 ? `${d.data.value.toFixed(1)}%` : 'Sem Dados');

        // Adicionando legendas (fora do arco)
        const legend = svg.selectAll(".legend")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${radius * 0.85}, ${-radius * 0.8 + i * 20})`); // Posição à direita

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", d => d.color);

        legend.append("text")
            .attr("x", 18)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => d.label);

    }, [male_percentage, female_percentage]); 

    return (
        <div style={{ margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block' }}>
                <svg ref={svgRef}></svg>
            </div>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
                *Baseado no total de casos diagnosticados no conjunto de dados.
            </p>
        </div>
    );
}
