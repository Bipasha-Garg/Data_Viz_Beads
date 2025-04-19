// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
//   const graphRef = useRef(null);
//   const [viewMode, setViewMode] = useState("normal");

//   useEffect(() => {
//     if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
//       console.error("Invalid or empty jsonData:", jsonData);
//       return;
//     }

//     if (!labelsData || typeof labelsData !== "object") {
//       console.error("Invalid labelsData:", labelsData);
//       return;
//     }

//     const svg = d3.select(graphRef.current);
//     svg.selectAll("*").remove();

//     const width = 800;
//     const height = 800;
//     const margin = 20;
//     const maxRadius = Math.min(width, height) / 2 - margin;

//     const g = svg
//       .attr("width", width)
//       .attr("height", height)
//       .append("g")
//       .attr("transform", `translate(${width / 2}, ${height / 2})`);

//     const tooltip = d3
//       .select("body")
//       .append("div")
//       .attr("class", "tooltip")
//       .style("position", "absolute")
//       .style("visibility", "hidden")
//       .style("background-color", "rgba(0, 0, 0, 0.7)")
//       .style("color", "white")
//       .style("padding", "5px")
//       .style("border-radius", "4px")
//       .style("font-size", "12px");

//     const getLabelColor = (pointId) => {
//       if (!labelsData || !labelsData.labels) return "gray";
//       for (const label of Object.keys(labelsData.labels)) {
//         const pointList = labelsData.labels[label];
//         if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
//           return colorScale(label);
//         }
//       }
//       return "gray";
//     };

//     const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
//     const getRingColor = (index) => {
//       const totalRings = Object.keys(jsonData).length;
//       const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
//       return d3.color(colorScaleInd(index));
//     };
//     const getSectorColor = (index, sectorIndex) => {
//       const baseColor = d3.hsl(getRingColor(index));
//       const isPositive = sectorIndex % 2 === 0;
//       return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
//     };

//     const subspaces = Object.keys(jsonData);
//     subspaces.sort((a, b) => a.length - b.length);
//     const pointsData = subspaces.map((key) => ({
//       key,
//       points: jsonData[key] || [],
//       dimensions: key.length,
//       subspaceId: key,
//     }));
//     const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
//     const pointPositions = {};
//     const calculateSectorPointCounts = () => {
//       const sectorCounts = subspaces.map((key, index) => {
//         const sectors = 2 ** (index + 1);
//         return Array(sectors).fill(0);
//       });

//       subspaces.forEach((key, index) => {
//         const points = pointsData[index].points;
//         const sectors = 2 ** (index + 1);

//         points.forEach(point => {
//           const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
//           const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
//           const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);
//           sectorCounts[index][bitVectorIndex]++;
//         });
//       });

//       return sectorCounts;
//     };

//     const calculateRecursiveSectorAngles = () => {
//       const sectorCounts = calculateSectorPointCounts();
//       const sectorAngles = [];
//       const rotationOffset = Math.PI / 2;
//       const lastRingIndex = subspaces.length - 1;
//       for (let ringIndex = lastRingIndex; ringIndex >= 0; ringIndex--) {
//         const sectors = 2 ** (ringIndex + 1);
//         const totalPoints = pointsData[ringIndex].points.length || 1; 
//         const minAngle = 0.05 * (Math.PI * 2) / sectors; 
//         if (ringIndex === lastRingIndex) {
//           const emptySectors = sectorCounts[ringIndex].filter(count => count === 0).length;
//           const remainingAngle = 2 * Math.PI - (minAngle * emptySectors);

//           const angles = sectorCounts[ringIndex].map(count => {
//             return count === 0 ? minAngle : (count / totalPoints) * remainingAngle;
//           });

//           sectorAngles[ringIndex] = angles;
//         }
//         else {
//           const outerAngles = sectorAngles[ringIndex + 1];
//           const innerSectors = 2 ** (ringIndex + 1);
//           const outerSectors = 2 ** (ringIndex + 2);
//           const ratio = outerSectors / innerSectors;

