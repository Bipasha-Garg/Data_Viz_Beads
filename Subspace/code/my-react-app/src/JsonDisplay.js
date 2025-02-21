
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates }) => {
  const graphRef = useRef(null);
  const [ringVisibility, setRingVisibility] = useState({});


  useEffect(() => {
    if (jsonData && Object.keys(jsonData).length > 0) {
      const subspaces = Object.keys(jsonData);
      subspaces.sort((a, b) => a.length - b.length);

      const initialVisibility = subspaces.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setRingVisibility(initialVisibility);
    }
  }, [jsonData]);


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

    const getSectorColor = (index, sectorIndex) => {
      return d3.hsl(sectorIndex % 2 === 1 ? 7837 : 0, 1, 0.5);
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

    subspaces.forEach((key, index) => {
      if (!ringVisibility[key]) return;

      const innerRadius = (index / subspaces.length) * maxRadius;
      const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
      const sectors = 2 ** (index + 1);
      const rotationOffset = Math.PI / 2;


      for (let i = 0; i < sectors; i++) {
        g.append("path")
          .attr(
            "d",
            d3
              .arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius)
              .startAngle((2 * Math.PI * i) / sectors + rotationOffset)
              .endAngle((2 * Math.PI * (i + 1)) / sectors + rotationOffset)
          )
          .attr("fill", getSectorColor(index, i))
          .attr("fill-opacity", 0.3)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);

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
            tooltip
              .style("visibility", "visible")
              .html(
                `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(
                  2
                )}, ${y.toFixed(2)})<br>Subspace: ${key}`
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


    Object.entries(pointPositions).forEach(([pointId, positions]) => {
      if (positions.length > 1) {
        for (let i = 0; i < positions.length - 1; i++) {
          g.append("line")
            .attr("x1", positions[i].x)
            .attr("y1", positions[i].y)
            .attr("x2", positions[i + 1].x)
            .attr("y2", positions[i + 1].y)
            .attr("stroke", getLabelColor(pointId))
            .attr("stroke-width", 0.3)
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
            });
        }
      }
    });

    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

    svg.call(zoom);
  }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates]);

  const toggleRingVisibility = (key) => {
    setRingVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllRingsVisibility = () => {
    const subspaces = Object.keys(jsonData);
    subspaces.sort((a, b) => a.length - b.length);

    const newVisibility = subspaces.reduce((acc, key, index) => {

      acc[key] = index >= subspaces.length - 2 ? true : !ringVisibility[key];
      return acc;
    }, {});
    setRingVisibility(newVisibility);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <div style={{ flexGrow: 1, minWidth: "800px" }}>
        <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
      </div>

      <div style={{ minWidth: "250px", marginLeft: "50px" }}>
        <button onClick={toggleAllRingsVisibility}>
          {Object.values(ringVisibility).every((v) => v)
            ? "Collapse All"
            : "Expand All"}
        </button>
        {Object.keys(jsonData || {}).map((key) => (
          <div key={key} style={{ margin: "5px 0" }}>
            <button
              onClick={() => toggleRingVisibility(key)}
              style={{
                width: "50%",
                padding: "6px",
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor: ringVisibility[key] ? "lightblue" : "lightgray",
                border: "1px solid #ccc",
                borderRadius: "4px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                textAlign: "left",
              }}
            >
              {ringVisibility[key] ? `- ${key}` : `+ ${key}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

};

export default HierarchicalGraph;
