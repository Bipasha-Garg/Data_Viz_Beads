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
    const getRingColor = (index) => {
      const totalRings = Object.keys(jsonData).length;
      const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
      return d3.color(colorScaleInd(index));
    };
    const getSectorColor = (index, sectorIndex) => {
      const baseColor = d3.hsl(getRingColor(index));
      const isPositive = sectorIndex % 2 === 0;
      return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
    };
    const subspaces = Object.keys(jsonData);
    subspaces.sort((a, b) => a.length - b.length);
    const pointsData = subspaces.map((key) => ({
      key,
      points: jsonData[key],
      dimensions: key.length,
      subspaceId: key,
    }));
    const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
    const pointPositions = {};
    let highlightedElements = null;

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
          .style("cursor", "pointer");

        g.append("text")
          .attr("x", 0)
          .attr("y", -outerRadius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("fill", "red")
          .attr("font-weight", "bold")
          .text(ringLabels[index]);

      //   g.append("text")
      //     .attr("transform", (d) => {
      //       const midAngle = (startAngle + endAngle) / 2;
      //       const textRadius = (innerRadius + outerRadius) / 2;
      //       const x = textRadius * Math.cos(Math.PI / 2 - midAngle);
      //       const y = textRadius * Math.sin(Math.PI / 2 - midAngle);
      //       let angleDeg = ((midAngle - Math.PI / 2) * 180) / Math.PI;
      //       let rotation = (angleDeg > 90 && angleDeg < 270) ? 0 : 0;
      //       return `translate(${x}, ${y}) rotate(${rotation})`;
      //     })
      //     .attr("text-anchor", "middle")
      //     .attr("alignment-baseline", "middle")
      //     .attr("font-size", "14px")
      //     .attr("fill", "black")
      //     .attr("font-weight", "normal")
      //     .text(
      //       i
      //         .toString(2)
      //         .padStart(index + 1, "0")
      //         .replace(/0/g, "*")
      //         .replace(/1/g, "0")
      //         .replace(/\*/g, "1")
      //     );
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
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.9)
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
              const originalColor = getLabelColor(pointId);
              line.attr("stroke-width", 2).attr("stroke", "yellow");
              const circles = g.selectAll("circle")
                .filter(d => {
                  const circleX = parseFloat(this.getAttribute("cx"));
                  const circleY = parseFloat(this.getAttribute("cy"));
                  return (
                    (Math.abs(circleX - positions[i].x) < 0.1 && Math.abs(circleY - positions[i].y) < 0.1) ||
                    (Math.abs(circleX - positions[i + 1].x) < 0.1 && Math.abs(circleY - positions[i + 1].y) < 0.1)
                  )
                })
                .attr("r", 6)
                .attr("fill", "yellow");
              highlightedElements = { line, circles, originalColor };
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
            });
        }
      }
    });
    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);
    return () => {
      tooltip.remove();
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