//           const angles = [];
//           for (let i = 0; i < innerSectors; i++) {
//             let sumAngle = 0;
//             for (let j = 0; j < ratio; j++) {
//               const outerIdx = i * ratio + j;
//               sumAngle += outerAngles[outerIdx];
//             }
//             angles.push(sumAngle);
//           }

//           sectorAngles[ringIndex] = angles;
//         }
//       }

//       return sectorAngles;
//     };

//     const renderNormalView = () => {
//       subspaces.forEach((key, index) => {
//         if (!ringVisibility[key]) return;
//         const innerRadius = (index / subspaces.length) * maxRadius;
//         const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
//         const sectors = 2 ** (index + 1);
//         const rotationOffset = Math.PI / 2;

//         for (let i = 0; i < sectors; i++) {
//           const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
//           const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;

//           g.append("path")
//             .attr("d", d3.arc()
//               .innerRadius(innerRadius)
//               .outerRadius(outerRadius)
//               .startAngle(startAngle)
//               .endAngle(endAngle)
//             )
//             .attr("fill", getSectorColor(index, i))
//             .attr("fill-opacity", 0.3)
//             .attr("stroke", "black")
//             .attr("stroke-width", 0.5)
//             .style("cursor", "pointer");
//         }

//         g.append("text")
//           .attr("x", 0)
//           .attr("y", -outerRadius - 5)
//           .attr("text-anchor", "middle")
//           .attr("font-size", "16px")
//           .attr("fill", "red")
//           .attr("font-weight", "bold")
//           .text(ringLabels[index]);

//         renderPointsNormal(index, innerRadius, outerRadius, sectors);
//       });
//     };

//     const renderProportionalView = () => {
//       const sectorAngles = calculateRecursiveSectorAngles();
//       const rotationOffset = Math.PI / 2;

//       subspaces.forEach((key, index) => {
//         if (!ringVisibility[key]) return;
//         const innerRadius = (index / subspaces.length) * maxRadius;
//         const outerRadius = ((index + 1) / subspaces.length) * maxRadius;

//         // Draw sectors with their proportional angles
//         let currentAngle = rotationOffset;
//         sectorAngles[index].forEach((angle, i) => {
//           const startAngle = currentAngle;
//           const endAngle = currentAngle + angle;

//           g.append("path")
//             .attr("d", d3.arc()
//               .innerRadius(innerRadius)
//               .outerRadius(outerRadius)
//               .startAngle(startAngle)
//               .endAngle(endAngle)
//             )
//             .attr("fill", getSectorColor(index, i))
//             .attr("fill-opacity", 0.3)
//             .attr("stroke", "black")
//             .attr("stroke-width", 0.3)
//             .style("cursor", "pointer");

//           currentAngle = endAngle;
//         });

//         g.append("text")
//           .attr("x", 0)
//           .attr("y", -outerRadius - 5)
//           .attr("text-anchor", "middle")
//           .attr("font-size", "16px")
//           .attr("fill", "red")
//           .attr("font-weight", "bold")
//           .text(ringLabels[index]);

//         renderPointsProportional(index, innerRadius, outerRadius, sectorAngles[index]);
//       });
//     };

//     const renderPointsNormal = (index, innerRadius, outerRadius, sectors) => {
//       const rotationOffset = 0;
//       const anglePerSector = 2 * Math.PI / sectors;

//       pointsData[index].points.forEach((point, i) => {
//         const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
//         const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
//         const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

//         const startAngle = (anglePerSector * bitVectorIndex) + rotationOffset;
//         const centerAngle = startAngle + (anglePerSector / 2);

//         const totalPoints = pointsData[index].points.length;
//         const clusterFactor = 0.9;
//         const overlapRadius =
//           innerRadius +
//           (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) /
//           totalPoints;
//         const x = overlapRadius * Math.cos(centerAngle);
//         const y = overlapRadius * Math.sin(centerAngle);

//         storePointPosition(point, x, y, index);
//         drawPoint(point, x, y, index);
//       });
//     };

//     const renderPointsProportional = (index, innerRadius, outerRadius, sectorAngles) => {
//       const rotationOffset = 0;
//       const pointsBySector = {};
//       pointsData[index].points.forEach(point => {
//         const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
//         const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
//         const sectors = 2 ** (index + 1);
//         const sectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

