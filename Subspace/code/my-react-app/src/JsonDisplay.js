import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (!jsonData || Object.keys(jsonData).length === 0) return;

    const subspaces = Object.keys(jsonData);
    console.log(subspaces.length);
    
    subspaces.sort((a, b) => a.length - b.length);

    const pointsData = subspaces.map((key) => ({
      key,
      points: jsonData[key],
      dimensions: key.length, 
      subspaceId: key, 
    }));

    const svg = d3.select(graphRef.current);
    const width = 1200;
    const height = 1200;
    const margin = 20;

    svg.selectAll("*").remove(); 
    const maxRadius = Math.min(width, height) / 2 - margin;
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    pointsData.forEach((subspace, index) => {
      const radius = maxRadius * ((index + 1) / subspaces.length);
      const sectors = 2 ** (index +1); 
      console.log(sectors);
      
      const colorScale = d3
        .scaleOrdinal()
        .range(["#FFD700", "#FF69B4", "#33B5E5"]); 
      
      const subspaceColor = colorScale(
        subspace.dimensions % colorScale.range().length
      );
      
      g.append("circle")
        .attr("r", radius)
        .attr("stroke", "black") 
        .attr("fill", subspaceColor)
        .attr("fill-opacity", 0.2) 
        .attr("stroke-width", 2); 
      
      if (subspace.dimensions > 0) {
        
        for (let i = 0; i < sectors; i++) {
          const angle = (2 * Math.PI * i) / sectors;
          const x1 = radius * Math.cos(angle);
          const y1 = radius * Math.sin(angle);
          g.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x1)
            .attr("y2", y1)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
          
          const labelX = (radius + 10) * Math.cos(angle); 
          const labelY = (radius + 10) * Math.sin(angle);

          g.append("text")
            .attr("x", labelX)
            .attr("y", labelY + 5) 
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", "10px")
            .style("fill", "black");
        }
      }

      const sectorRadius = radius;

      subspace.points.forEach((point) => {
        const bitPattern = point.Point_ID.toString(2).padStart(
          subspace.dimensions,
          "0"
        );
        const sectorIndex = parseInt(bitPattern, 2);
        const sectorAngleStart = (2 * Math.PI * sectorIndex) / sectors;
        const sectorAngleEnd = (2 * Math.PI * (sectorIndex + 1)) / sectors;

        const minRadius = sectorRadius * 0.2;
        const randomRadius =
          minRadius + Math.random() * (sectorRadius - minRadius);
        const randomAngle =
          sectorAngleStart +
          Math.random() * (sectorAngleEnd - sectorAngleStart);

        const x = randomRadius * Math.cos(randomAngle);
        const y = randomRadius * Math.sin(randomAngle);

        if (Math.sqrt(x * x + y * y) <= radius) {
          const circle = g
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 4)
            .attr("fill", "black")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .append("title")
            .text(
              `ID: ${point.Point_ID}, Binary: ${bitPattern}, Subspace: ${subspace.subspaceId}`
            );

          
          circle
            .on("mouseover", function () {
              d3.select(this).attr("fill", "red");
            })
            .on("mouseout", function () {
              d3.select(this).attr("fill", "black");
            });
        } else {
          console.warn(
            `Point ${point.Point_ID} is outside the subspace ${subspace.subspaceId}`
          ); 
        }
      });
    });
  }, [jsonData]);

  return <svg ref={graphRef} style={{ width: "1200px", height: "1200px" }}></svg>;
};

export default HierarchicalGraph;