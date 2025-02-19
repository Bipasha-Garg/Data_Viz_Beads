
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, setHoveredCoordinates }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (!jsonData || Object.keys(jsonData).length === 0) return;

    const subspaces = Object.keys(jsonData);
    subspaces.sort((a, b) => a.length - b.length);

    const pointsData = subspaces.map((key) => ({
      key,
      points: jsonData[key],
      dimensions: key.length,
      subspaceId: key,
    }));

    const svg = d3.select(graphRef.current);
    const width = 800;
    const height = 800;
    const margin = 20;

    svg.selectAll("*").remove();
    const maxRadius = Math.min(width, height) / 2 - margin;
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pointPositions = {}; // Store positions of points by Point_ID

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("font-size", "12px");

    pointsData.forEach((subspace, index) => {
      const innerRadius = (index / subspaces.length) * maxRadius;
      const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
      const sectors = 2 ** (index + 1);
      const colorScale = d3
        .scaleOrdinal()
        .range(["#FFD700", "#FF69B4", "#33B5E5"]);
      const subspaceColor = colorScale((index + 1) % colorScale.range().length);

      g.append("circle")
        .attr("r", outerRadius)
        .attr("stroke", "black")
        .attr("fill", subspaceColor)
        .attr("fill-opacity", 0.2)
        .attr("stroke-width", 2)
        .style("pointer-events", "none");

      for (let i = 0; i < sectors; i++) {
        const angle = (2 * Math.PI * i) / sectors;
        const x1 = outerRadius * Math.cos(angle);
        const y1 = outerRadius * Math.sin(angle);
        g.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", x1)
          .attr("y2", y1)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .style("pointer-events", "none");
      }

      subspace.points.forEach((point) => {
        const pointData = Object.entries(point).filter(
          ([key]) => key !== "Point_ID"
        );
        const bitVector = pointData
          .map(([key, coord]) => (coord >= 0 ? 1 : 0))
          .join("");

        const minRadius = innerRadius;
        const maxRadius = outerRadius;
        const randomRadius =
          minRadius + Math.random() * (maxRadius - minRadius);

        const bitVectorIndex = parseInt(bitVector, 2);
        const angleStart = (2 * Math.PI * bitVectorIndex) / sectors;
        const angleEnd = (2 * Math.PI * (bitVectorIndex + 1)) / sectors;
        const randomAngle =
          angleStart + Math.random() * (angleEnd - angleStart);

        const x = randomRadius * Math.cos(randomAngle);
        const y = randomRadius * Math.sin(randomAngle);

        if (!pointPositions[point.Point_ID]) {
          pointPositions[point.Point_ID] = [];
        }
        pointPositions[point.Point_ID].push({ x, y, point });

        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", "black")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .style("pointer-events", "visible")
          .on("mouseover", (event) => {
            tooltip
              .style("visibility", "visible")
              .html(
                `Point_ID: ${point.Point_ID}<br>Coordinates: (${x.toFixed(
                  2
                )}, ${y.toFixed(2)})`
              );
            setHoveredCoordinates(point);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", event.pageY + 10 + "px")
              .style("left", event.pageX + 10 + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            setHoveredCoordinates(null);
          });
      });
    });

    Object.values(pointPositions).forEach((positions) => {
      if (positions.length > 1) {
        for (let i = 0; i < positions.length - 1; i++) {
          g.append("line")
            .attr("x1", positions[i].x)
            .attr("y1", positions[i].y)
            .attr("x2", positions[i + 1].x)
            .attr("y2", positions[i + 1].y)
            .attr("stroke", "red")
            .attr("stroke-width", 0.3)
            .on("mouseover", (event) => {
              tooltip
                .style("visibility", "visible")
                .html(`Connection: Point_ID ${positions[i].point.Point_ID}`);
            })
            .on("mousemove", (event) => {
              tooltip
                .style("top", event.pageY + 10 + "px")
                .style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", () => {
              tooltip.style("visibility", "hidden");
            });
        }
      }
    });

    // Zoom functionality
    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

    svg.call(zoom);
  }, [jsonData, setHoveredCoordinates]);

  return <svg ref={graphRef} style={{ width: "800px", height: "800px" }}></svg>;
};

export default HierarchicalGraph;