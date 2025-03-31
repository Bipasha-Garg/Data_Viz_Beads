// // // import React, { useEffect, useRef, useState } from "react";
// // // import * as d3 from "d3";

// // // const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
// // //   const graphRef = useRef(null);
// // //   const [viewMode, setViewMode] = useState("normal");

// // //   useEffect(() => {
// // //     if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
// // //       console.error("Invalid or empty jsonData:", jsonData);
// // //       return;
// // //     }

// // //     if (!labelsData || typeof labelsData !== "object") {
// // //       console.error("Invalid labelsData:", labelsData);
// // //       return;
// // //     }

// // //     const svg = d3.select(graphRef.current);
// // //     svg.selectAll("*").remove();

// // //     const width = 800;
// // //     const height = 800;
// // //     const margin = 20;
// // //     const maxRadius = Math.min(width, height) / 2 - margin;

// // //     const g = svg
// // //       .attr("width", width)
// // //       .attr("height", height)
// // //       .append("g")
// // //       .attr("transform", `translate(${width / 2}, ${height / 2})`);

// // //     const tooltip = d3
// // //       .select("body")
// // //       .append("div")
// // //       .attr("class", "tooltip")
// // //       .style("position", "absolute")
// // //       .style("visibility", "hidden")
// // //       .style("background-color", "rgba(0, 0, 0, 0.7)")
// // //       .style("color", "white")
// // //       .style("padding", "5px")
// // //       .style("border-radius", "4px")
// // //       .style("font-size", "12px");

// // //     const getLabelColor = (pointId) => {
// // //       if (!labelsData || !labelsData.labels) return "gray";
// // //       for (const label of Object.keys(labelsData.labels)) {
// // //         const pointList = labelsData.labels[label];
// // //         if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
// // //           return colorScale(label);
// // //         }
// // //       }
// // //       return "gray";
// // //     };

// // //     const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
// // //     const getRingColor = (index) => {
// // //       const totalRings = Object.keys(jsonData).length;
// // //       const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
// // //       return d3.color(colorScaleInd(index));
// // //     };
// // //     const getSectorColor = (index, sectorIndex) => {
// // //       const baseColor = d3.hsl(getRingColor(index));
// // //       const isPositive = sectorIndex % 2 === 0;
// // //       return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
// // //     };

// // //     const subspaces = Object.keys(jsonData);
// // //     subspaces.sort((a, b) => a.length - b.length);
// // //     const pointsData = subspaces.map((key) => ({
// // //       key,
// // //       points: jsonData[key] || [],
// // //       dimensions: key.length,
// // //       subspaceId: key,
// // //     }));
// // //     console.log("Points data:", pointsData.dimensions);
// // //     const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
// // //     const pointPositions = {};

// // //     const renderNormalView = () => {
// // //       subspaces.forEach((key, index) => {
// // //         if (!ringVisibility[key]) return;
// // //         const innerRadius = (index / subspaces.length) * maxRadius;
// // //         const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// // //         const sectors = 2 ** (index + 1);
// // //         const rotationOffset = Math.PI / 2;

// // //         for (let i = 0; i < sectors; i++) {
// // //           const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
// // //           const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;

// // //           g.append("path")
// // //             .attr("d", d3.arc()
// // //               .innerRadius(innerRadius)
// // //               .outerRadius(outerRadius)
// // //               .startAngle(startAngle)
// // //               .endAngle(endAngle)
// // //             )
// // //             .attr("fill", getSectorColor(index, i))
// // //             .attr("fill-opacity", 0.3)
// // //             .attr("stroke", "black")
// // //             .attr("stroke-width", 0.5)
// // //             .style("cursor", "pointer");

// // //           g.append("text")
// // //             .attr("x", 0)
// // //             .attr("y", -outerRadius - 5)
// // //             .attr("text-anchor", "middle")
// // //             .attr("font-size", "16px")
// // //             .attr("fill", "red")
// // //             .attr("font-weight", "bold")
// // //             .text(ringLabels[index]);
// // //         }
// // //         renderPoints(index, innerRadius, outerRadius, sectors);
// // //       });
// // //     };


// // //     const renderPoints = (index, innerRadius, outerRadius, anglesOrSectors) => {
// // //       const isProportional = viewMode === "proportional";
// // //       const sectors = isProportional ? anglesOrSectors.length : anglesOrSectors;
// // //       const angles = isProportional ? anglesOrSectors : Array(sectors).fill(2 * Math.PI / sectors);

