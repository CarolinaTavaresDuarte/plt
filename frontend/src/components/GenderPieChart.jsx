import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Definições de tamanho fixas
const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

export default function GenderPieChart({ malePercentage, femalePercentage }) {
    const svgRef = useRef(null);

    useEffect(() => {
        // CORREÇÃO: A array 'data' PRECISA SER DEFINIDA AQUI DENTRO, 
        // para que use os valores atualizados das props.
        const data = [
            { label: 'Homens', value: malePercentage || 0, color: '#DC3545' }, 
            { label: 'Mulheres', value: femalePercentage || 0, color: '#007BFF' } 
        ];

        // Checagem de segurança
        if (!svgRef.current) return;
        
        // Limpa o SVG anterior para evitar duplicidade em re-renderizações
        d3.select(svgRef.current).selectAll("*").remove();

        // Configuração do SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            // Move o centro para o meio do SVG
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Gerador de Pie e Arco
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null); 

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius * 0.8); // Ajuste para dar espaço para a legenda

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
            .text(d => d.data.value > 0 ? `${d.data.value.toFixed(1)}%` : '');

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

    }, [malePercentage, femalePercentage]); 

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