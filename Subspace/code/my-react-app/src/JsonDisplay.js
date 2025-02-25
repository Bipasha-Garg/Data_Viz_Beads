import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (
      !jsonData ||
      typeof jsonData !== "object" ||
      Object.keys(jsonData).length === 0
    ) {
      console.error("Invalid or empty jsonData:", jsonData);
      return;
    }

    if (!labelsData || typeof labelsData !== "object") {
      console.error("Invalid labelsData:", labelsData);
      return;
    }

    const svg = d3.select(graphRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 800;
    const margin = 20;
    const maxRadius = Math.min(width, height) / 2 - margin;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

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

    const edgePopup = d3
      .select("body")
      .append("div")
      .attr("class", "edge-popup")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(255, 255, 255, 0.9)")
      .style("color", "black")
      .style("padding", "10px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
      .style("max-width", "300px");

    const getLabelColor = (pointId) => {
      if (!labelsData || !labelsData.labels) return "gray";
      for (const label of Object.keys(labelsData.labels)) {
        const pointList = labelsData.labels[label];
        if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
          return colorScale(label);
        }
      }
      return "gray";
    };

    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(Object.keys(labelsData.labels || {}));

    const getSectorColor = (index, sectorIndex) => {
      return d3.hsl(sectorIndex % 2 === 0 ? 0 : 220, 0.9, 0.6);
    };

    const subspaces = Object.keys(jsonData);
    subspaces.sort((a, b) => a.length - b.length);

    const pointsData = subspaces.map((key) => ({
      key,
      points: jsonData[key],
      dimensions: key.length,
      subspaceId: key,
    }));

    const pointPositions = {};
    let highlightedElements = null;

    // Function to clear highlights
    const clearHighlights = () => {
      if (highlightedElements) {
        highlightedElements.line.attr("stroke-width", 0.3).attr("stroke", highlightedElements.originalColor);
        highlightedElements.circles.forEach(circle =>
          circle.attr("r", 3).attr("fill", "black")
        );
        highlightedElements = null;
      }
    };

    // Function to show zoomed sector view
    const showZoomedSector = (subspaceKey, sectorIndex, innerRadius, outerRadius, startAngle, endAngle) => {
      // Clear existing zoom view
      svg.select(".zoom-view").remove();

      const zoomGroup = svg.append("g")
        .attr("class", "zoom-view")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const sectorPoints = pointsData.find(d => d.key === subspaceKey).points
        .filter(point => {
          const bitVector = Object.entries(point)
            .filter(([k]) => k !== "Point_ID")
            .map(([_, v]) => v >= 0 ? 1 : 0)
            .join("");
          const bitIndex = parseInt(bitVector, 2);
          const sectors = 2 ** (subspaces.indexOf(subspaceKey) + 1);
          return bitIndex === sectorIndex;
        });

      const zoomWidth = width * 0.8;
      const zoomHeight = height * 0.8;
      const arcCount = sectorPoints.length;

      // Draw zoomed sector background
      zoomGroup.append("rect")
        .attr("x", -zoomWidth / 2)
        .attr("y", -zoomHeight / 2)
        .attr("width", zoomWidth)
        .attr("height", zoomHeight)
        .attr("fill", "white")
        .attr("stroke", "black");

      // Draw arcs and points
      sectorPoints.forEach((point, i) => {
        const value = Object.values(point).filter(v => typeof v === "number")[0];
        const maxValue = Math.max(...sectorPoints.map(p =>
          Math.abs(Object.values(p).filter(v => typeof v === "number")[0])));

        const arcRadius = (zoomHeight * 0.4 * (i + 1)) / arcCount;
        const arc = d3.arc()
          .innerRadius(arcRadius - 5)
          .outerRadius(arcRadius)
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI / 2);

        zoomGroup.append("path")
          .attr("d", arc)
          .attr("fill", "lightblue")
          .attr("opacity", 0.5);

        const angle = (value / maxValue) * Math.PI - Math.PI / 2;
        const x = arcRadius * Math.cos(angle);
        const y = arcRadius * Math.sin(angle);

        zoomGroup.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", getLabelColor(point.Point_ID[0]));
      });

      // Add close button
      zoomGroup.append("text")
        .attr("x", zoomWidth / 2 - 20)
        .attr("y", -zoomHeight / 2 + 20)
        .text("×")
        .attr("font-size", "20px")
        .style("cursor", "pointer")
        .on("click", () => zoomGroup.remove());
    };

    subspaces.forEach((key, index) => {
      if (!ringVisibility[key]) return;

      const innerRadius = (index / subspaces.length) * maxRadius;
      const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
      const sectors = 2 ** (index + 1);
      const rotationOffset = Math.PI / 2;

      for (let i = 0; i < sectors; i++) {
        const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
        const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;

        g.append("path")
          .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle)
          )
          .attr("fill", getSectorColor(index, i))
          .attr("fill-opacity", 0.3)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("click", () => {
            clearHighlights();
            showZoomedSector(key, i, innerRadius, outerRadius, startAngle, endAngle);
          });

        g.append("text")
          .attr("x", 0)
          .attr("y", -outerRadius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(key);
      }

      for (let i = 0; i < sectors; i++) {
        const angle = (2 * Math.PI * i) / sectors;
        const x1 = outerRadius * Math.cos(angle);
        const y1 = outerRadius * Math.sin(angle);
        const x2 = innerRadius * Math.cos(angle);
        const y2 = innerRadius * Math.sin(angle);
        g.append("line")
          .attr("x1", x2)
          .attr("y1", y2)
          .attr("x2", x1)
          .attr("y2", y1)
          .attr("stroke", "black")
          .attr("stroke-width", 0.25)
          .style("pointer-events", "none");
      }

      pointsData[index].points.forEach((point, i) => {
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
        const centerAngle = (angleStart + angleEnd) / 2;

        const totalPoints = pointsData[index].points.length;
        const clusterFactor = 0.86;
        const overlapRadius =
          innerRadius +
          (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) /
          totalPoints;

        const x = overlapRadius * Math.cos(centerAngle);
        const y = overlapRadius * Math.sin(centerAngle);
        point.Point_ID.forEach((id) => {
          if (!pointPositions[id]) {
            pointPositions[id] = [];
          }
          pointPositions[id].push({ x, y, point, subspaceId: key });
        });

        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 3)
          .attr("fill", "black")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .style("pointer-events", "visible")
          .on("mouseover", (event) => {
            const pointIds = point.Point_ID.join(", ");
            let associatedLabels = [];
            if (labelsData && labelsData.labels) {
              Object.entries(labelsData.labels).forEach(([label, pointList]) => {
                if (point.Point_ID.some(id => pointList.includes(Number(id)))) {
                  associatedLabels.push(label);
                }
              });
            }
            const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

            tooltip
              .style("visibility", "visible")
              .html(
                `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${key}<br>Label: ${labelText}`
              );
            setHoveredCoordinates({ ...point, label: labelText });
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

    Object.entries(pointPositions).forEach(([pointId, positions]) => {
      if (positions.length > 1) {
        for (let i = 0; i < positions.length - 1; i++) {
          const line = g.append("line")
            .attr("x1", positions[i].x)
            .attr("y1", positions[i].y)
            .attr("x2", positions[i + 1].x)
            .attr("y2", positions[i + 1].y)
            .attr("stroke", getLabelColor(pointId))
            .attr("stroke-width", 0.3)
            .style("cursor", "pointer")
            .on("mouseover", (event) => {
              tooltip
                .style("visibility", "visible")
                .html(`Connection: Point_ID ${pointId}`);
            })
            .on("mousemove", (event) => {
              tooltip
                .style("top", event.pageY + 10 + "px")
                .style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", () => {
              tooltip.style("visibility", "hidden");
            })
            .on("click", (event) => {
              // Clear previous highlights
              clearHighlights();

              // Highlight the clicked edge
              const originalColor = getLabelColor(pointId);
              line.attr("stroke-width", 2).attr("stroke", "yellow");

              // Highlight connected points
              const circles = g.selectAll("circle")
                .filter(d => {
                  const circleX = parseFloat(this.getAttribute("cx"));
                  const circleY = parseFloat(this.getAttribute("cy"));
                  return (
                    (Math.abs(circleX - positions[i].x) < 0.1 && Math.abs(circleY - positions[i].y) < 0.1) ||
                    (Math.abs(circleX - positions[i + 1].x) < 0.1 && Math.abs(circleY - positions[i + 1].y) < 0.1)
                )})
                .attr("r", 6)
                .attr("fill", "yellow");

              highlightedElements = { line, circles, originalColor };

              // Show popup
              const point1 = positions[i].point;
              const point2 = positions[i + 1].point;

              const coords1 = Object.entries(point1)
                .filter(([key]) => key !== "Point_ID")
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
              const coords2 = Object.entries(point2)
                .filter(([key]) => key !== "Point_ID")
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");

              const label1 = Object.entries(labelsData?.labels || {})
                .find(([_, ids]) => ids.includes(Number(pointId)))?.[0] || "No Label";

              edgePopup
                .style("visibility", "visible")
                .html(`
                  <strong>Connected Points (ID: ${pointId})</strong><br><br>
                  <strong>Point 1</strong><br>
                  Subspace: ${positions[i].subspaceId}<br>
                  Coordinates: ${coords1}<br>
                  Label: ${label1}<br><br>
                  <strong>Point 2</strong><br>
                  Subspace: ${positions[i + 1].subspaceId}<br>
                  Coordinates: ${coords2}<br>
                  Label: ${label1}
                `)
                .style("top", event.pageY + 15 + "px")
                .style("left", event.pageX + 15 + "px");

              d3.select("body").on("click.edgePopup", (e) => {
                if (!edgePopup.node().contains(e.target)) {
                  edgePopup.style("visibility", "hidden");
                  clearHighlights();
                  d3.select("body").on("click.edgePopup", null);
                }
              });
            });
        }
      }
    });

    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

    svg.call(zoom);

    const legendData = [
      { color: d3.hsl(11, 0.9, 0.7), label: "Negative Bit Sector" },
      { color: d3.hsl(220, 0.9, 0.7), label: "Positive Bit Sector" }
    ];

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 200}, ${height - 70})`);

    legend.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 30)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => d.color);

    legend.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 25)
      .attr("y", (d, i) => i * 30 + 15)
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("alignment-baseline", "middle");

    return () => {
      tooltip.remove();
      edgePopup.remove();
      svg.select(".zoom-view").remove();
    };
  }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
    </div>
  );
};

export default HierarchicalGraph;