// // //       let currentAngle = Math.PI / 2;
// // //       pointsData[index].points.forEach((point, i) => {
// // //         const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
// // //         const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
// // //         const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

// // //         const startAngle = isProportional ?
// // //           currentAngle + angles.slice(0, bitVectorIndex).reduce((a, b) => a + b, 0) :
// // //           (2 * Math.PI * bitVectorIndex) / sectors;
// // //         const angleWidth = isProportional ? angles[bitVectorIndex] : (2 * Math.PI / sectors);
// // //         const centerAngle = startAngle + angleWidth / 2;

// // //         const minRadius = innerRadius;
// // //         const maxRadius = outerRadius;
// // //         const randomRadius = minRadius + Math.random() * (maxRadius - minRadius);
// // //         const totalPoints = pointsData[index].points.length;
// // //         const clusterFactor = 0.9;
// // //         const overlapRadius =
// // //           innerRadius +
// // //           (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) /
// // //           totalPoints;
// // //         const x = overlapRadius * Math.cos(centerAngle);
// // //         const y = overlapRadius * Math.sin(centerAngle);

// // //         point.Point_ID.forEach((id) => {
// // //           if (!pointPositions[id]) {
// // //             pointPositions[id] = [];
// // //           }
// // //           pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
// // //         });

// // //         g.append("circle")
// // //           .attr("cx", x)
// // //           .attr("cy", y)
// // //           .attr("r", 3)
// // //           .attr("fill", "black")
// // //           .attr("stroke", "white")
// // //           .attr("stroke-width", 0.5)
// // //           .style("pointer-events", "visible")
// // //           .on("mouseover", (event) => {
// // //             const pointIds = point.Point_ID.join(", ");
// // //             let associatedLabels = [];
// // //             if (labelsData && labelsData.labels) {
// // //               Object.entries(labelsData.labels).forEach(([label, pointList]) => {
// // //                 if (point.Point_ID.some(id => pointList.includes(Number(id)))) {
// // //                   associatedLabels.push(label);
// // //                 }
// // //               });
// // //             }
// // //             const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

// // //             tooltip
// // //               .style("visibility", "visible")
// // //               .html(
// // //                 `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
// // //               );
// // //             setHoveredCoordinates({ ...point, label: labelText });
// // //           })
// // //           .on("mousemove", (event) => {
// // //             tooltip
// // //               .style("top", event.pageY + 10 + "px")
// // //               .style("left", event.pageX + 10 + "px");
// // //           })
// // //           .on("mouseout", () => {
// // //             tooltip.style("visibility", "hidden");
// // //             setHoveredCoordinates(null);
// // //           });
// // //       });
// // //     };

// // //     if (viewMode === "normal") {
// // //       renderNormalView();
// // //     } 
// // //     Object.entries(pointPositions).forEach(([pointId, positions]) => {
// // //       if (positions.length > 1) {
// // //         for (let i = 0; i < positions.length - 1; i++) {
// // //           const line = g.append("line")
// // //             .attr("x1", positions[i].x)
// // //             .attr("y1", positions[i].y)
// // //             .attr("x2", positions[i + 1].x)
// // //             .attr("y2", positions[i + 1].y)
// // //             .attr("stroke", getLabelColor(pointId))
// // //             .attr("stroke-width", 1.5)
// // //             .attr("stroke-opacity", 0.9)
// // //             .style("cursor", "pointer")
// // //             .on("mouseover", (event) => {
// // //               tooltip
// // //                 .style("visibility", "visible")
// // //                 .html(`Connection: Point_ID ${pointId}`);
// // //             })
// // //             .on("mousemove", (event) => {
// // //               tooltip
// // //                 .style("top", event.pageY + 10 + "px")
// // //                 .style("left", event.pageX + 10 + "px");
// // //             })
// // //             .on("mouseout", () => {
// // //               tooltip.style("visibility", "hidden");
// // //             });
// // //         }
// // //       }
// // //     });

// // //     const zoom = d3.zoom().on("zoom", (event) => {
// // //       g.attr("transform", event.transform);
// // //     });
// // //     svg.call(zoom);

// // //     return () => {
// // //       tooltip.remove();
// // //     };
// // //   }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

