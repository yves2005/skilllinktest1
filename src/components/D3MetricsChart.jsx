import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const D3MetricsChart = ({ responseRate, completedProjects }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        
        // Clear previous
        d3.select(chartRef.current).selectAll('*').remove();
        
        const width = 200;
        const height = 100;
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Chart 1: Response Rate (Pie chart)
        const g1 = svg.append('g').attr('transform', `translate(50, 50)`);
        const pie = d3.pie().value(d => d.value);
        const data1 = [{value: responseRate}, {value: 100 - responseRate}];
        const arc = d3.arc().innerRadius(25).outerRadius(35);
        
        g1.selectAll('path')
            .data(pie(data1))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => i === 0 ? '#4f46e5' : '#e2e8f0');

        g1.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.3em')
            .text(`${responseRate}%`)
            .style('font-size', '10px')
            .style('fill', '#4f46e5');

        // Chart 2: Completed Projects (Bar chart)
        const g2 = svg.append('g').attr('transform', `translate(120, 20)`);
        g2.append('rect')
            .attr('width', 40)
            .attr('height', 60)
            .attr('fill', '#e2e8f0')
            .attr('rx', 5);
        
        const barHeight = Math.min(60, (completedProjects / 10) * 60);
        g2.append('rect')
            .attr('width', 40)
            .attr('height', barHeight)
            .attr('y', 60 - barHeight)
            .attr('fill', '#10b981')
            .attr('rx', 5);

        g2.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', 20)
            .attr('y', 80)
            .text(`${completedProjects}`)
            .style('font-size', '12px')
            .style('fill', '#1f2937');
            
    }, [responseRate, completedProjects]);

    return <div ref={chartRef} className="flex justify-center mt-2"></div>;
};

export default D3MetricsChart;