//         if (!pointsBySector[sectorIndex]) {
//           pointsBySector[sectorIndex] = [];
//         }
//         pointsBySector[sectorIndex].push(point);
//       });

//       let currentAngle = rotationOffset;
//       const startAngles = sectorAngles.map((angle, i) => {
//         const startAngle = currentAngle;
//         currentAngle += angle;
//         return startAngle;
//       });

//       Object.entries(pointsBySector).forEach(([sectorIndex, points]) => {
//         const sectorIdx = parseInt(sectorIndex);
//         const startAngle = startAngles[sectorIdx];
//         const sectorAngle = sectorAngles[sectorIdx];
//         const centerAngle = startAngle + (sectorAngle / 2);

//         points.forEach((point, i) => {
//           const totalPointsInSector = points.length;
//           const clusterFactor = 0.9;
//           const overlapRadius =
//             innerRadius +
//             (clusterFactor * (outerRadius - innerRadius) * (i % Math.max(1, totalPointsInSector))) /
//             Math.max(1, totalPointsInSector);

//           const x = overlapRadius * Math.cos(centerAngle);
//           const y = overlapRadius * Math.sin(centerAngle);

//           storePointPosition(point, x, y, index);
//           drawPoint(point, x, y, index);
//         });
//       });
//     };

//     const storePointPosition = (point, x, y, index) => {
//       point.Point_ID.forEach((id) => {
//         if (!pointPositions[id]) {
//           pointPositions[id] = [];
//         }
//         pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
//       });
//     };

//     const drawPoint = (point, x, y, index) => {
//       g.append("circle")
//         .attr("cx", x)
//         .attr("cy", y)
//         .attr("r", 3)
//         .attr("fill", "black")
//         .attr("stroke", "white")
//         .attr("stroke-width", 0.5)
//         .style("pointer-events", "visible")
//         .on("mouseover", (event) => {
//           const pointIds = point.Point_ID.join(", ");
//           let associatedLabels = [];
//           if (labelsData && labelsData.labels) {
//             Object.entries(labelsData.labels).forEach(([label, pointList]) => {
//               if (point.Point_ID.some(id => pointList.includes(Number(id)))) {
//                 associatedLabels.push(label);
//               }
//             });
//           }
//           const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

//           tooltip
//             .style("visibility", "visible")
//             .html(
//               `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
//             );
//           setHoveredCoordinates({ ...point, label: labelText });
//         })
//         .on("mousemove", (event) => {
//           tooltip
//             .style("top", event.pageY + 10 + "px")
//             .style("left", event.pageX + 10 + "px");
//         })
//         .on("mouseout", () => {
//           tooltip.style("visibility", "hidden");
//           setHoveredCoordinates(null);
//         });
//     };

//     if (viewMode === "normal") {
//       renderNormalView();
//     } else if (viewMode === "proportional") {
//       renderProportionalView();
//     }

//     Object.entries(pointPositions).forEach(([pointId, positions]) => {
//       if (positions.length > 1) {
//         for (let i = 0; i < positions.length - 1; i++) {
//           const line = g.append("line")
//             .attr("x1", positions[i].x)
//             .attr("y1", positions[i].y)
//             .attr("x2", positions[i + 1].x)
//             .attr("y2", positions[i + 1].y)
//             .attr("stroke", getLabelColor(pointId))
//             .attr("stroke-width", 0.7)
//             .attr("stroke-opacity", 0.9)
//             .style("cursor", "pointer")
//             .on("mouseover", (event) => {
//               tooltip
//                 .style("visibility", "visible")
//                 .html(`Connection: Point_ID ${pointId}`);
//             })
//             .on("mousemove", (event) => {
//               tooltip
//                 .style("top", event.pageY + 10 + "px")
//                 .style("left", event.pageX + 10 + "px");
//             })
//             .on("mouseout", () => {
//               tooltip.style("visibility", "hidden");
//             });
//         }
//       }
//     });