// // //   return (
// // //     <div style={{ width: "100%", height: "100%" }}>
// // //       <div style={{ marginBottom: "10px" }}>
// // //         <button
// // //           onClick={() => setViewMode("normal")}
// // //           style={{
// // //             marginRight: "10px",
// // //             padding: "5px 10px",
// // //             backgroundColor: viewMode === "normal" ? "#4CAF50" : "#f0f0f0",
// // //             color: viewMode === "normal" ? "white" : "black",
// // //           }}
// // //         >
// // //           Normal View
// // //         </button>
// // //         <button
// // //           onClick={() => setViewMode("proportional")}
// // //           style={{
// // //             padding: "5px 10px",
// // //             backgroundColor: viewMode === "proportional" ? "#4CAF50" : "#f0f0f0",
// // //             color: viewMode === "proportional" ? "white" : "black",
// // //           }}
// // //         >
// // //           Proportional View
// // //         </button>
// // //       </div>
// // //       <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
// // //     </div>
// // //   );
// // // };

// // // export default HierarchicalGraph;


// // import React, { useEffect, useRef, useState } from "react";
// // import * as d3 from "d3";

// // const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
// //   const graphRef = useRef(null);
// //   const [viewMode, setViewMode] = useState("normal");

// //   useEffect(() => {
// //     if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
// //       console.error("Invalid or empty jsonData:", jsonData);
// //       return;
// //     }

// //     if (!labelsData || typeof labelsData !== "object") {
// //       console.error("Invalid labelsData:", labelsData);
// //       return;
// //     }

// //     const svg = d3.select(graphRef.current);
// //     svg.selectAll("*").remove();

// //     const width = 800;
// //     const height = 800;
// //     const margin = 20;
// //     const maxRadius = Math.min(width, height) / 2 - margin;

// //     const g = svg
// //       .attr("width", width)
// //       .attr("height", height)
// //       .append("g")
// //       .attr("transform", `translate(${width / 2}, ${height / 2})`);

// //     const tooltip = d3
// //       .select("body")
// //       .append("div")
// //       .attr("class", "tooltip")
// //       .style("position", "absolute")
// //       .style("visibility", "hidden")
// //       .style("background-color", "rgba(0, 0, 0, 0.7)")
// //       .style("color", "white")
// //       .style("padding", "5px")
// //       .style("border-radius", "4px")
// //       .style("font-size", "12px");

// //     const getLabelColor = (pointId) => {
// //       if (!labelsData || !labelsData.labels) return "gray";
// //       for (const label of Object.keys(labelsData.labels)) {
// //         const pointList = labelsData.labels[label];
// //         if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
// //           return colorScale(label);
// //         }
// //       }
// //       return "gray";
// //     };

// //     const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
// //     const getRingColor = (index) => {
// //       const totalRings = Object.keys(jsonData).length;
// //       const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
// //       return d3.color(colorScaleInd(index));
// //     };
// //     const getSectorColor = (index, sectorIndex) => {
// //       const baseColor = d3.hsl(getRingColor(index));
// //       const isPositive = sectorIndex % 2 === 0;
// //       return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
// //     };

// //     const subspaces = Object.keys(jsonData);
// //     subspaces.sort((a, b) => a.length - b.length);
// //     const pointsData = subspaces.map((key) => ({
// //       key,
// //       points: jsonData[key] || [],
// //       dimensions: key.length,
// //       subspaceId: key,
// //     }));
// //     const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
// //     const pointPositions = {};

// //     const calculateProportionalAngles = (index) => {
// //       const sectors = 2 ** (index + 1);
// //       const points = pointsData[index].points;
// //       const sectorCounts = Array(sectors).fill(0);
// //       const minAngle = 0.1 * (Math.PI * 2) / sectors;

// //       points.forEach(point => {
// //         const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
// //         const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
// //         const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);
// //         sectorCounts[bitVectorIndex]++;
// //       });

// //       const totalPoints = points.length || 1; // Avoid division by zero
// //       const remainingAngle = 2 * Math.PI - (minAngle * sectorCounts.filter(count => count === 0).length);

// //       return sectorCounts.map(count => {
// //         if (count === 0) return minAngle;
// //         return (count / totalPoints) * remainingAngle;
// //       });
// //     };

