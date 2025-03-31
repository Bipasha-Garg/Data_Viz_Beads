
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ParallelCoordinates = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.max(width, 300), // Minimum width
                    height: Math.max(height, 200) // Minimum height
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!data || !data.data || !Array.isArray(data.data) || !data.dimensions) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Use dynamic dimensions
        const width = dimensions.width;
        const height = dimensions.height;
        const margin = {
            top: Math.max(40, height * 0.1),
            right: Math.max(40, width * 0.05),
            bottom: Math.max(20, height * 0.05),
            left: Math.max(40, width * 0.05)
        };

        const dimensionsList = data.dimensions;

        // Create y-scales for each dimension
        const yScales = {};
        dimensionsList.forEach(dim => {
            yScales[dim] = d3
                .scaleLinear()
                .domain(d3.extent(data.data, d => d.values[dim]))
                .range([height - margin.top - margin.bottom, 0])
                .nice();
        });

        // Create x-scale for dimensions
        const xScale = d3
            .scalePoint()
            .domain(dimensionsList)
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        // Color scale based on actual labels
        const colorScale = d3
            .scaleOrdinal(d3.schemeCategory10)
            .domain([...new Set(data.data.map(d => d.label))]);

        const g = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Axes
        const axes = g.selectAll(".axis")
            .data(dimensionsList)
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => `translate(${xScale(d)}, 0)`);

        axes.each(function (d) {
            d3.select(this)
                .call(d3.axisLeft(yScales[d])
                    .ticks(Math.max(3, Math.floor(height / 100))) // Dynamic tick count
                    .tickFormat(d3.format(".2f")))
                .selectAll("text")
                .style("font-size", `${Math.max(10, width / 100)}px`);
        });

        // Axis labels
        axes.append("text")
            .attr("y", -margin.top * 0.4)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-size", `${Math.max(10, width / 80)}px`)
            .text(d => d);

        // Lines
        const line = d3.line();
        const lines = g.selectAll(".line")
            .data(data.data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", d =>
                line(dimensionsList.map(dim => [xScale(dim), yScales[dim](d.values[dim])]))
            )
            .attr("stroke", d => colorScale(d.label))
            .attr("stroke-width", Math.max(1, width / 600))
            .attr("fill", "none")
            .attr("opacity", 0.5)
            .append("title")
            .text(d => `ID: ${d.Point_ID}\nActual: ${d.label}\nPredicted: ${d.prediction}`);

        // Add legend
        const legendWidth = Math.min(120, width * 0.2);
        const legend = g.append("g")
            .attr("transform", `translate(${width - margin.left - margin.right - legendWidth}, 0)`);

        const uniqueLabels = [...new Set(data.data.map(d => d.label))];
        const legendItemHeight = Math.max(20, height / 20);

        // Only show legend if it fits
        if (legendWidth > 50 && uniqueLabels.length * legendItemHeight < height - margin.top) {
            uniqueLabels.forEach((label, i) => {
                const legendRow = legend.append("g")
                    .attr("transform", `translate(0, ${i * legendItemHeight})`);

                legendRow.append("rect")
                    .attr("width", legendWidth * 0.2)
                    .attr("height", legendWidth * 0.2)
                    .attr("fill", colorScale(label));

                legendRow.append("text")
                    .attr("x", legendWidth * 0.3)
                    .attr("y", legendWidth * 0.2 * 0.8)
                    .attr("fill", "black")
                    .style("font-size", `${Math.max(10, width / 80)}px`)
                    .text(label)
                    .attr("text-anchor", "start")
                    .attr("dominant-baseline", "middle");
            });
        }

    }, [data, dimensions]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-auto"
            style={{ minHeight: '200px', minWidth: '300px' }}
        >
            <svg
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%'
                }}
            />
        </div>
    );
};

export default ParallelCoordinates;