//     const zoom = d3.zoom().on("zoom", (event) => {
//       g.attr("transform", event.transform);
//     });
//     svg.call(zoom);

//     return () => {
//       tooltip.remove();
//     };
//   }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

//   return (
//     <div style={{ width: "100%", height: "100%" }}>
//       <div style={{ marginBottom: "10px" }}>
//         <button
//           onClick={() => setViewMode("normal")}
//           style={{
//             marginRight: "10px",
//             padding: "5px 10px",
//             backgroundColor: viewMode === "normal" ? "#4CAF50" : "#f0f0f0",
//             color: viewMode === "normal" ? "white" : "black",
//           }}
//         >
//           Normal View
//         </button>
//         <button
//           onClick={() => setViewMode("proportional")}
//           style={{
//             padding: "5px 10px",
//             backgroundColor: viewMode === "proportional" ? "#4CAF50" : "#f0f0f0",
//             color: viewMode === "proportional" ? "white" : "black",
//           }}
//         >
//           Proportional View
//         </button>
//       </div>
//       <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
//     </div>
//   );
// };

// export default HierarchicalGraph;


import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
  const graphRef = useRef(null);
  const stripRef = useRef(null);
  const [viewMode, setViewMode] = useState("normal");

  useEffect(() => {
    if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
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
      points: jsonData[key] || [],
      dimensions: key.length,
      subspaceId: key,
    }));
    const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
    const pointPositions = {};
    const calculateSectorPointCounts = () => {
      const sectorCounts = subspaces.map((key, index) => {
        const sectors = 2 ** (index + 1);
        return Array(sectors).fill(0);
      });

      subspaces.forEach((key, index) => {
        const points = pointsData[index].points;
        const sectors = 2 ** (index + 1);

        points.forEach(point => {
          const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
          const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
          const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);
          sectorCounts[index][bitVectorIndex]++;
        });
      });

      return sectorCounts;
    };

    const calculateRecursiveSectorAngles = () => {
      const sectorCounts = calculateSectorPointCounts();
      const sectorAngles = [];
      const rotationOffset = Math.PI / 2;
      const lastRingIndex = subspaces.length - 1;
      for (let ringIndex = lastRingIndex; ringIndex >= 0; ringIndex--) {
        const sectors = 2 ** (ringIndex + 1);
        const totalPoints = pointsData[ringIndex].points.length || 1;
        const minAngle = 0.05 * (Math.PI * 2) / sectors;
        if (ringIndex === lastRingIndex) {
          const emptySectors = sectorCounts[ringIndex].filter(count => count === 0).length;
          const remainingAngle = 2 * Math.PI - (minAngle * emptySectors);

          const angles = sectorCounts[ringIndex].map(count => {
            return count === 0 ? minAngle : (count / totalPoints) * remainingAngle;
          });

          sectorAngles[ringIndex] = angles;
        }
        else {
          const outerAngles = sectorAngles[ringIndex + 1];
          const innerSectors = 2 ** (ringIndex + 1);
          const outerSectors = 2 ** (ringIndex + 2);
          const ratio = outerSectors / innerSectors;

          const angles = [];
          for (let i = 0; i < innerSectors; i++) {
            let sumAngle = 0;
            for (let j = 0; j < ratio; j++) {
              const outerIdx = i * ratio + j;
              sumAngle += outerAngles[outerIdx];
            }
            angles.push(sumAngle);
          }

          sectorAngles[ringIndex] = angles;
        }
      }

      return sectorAngles;
    };

    const renderNormalView = () => {
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
        }

        g.append("text")
          .attr("x", 0)
          .attr("y", -outerRadius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("fill", "red")
          .attr("font-weight", "bold")
          .text(ringLabels[index]);

        renderPointsNormal(index, innerRadius, outerRadius, sectors);
      });
    };

    const renderProportionalView = () => {
      const sectorAngles = calculateRecursiveSectorAngles();
      const rotationOffset = Math.PI / 2;

      subspaces.forEach((key, index) => {
        if (!ringVisibility[key]) return;
        const innerRadius = (index / subspaces.length) * maxRadius;
        const outerRadius = ((index + 1) / subspaces.length) * maxRadius;

        let currentAngle = rotationOffset;
        sectorAngles[index].forEach((angle, i) => {
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

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
            .attr("stroke-width", 0.3)
            .style("cursor", "pointer");

          currentAngle = endAngle;
        });

        g.append("text")
          .attr("x", 0)
          .attr("y", -outerRadius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("fill", "red")
          .attr("font-weight", "bold")
          .text(ringLabels[index]);

        renderPointsProportional(index, innerRadius, outerRadius, sectorAngles[index]);
      });
    };

    const renderPointsNormal = (index, innerRadius, outerRadius, sectors) => {
      const rotationOffset = 0;
      const anglePerSector = 2 * Math.PI / sectors;

      pointsData[index].points.forEach((point, i) => {
        const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
        const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
        const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

        const startAngle = (anglePerSector * bitVectorIndex) + rotationOffset;
        const centerAngle = startAngle + (anglePerSector / 2);

        const totalPoints = pointsData[index].points.length;
        const clusterFactor = 0.9;
        const overlapRadius =
          innerRadius +
          (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) /
          totalPoints;
        const x = overlapRadius * Math.cos(centerAngle);
        const y = overlapRadius * Math.sin(centerAngle);

        storePointPosition(point, x, y, index);
        drawPoint(point, x, y, index);
      });
    };

    const renderPointsProportional = (index, innerRadius, outerRadius, sectorAngles) => {
      const rotationOffset = 0;
      const pointsBySector = {};
      pointsData[index].points.forEach(point => {
        const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
        const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
        const sectors = 2 ** (index + 1);
        const sectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

        if (!pointsBySector[sectorIndex]) {
          pointsBySector[sectorIndex] = [];
        }
        pointsBySector[sectorIndex].push(point);
      });

      let currentAngle = rotationOffset;
      const startAngles = sectorAngles.map((angle, i) => {
        const startAngle = currentAngle;
        currentAngle += angle;
        return startAngle;
      });

      Object.entries(pointsBySector).forEach(([sectorIndex, points]) => {
        const sectorIdx = parseInt(sectorIndex);
        const startAngle = startAngles[sectorIdx];
        const sectorAngle = sectorAngles[sectorIdx];
        const centerAngle = startAngle + (sectorAngle / 2);

        points.forEach((point, i) => {
          const totalPointsInSector = points.length;
          const clusterFactor = 0.9;
          const overlapRadius =
            innerRadius +
            (clusterFactor * (outerRadius - innerRadius) * (i % Math.max(1, totalPointsInSector))) /
            Math.max(1, totalPointsInSector);

          const x = overlapRadius * Math.cos(centerAngle);
          const y = overlapRadius * Math.sin(centerAngle);

          storePointPosition(point, x, y, index);
          drawPoint(point, x, y, index);
        });
      });
    };

    const storePointPosition = (point, x, y, index) => {
      point.Point_ID.forEach((id) => {
        if (!pointPositions[id]) {
          pointPositions[id] = [];
        }
        pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
      });
    };

    const drawPoint = (point, x, y, index) => {
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
              `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
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
    };

    if (viewMode === "normal") {
      renderNormalView();
    } else if (viewMode === "proportional") {
      renderProportionalView();
    }

    Object.entries(pointPositions).forEach(([pointId, positions]) => {
      if (positions.length > 1) {
        for (let i = 0; i < positions.length - 1; i++) {
          const line = g.append("line")
            .attr("x1", positions[i].x)
            .attr("y1", positions[i].y)
            .attr("x2", positions[i + 1].x)
            .attr("y2", positions[i + 1].y)
            .attr("stroke", getLabelColor(pointId))
            .attr("stroke-width", 0.7)
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
            });
        }
      }
    });

    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    // Add strip visualization for the last ring
    const strip = d3.select(stripRef.current);
    strip.selectAll("*").remove();

    const lastRingIndex = subspaces.length - 1;
    const lastRingKey = subspaces[lastRingIndex];

    if (ringVisibility[lastRingKey]) {
      const stripWidth = 1100;
      const stripHeight = 200;
      const stripMargin = { top: 20, right: 20, bottom: 20, left: 20 };

      const stripG = strip
        .attr("width", stripWidth)
        .attr("height", stripHeight)
        .append("g")
        .attr("transform", `translate(${stripMargin.left}, ${stripMargin.top})`);

      const sectors = 2 ** (lastRingIndex + 1);
      const sectorWidth = (stripWidth - stripMargin.left - stripMargin.right) / sectors;
      const availableHeight = stripHeight - stripMargin.top - stripMargin.bottom;

      // Group points by sector
      const pointsBySector = {};
      pointsData[lastRingIndex].points.forEach(point => {
        const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
        const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
        const sectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

        if (!pointsBySector[sectorIndex]) {
          pointsBySector[sectorIndex] = [];
        }
        pointsBySector[sectorIndex].push(point);
      });

      // Draw sectors in the strip
      for (let i = 0; i < sectors; i++) {
        const sectorX = i * sectorWidth;

        // Draw sector background
        stripG.append("rect")
          .attr("x", sectorX)
          .attr("y", 0)
          .attr("width", sectorWidth)
          .attr("height", availableHeight)
          .attr("fill", getSectorColor(lastRingIndex, i))
          .attr("fill-opacity", 0.3)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);

        const sectorPoints = pointsBySector[i] || [];
        const numPoints = sectorPoints.length;

        if (numPoints > 0) {
          // Calculate min and max values for this sector
          const values = sectorPoints.map(point => {
            const coords = Object.entries(point).filter(([key]) => key !== "Point_ID");
            return coords.reduce((sum, [_, coord]) => sum + Math.abs(coord), 0) / coords.length;
          });

          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const valueRange = maxValue - minValue || 1; // Avoid division by zero

          // Draw horizontal lines for each point
          const lineSpacing = availableHeight / (numPoints + 1);

          sectorPoints.forEach((point, j) => {
            const y = (j + 1) * lineSpacing;

            // Draw the horizontal line
            stripG.append("line")
              .attr("x1", sectorX)
              .attr("y1", y)
              .attr("x2", sectorX + sectorWidth)
              .attr("y2", y)
              .attr("stroke", "#ddd")
              .attr("stroke-width", 1);

            // Calculate point position based on its value
            const coords = Object.entries(point).filter(([key]) => key !== "Point_ID");
            const value = coords.reduce((sum, [_, coord]) => sum + Math.abs(coord), 0) / coords.length;
            const normalizedValue = (value - minValue) / valueRange;
            const x = sectorX + normalizedValue * sectorWidth;

            // Draw the point
            stripG.append("circle")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", 3)
              .attr("fill", "black")
              .attr("stroke", "white")
              .attr("stroke-width", 0.5)
              .style("cursor", "pointer")
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
                    `Point_IDs: ${pointIds}<br>Value: ${value.toFixed(2)}<br>Sector: ${i}<br>Label: ${labelText}`
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
        }

        // Add sector label
        stripG.append("text")
          .attr("x", sectorX + sectorWidth / 2)
          .attr("y", availableHeight + 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text(`Sector ${i}`);
      }

      // Add title for the strip
      stripG.append("text")
        .attr("x", (stripWidth - stripMargin.left - stripMargin.right) / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`Linear Strip Visualization - Ring ${ringLabels[lastRingIndex]}`);
    }

    return () => {
      tooltip.remove();
    };
  }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setViewMode("normal")}
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: viewMode === "normal" ? "#4CAF50" : "#f0f0f0",
            color: viewMode === "normal" ? "white" : "black",
          }}
        >
          Normal View
        </button>
        <button
          onClick={() => setViewMode("proportional")}
          style={{
            padding: "5px 10px",
            backgroundColor: viewMode === "proportional" ? "#4CAF50" : "#f0f0f0",
            color: viewMode === "proportional" ? "white" : "black",
          }}
        >
          Proportional View
        </button>
      </div>
      <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
      <svg ref={stripRef} style={{ width: "100%", height: "200px", marginTop: "20px" }}></svg>
    </div>
  );
};

export default HierarchicalGraph;