// //     const renderNormalView = () => {
// //       subspaces.forEach((key, index) => {
// //         if (!ringVisibility[key]) return;
// //         const innerRadius = (index / subspaces.length) * maxRadius;
// //         const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// //         const sectors = 2 ** (index + 1);
// //         const rotationOffset = Math.PI / 2;

// //         for (let i = 0; i < sectors; i++) {
// //           const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
// //           const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;

// //           g.append("path")
// //             .attr("d", d3.arc()
// //               .innerRadius(innerRadius)
// //               .outerRadius(outerRadius)
// //               .startAngle(startAngle)
// //               .endAngle(endAngle)
// //             )
// //             .attr("fill", getSectorColor(index, i))
// //             .attr("fill-opacity", 0.3)
// //             .attr("stroke", "black")
// //             .attr("stroke-width", 0.5)
// //             .style("cursor", "pointer");
// //         }

// //         g.append("text")
// //           .attr("x", 0)
// //           .attr("y", -outerRadius - 5)
// //           .attr("text-anchor", "middle")
// //           .attr("font-size", "16px")
// //           .attr("fill", "red")
// //           .attr("font-weight", "bold")
// //           .text(ringLabels[index]);

// //         renderPoints(index, innerRadius, outerRadius, sectors);
// //       });
// //     };

// //     const renderProportionalView = () => {
// //       subspaces.forEach((key, index) => {
// //         if (!ringVisibility[key]) return;
// //         const innerRadius = (index / subspaces.length) * maxRadius;
// //         const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// //         const rotationOffset = Math.PI / 2;

// //         const proportionalAngles = calculateProportionalAngles(index);

// //         let currentAngle = rotationOffset;
// //         proportionalAngles.forEach((angle, i) => {
// //           const startAngle = currentAngle;
// //           const endAngle = currentAngle + angle;

// //           g.append("path")
// //             .attr("d", d3.arc()
// //               .innerRadius(innerRadius)
// //               .outerRadius(outerRadius)
// //               .startAngle(startAngle)
// //               .endAngle(endAngle)
// //             )
// //             .attr("fill", getSectorColor(index, i))
// //             .attr("fill-opacity", 0.3)
// //             .attr("stroke", "black")
// //             .attr("stroke-width", 0.5)
// //             .style("cursor", "pointer");

// //           currentAngle = endAngle;
// //         });

// //         g.append("text")
// //           .attr("x", 0)
// //           .attr("y", -outerRadius - 5)
// //           .attr("text-anchor", "middle")
// //           .attr("font-size", "16px")
// //           .attr("fill", "red")
// //           .attr("font-weight", "bold")
// //           .text(ringLabels[index]);

// //         renderPoints(index, innerRadius, outerRadius, proportionalAngles);
// //       });
// //     };

// //     const renderPoints = (index, innerRadius, outerRadius, anglesOrSectors) => {
// //       const isProportional = viewMode === "proportional";
// //       const sectors = isProportional ? anglesOrSectors.length : anglesOrSectors;
// //       const angles = isProportional ? anglesOrSectors : Array(sectors).fill(2 * Math.PI / sectors);
// //       const rotationOffset = Math.PI / 2;

// //       pointsData[index].points.forEach((point, i) => {
// //         const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
// //         const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
// //         const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

// //         let startAngle = rotationOffset;
// //         if (isProportional) {
// //           for (let j = 0; j < bitVectorIndex; j++) {
// //             startAngle += angles[j];
// //           }
// //         } else {
// //           startAngle += (2 * Math.PI * bitVectorIndex) / sectors;
// //         }

// //         const angleWidth = angles[bitVectorIndex];
// //         const centerAngle = startAngle + angleWidth / 2;

// //         const totalPoints = pointsData[index].points.length;
// //         const clusterFactor = 0.9;
// //         const overlapRadius =
// //           innerRadius +
// //           (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) /
// //           totalPoints;
// //         const x = overlapRadius * Math.cos(centerAngle);
// //         const y = overlapRadius * Math.sin(centerAngle);

// //         point.Point_ID.forEach((id) => {
// //           if (!pointPositions[id]) {
// //             pointPositions[id] = [];
// //           }
// //           pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
// //         });

