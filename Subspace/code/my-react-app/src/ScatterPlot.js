import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlotMatrix = ({ data }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!data || !data.points || !Array.isArray(data.points) || data.points.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get all feature names
        const features = Object.keys(data.points[0].features);
        const n = features.length;

        const size = 200; // Increased size for better visibility
        const padding = 40; // Increased padding for labels
        const totalSize = n * (size + padding);

        svg.attr("width", totalSize + padding)
            .attr("height", totalSize + padding);

        const colorScale = d3
            .scaleOrdinal(d3.schemeCategory10)
            .domain([...new Set(data.points.map(d => d.actual_label))]);

        // Create scales for each feature
        const scales = features.map(feat => {
            return d3.scaleLinear()
                .domain(d3.extent(data.points, d => d.features[feat]))
                .range([padding / 2, size - padding / 2])
                .nice(); // Rounds domain for nicer tick values
        });

        // Create the matrix
        features.forEach((featX, i) => {
            features.forEach((featY, j) => {
                const g = svg.append("g")
                    .attr("transform", `translate(${i * (size + padding)}, ${j * (size + padding)})`);

                // Add background rectangle for better contrast
                g.append("rect")
                    .attr("width", size)
                    .attr("height", size)
                    .attr("fill", "#f5f5f5");

                // Add axes with better formatting
                const xAxis = d3.axisBottom(scales[i])
                    .ticks(5)
                    .tickFormat(d3.format(".2f"));

                const yAxis = d3.axisLeft(scales[j])
                    .ticks(5)
                    .tickFormat(d3.format(".2f"));

                // Bottom axis
                g.append("g")
                    .attr("transform", `translate(0, ${size - padding / 2})`)
                    .call(xAxis)
                    .selectAll("text")
                    .style("font-size", "10px");

                // Left axis
                g.append("g")
                    .attr("transform", `translate(${padding / 2}, 0)`)
                    .call(yAxis)
                    .selectAll("text")
                    .style("font-size", "10px");

                // Add feature labels
                if (j === 0) {
                    g.append("text")
                        .attr("x", size / 2)
                        .attr("y", -padding / 2)
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text(featX);
                }
                if (i === 0) {
                    g.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -size / 2)
                        .attr("y", padding / 4)
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text(featY);
                }

                // Add points or diagonal text
                if (i === j) {
                    g.append("text")
                        .attr("x", size / 2)
                        .attr("y", size / 2)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle")
                        .style("font-size", "14px")
                        .style("font-style", "italic")
                        .text(featX);
                } else {
                    g.selectAll("circle")
                        .data(data.points)
                        .enter()
                        .append("circle")
                        .attr("cx", d => scales[i](d.features[featX]))
                        .attr("cy", d => scales[j](d.features[featY]))
                        .attr("r", 4)
                        .attr("fill", d => colorScale(d.actual_label))
                        .attr("opacity", 0.7)
                        .append("title")
                        .text(d => `ID: ${d.Point_ID}\nActual: ${d.actual_label}\nPredicted: ${d.predicted_label}`);
                }
            });
        });

        // Add legend
        const legend = svg.append("g")
            .attr("transform", `translate(${totalSize - 120}, ${padding})`);

        const uniqueLabels = [...new Set(data.points.map(d => d.actual_label))];
        uniqueLabels.forEach((label, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", colorScale(label));

            legendRow.append("text")
                .attr("x", 18)
                .attr("y", 10)
                .attr("fill", "black")
                .style("font-size", "12px")
                .text(label);
        });

    }, [data]);

    return (
        <div style={{ width: "100%", overflow: "auto", padding: "20px" }}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default ScatterPlotMatrix;