// //         g.append("circle")
// //           .attr("cx", x)
// //           .attr("cy", y)
// //           .attr("r", 3)
// //           .attr("fill", "black")
// //           .attr("stroke", "white")
// //           .attr("stroke-width", 0.5)
// //           .style("pointer-events", "visible")
// //           .on("mouseover", (event) => {
// //             const pointIds = point.Point_ID.join(", ");
// //             let associatedLabels = [];
// //             if (labelsData && labelsData.labels) {
// //               Object.entries(labelsData.labels).forEach(([label, pointList]) => {
// //                 if (point.Point_ID.some(id => pointList.includes(Number(id)))) {
// //                   associatedLabels.push(label);
// //                 }
// //               });
// //             }
// //             const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

// //             tooltip
// //               .style("visibility", "visible")
// //               .html(
// //                 `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
// //               );
// //             setHoveredCoordinates({ ...point, label: labelText });
// //           })
// //           .on("mousemove", (event) => {
// //             tooltip
// //               .style("top", event.pageY + 10 + "px")
// //               .style("left", event.pageX + 10 + "px");
// //           })
// //           .on("mouseout", () => {
// //             tooltip.style("visibility", "hidden");
// //             setHoveredCoordinates(null);
// //           });
// //       });
// //     };

// //     if (viewMode === "normal") {
// //       renderNormalView();
// //     } else if (viewMode === "proportional") {
// //       renderProportionalView();
// //     }

// //     Object.entries(pointPositions).forEach(([pointId, positions]) => {
// //       if (positions.length > 1) {
// //         for (let i = 0; i < positions.length - 1; i++) {
// //           const line = g.append("line")
// //             .attr("x1", positions[i].x)
// //             .attr("y1", positions[i].y)
// //             .attr("x2", positions[i + 1].x)
// //             .attr("y2", positions[i + 1].y)
// //             .attr("stroke", getLabelColor(pointId))
// //             .attr("stroke-width", 1.5)
// //             .attr("stroke-opacity", 0.9)
// //             .style("cursor", "pointer")
// //             .on("mouseover", (event) => {
// //               tooltip
// //                 .style("visibility", "visible")
// //                 .html(`Connection: Point_ID ${pointId}`);
// //             })
// //             .on("mousemove", (event) => {
// //               tooltip
// //                 .style("top", event.pageY + 10 + "px")
// //                 .style("left", event.pageX + 10 + "px");
// //             })
// //             .on("mouseout", () => {
// //               tooltip.style("visibility", "hidden");
// //             });
// //         }
// //       }
// //     });

// //     const zoom = d3.zoom().on("zoom", (event) => {
// //       g.attr("transform", event.transform);
// //     });
// //     svg.call(zoom);

// //     return () => {
// //       tooltip.remove();
// //     };
// //   }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

// //   return (
// //     <div style={{ width: "100%", height: "100%" }}>
// //       <div style={{ marginBottom: "10px" }}>
// //         <button
// //           onClick={() => setViewMode("normal")}
// //           style={{
// //             marginRight: "10px",
// //             padding: "5px 10px",
// //             backgroundColor: viewMode === "normal" ? "#4CAF50" : "#f0f0f0",
// //             color: viewMode === "normal" ? "white" : "black",
// //           }}
// //         >
// //           Normal View
// //         </button>
// //         <button
// //           onClick={() => setViewMode("proportional")}
// //           style={{
// //             padding: "5px 10px",
// //             backgroundColor: viewMode === "proportional" ? "#4CAF50" : "#f0f0f0",
// //             color: viewMode === "proportional" ? "white" : "black",
// //           }}
// //         >
// //           Proportional View
// //         </button>
// //       </div>
// //       <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
// //     </div>
// //   );
// // };

// // export default HierarchicalGraph;


import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
  const graphRef = useRef(null);
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
      dimensions: key.length || 1, // Ensure dimensions is at least 1
      subspaceId: key,
    }));
    const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
    const pointPositions = {};

    const calculateProportionalAngles = (index) => {
      if (index < 0 || index >= pointsData.length) {
        console.error("Invalid index:", index);
        return Array(2).fill(Math.PI); // Return a safe default
      }

      const currentSubspace = pointsData[index];
      const dimensions = Math.max(1, currentSubspace.dimensions);

      // Calculate sectors based on dimensions, with a safe upper limit
      const maxSafeDimensions = 10; // Limit to prevent excessive sectors
      const safeDimensions = Math.min(dimensions, maxSafeDimensions);
      const sectors = Math.pow(2, safeDimensions);

      // Ensure sectors is a safe number
      if (!Number.isFinite(sectors) || sectors <= 0 || sectors > 1024) {
        console.error("Invalid sectors calculation:", { index, dimensions, sectors });
        return Array(2).fill(Math.PI); // Return a safe default
      }

      // Initialize angles array with the correct size
      const sectorAngles = Array(sectors).fill(0);

      if (index === pointsData.length - 1) { // Outermost ring
        const sectorCounts = Array(sectors).fill(0);
        const minAngle = 0.1 * (Math.PI * 2) / sectors;

        // Count points in each sector
        if (Array.isArray(currentSubspace.points)) {
          currentSubspace.points.forEach(point => {
            const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");

            // Ensure we don't exceed the number of dimensions we can handle
            const limitedPointData = pointData.slice(0, safeDimensions);

            // Create bit vector based on coordinates
            const bitVector = limitedPointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");

            // Parse bit vector to get sector index with safe fallback
            let bitVectorIndex;
            try {
              bitVectorIndex = parseInt(bitVector, 2);
              if (isNaN(bitVectorIndex)) bitVectorIndex = 0;
            } catch (e) {
              bitVectorIndex = 0;
            }

            // Ensure index is within bounds
            bitVectorIndex = Math.min(bitVectorIndex, sectors - 1);
            sectorCounts[bitVectorIndex]++;
          });
        }

        const totalPoints = currentSubspace.points.length || 1;
        const emptyCount = sectorCounts.filter(count => count === 0).length;
        const remainingAngle = 2 * Math.PI - (minAngle * emptyCount);
        const pointTotal = sectorCounts.reduce((sum, count) => sum + count, 0);

        // Calculate proportional angles
        for (let i = 0; i < sectors; i++) {
          if (sectorCounts[i] === 0) {
            sectorAngles[i] = minAngle;
          } else {
            sectorAngles[i] = (sectorCounts[i] / (pointTotal || 1)) * remainingAngle;
          }
        }

        return sectorAngles;
      } else { // Inner rings
        // Get angles from next ring
        let nextRingAngles = [];
        try {
          nextRingAngles = calculateProportionalAngles(index + 1);
        } catch (e) {
          console.error("Error calculating next ring angles:", e);
          return Array(sectors).fill(2 * Math.PI / sectors); // Safe fallback
        }

        // If next ring doesn't have valid angles, use equal distribution
        if (!nextRingAngles || nextRingAngles.length === 0) {
          return Array(sectors).fill(2 * Math.PI / sectors);
        }

        // Create angles for this ring by combining pairs from next ring
        for (let i = 0; i < sectors; i++) {
          const childIndex1 = i * 2;
          const childIndex2 = i * 2 + 1;

          // Safely get angles from next ring
          const angle1 = childIndex1 < nextRingAngles.length ? nextRingAngles[childIndex1] : 0;
          const angle2 = childIndex2 < nextRingAngles.length ? nextRingAngles[childIndex2] : 0;

          sectorAngles[i] = angle1 + angle2;
        }

        return sectorAngles;
      }
    };

    const renderNormalView = () => {
      subspaces.forEach((key, index) => {
        if (!ringVisibility[key]) return;
        const innerRadius = (index / subspaces.length) * maxRadius;
        const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
        const sectors = Math.pow(2, index + 1);
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

        renderPoints(index, innerRadius, outerRadius, sectors);
      });
    };

    const renderProportionalView = () => {
      for (let index = subspaces.length - 1; index >= 0; index--) {
        if (!ringVisibility[pointsData[index].key]) continue;

        const innerRadius = (index / subspaces.length) * maxRadius;
        const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
        const rotationOffset = Math.PI / 2;

        let proportionalAngles;
        try {
          proportionalAngles = calculateProportionalAngles(index);
        } catch (e) {
          console.error("Error calculating proportional angles:", e);
          // Fallback to equal distribution
          const safeSectors = Math.pow(2, Math.min(index + 1, 8));
          proportionalAngles = Array(safeSectors).fill(2 * Math.PI / safeSectors);
        }

        // Validate proportionalAngles
        if (!Array.isArray(proportionalAngles) || proportionalAngles.length === 0) {
          console.error("Invalid angles for index:", index);
          continue;
        }

        let currentAngle = rotationOffset;

        // Render sectors in the same order as normal view
        for (let i = 0; i < proportionalAngles.length; i++) {
          const angle = proportionalAngles[i];

          // Ensure angle is a valid number
          if (typeof angle !== 'number' || !isFinite(angle)) {
            console.error("Invalid angle:", angle);
            continue;
          }

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
            .attr("stroke-width", 0.5)
            .style("cursor", "pointer");

          currentAngle = endAngle;
        }

        g.append("text")
          .attr("x", 0)
          .attr("y", -outerRadius - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("fill", "red")
          .attr("font-weight", "bold")
          .text(ringLabels[index]);

        renderPoints(index, innerRadius, outerRadius, proportionalAngles);
      }
    };

    const renderPoints = (index, innerRadius, outerRadius, anglesOrSectors) => {
      const isProportional = viewMode === "proportional";
      const points = pointsData[index].points;

      if (!Array.isArray(points) || points.length === 0) {
        return; // No points to render
      }

      // Ensure we have valid angles or sectors
      let sectors, angles;
      if (isProportional) {
        if (!Array.isArray(anglesOrSectors) || anglesOrSectors.length === 0) {
          console.error("Invalid angles for point rendering:", anglesOrSectors);
          return;
        }
        sectors = anglesOrSectors.length;
        angles = anglesOrSectors;
      } else {
        if (!Number.isFinite(anglesOrSectors) || anglesOrSectors <= 0) {
          console.error("Invalid sectors for point rendering:", anglesOrSectors);
          return;
        }
        sectors = anglesOrSectors;
        angles = Array(sectors).fill(2 * Math.PI / sectors);
      }

      const rotationOffset = Math.PI / 2;
      const dimensions = Math.min(pointsData[index].dimensions, 10); // Limit dimensions

      points.forEach((point, i) => {
        if (!point || typeof point !== 'object') {
          console.error("Invalid point:", point);
          return;
        }

        const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");

        // Ensure we don't exceed the number of dimensions we can handle
        const limitedPointData = pointData.slice(0, dimensions);

        // Create bit vector based on coordinates
        const bitVector = limitedPointData.map(([_, coord]) => {
          const num = parseFloat(coord);
          return isNaN(num) ? 0 : (num >= 0 ? 1 : 0);
        }).join("");

        // Parse bit vector to get sector index with safe fallback
        let bitVectorIndex;
        try {
          bitVectorIndex = parseInt(bitVector, 2);
          if (isNaN(bitVectorIndex)) bitVectorIndex = 0;
        } catch (e) {
          bitVectorIndex = 0;
        }

        // Ensure index is within bounds
        bitVectorIndex = Math.min(bitVectorIndex, sectors - 1);

        let startAngle = rotationOffset;
        if (isProportional) {
          for (let j = 0; j < bitVectorIndex; j++) {
            if (j < angles.length) {
              startAngle += angles[j] || 0;
            }
          }
        } else {
          startAngle += (2 * Math.PI * bitVectorIndex) / sectors;
        }

        const angleWidth = bitVectorIndex < angles.length ? angles[bitVectorIndex] : 2 * Math.PI / sectors;
        const centerAngle = startAngle + angleWidth / 2;
        const totalPoints = points.length || 1;
        const clusterFactor = 0.9;
        const overlapRadius = innerRadius + (clusterFactor * (outerRadius - innerRadius) * (i % totalPoints)) / totalPoints;
        const x = overlapRadius * Math.cos(centerAngle);
        const y = overlapRadius * Math.sin(centerAngle);

        // Ensure Point_ID is an array
        const pointIds = Array.isArray(point.Point_ID) ? point.Point_ID : [point.Point_ID];

        pointIds.forEach((id) => {
          if (!id) return;
          if (!pointPositions[id]) pointPositions[id] = [];
          pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
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
            const pointIds = Array.isArray(point.Point_ID) ? point.Point_ID.join(", ") : point.Point_ID;
            let associatedLabels = [];
            if (labelsData && labelsData.labels) {
              Object.entries(labelsData.labels).forEach(([label, pointList]) => {
                if (Array.isArray(point.Point_ID) && Array.isArray(pointList) &&
                  point.Point_ID.some(id => pointList.includes(Number(id)))) {
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
          g.append("line")
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
    };
  }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
    </div>
  );
};

export default HierarchicalGraph;

