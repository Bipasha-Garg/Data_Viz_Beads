// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const HorizontalStrip = ({
//     jsonData,
//     labelsData,
//     setHoveredCoordinates,
//     stripHeight = 100,
//     stripMargin = { top: 20, right: 30, bottom: 30, left: 30 }
// }) => {
//     const stripRef = useRef(null);

//     useEffect(() => {
//         if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
//             console.error("Invalid or empty jsonData:", jsonData);
//             return;
//         }

//         if (!labelsData || typeof labelsData !== "object") {
//             console.error("Invalid labelsData:", labelsData);
//             return;
//         }

//         // Select SVG and clear it
//         const svg = d3.select(stripRef.current);
//         svg.selectAll("*").remove();

//         // Get the last subspace/ring
//         const subspaces = Object.keys(jsonData);
//         subspaces.sort((a, b) => a.length - b.length);
//         const lastSubspace = subspaces[subspaces.length - 1];

//         if (!jsonData[lastSubspace] || !jsonData[lastSubspace].length) {
//             return; // No data for the last ring
//         }

//         // Setup dimensions
//         const width = parseInt(svg.style("width")) || 800;
//         const height = stripHeight + stripMargin.top + stripMargin.bottom;

//         svg.attr("height", height);

//         const g = svg
//             .append("g")
//             .attr("transform", `translate(${stripMargin.left}, ${stripMargin.top})`);

//         // Setup tooltip
//         const tooltip = d3
//             .select("body")
//             .append("div")
//             .attr("class", "tooltip")
//             .style("position", "absolute")
//             .style("visibility", "hidden")
//             .style("background-color", "rgba(0, 0, 0, 0.7)")
//             .style("color", "white")
//             .style("padding", "5px")
//             .style("border-radius", "4px")
//             .style("font-size", "12px");

//         // Color scales
//         const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));

//         const getLabelColor = (pointId) => {
//             if (!labelsData || !labelsData.labels) return "gray";
//             for (const label of Object.keys(labelsData.labels)) {
//                 const pointList = labelsData.labels[label];
//                 if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
//                     return colorScale(label);
//                 }
//             }
//             return "gray";
//         };

//         // Get points in the last ring
//         const lastRingPoints = jsonData[lastSubspace];

//         // Calculate sector distribution
//         const sectors = 2 ** lastSubspace.length;
//         const pointsBySector = {};

//         // Initialize sectors
//         for (let i = 0; i < sectors; i++) {
//             pointsBySector[i] = [];
//         }

//         // Group points by sector
//         lastRingPoints.forEach(point => {
//             const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
//             const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
//             const sectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

//             pointsBySector[sectorIndex].push(point);
//         });

//         // Calculate total points for proportions
//         const totalPoints = lastRingPoints.length;

//         // Calculate sector widths (proportional to point counts)
//         const stripWidth = width - stripMargin.left - stripMargin.right;
//         const sectorWidths = {};
//         let sectorStarts = {};
//         let currentStart = 0;

//         for (let i = 0; i < sectors; i++) {
//             const sectorPoints = pointsBySector[i].length;
//             const proportion = sectorPoints / totalPoints;
//             sectorWidths[i] = stripWidth * proportion;
//             sectorStarts[i] = currentStart;
//             currentStart += sectorWidths[i];
//         }

//         // Draw sector backgrounds
//         for (let i = 0; i < sectors; i++) {
//             const sectorPoints = pointsBySector[i].length;
//             if (sectorPoints === 0) continue;

//             g.append("rect")
//                 .attr("x", sectorStarts[i])
//                 .attr("y", 0)
//                 .attr("width", sectorWidths[i])
//                 .attr("height", stripHeight)
//                 .attr("fill", i % 2 === 0 ? "#f0f0f0" : "#e0e0e0")
//                 .attr("stroke", "#ccc")
//                 .attr("stroke-width", 0.5);

//             // Add sector label
//             g.append("text")
//                 .attr("x", sectorStarts[i] + sectorWidths[i] / 2)
//                 .attr("y", stripHeight + 20)
//                 .attr("text-anchor", "middle")
//                 .attr("font-size", "10px")
//                 .text(`Sector ${i} (${sectorPoints})`);
//         }

//         // Draw dividing lines between sectors
//         for (let i = 1; i < sectors; i++) {
//             if (sectorStarts[i] > 0) {
//                 g.append("line")
//                     .attr("x1", sectorStarts[i])
//                     .attr("y1", 0)
//                     .attr("x2", sectorStarts[i])
//                     .attr("y2", stripHeight)
//                     .attr("stroke", "#999")
//                     .attr("stroke-width", 1);
//             }
//         }

//         // Draw points
//         for (let sectorIndex = 0; sectorIndex < sectors; sectorIndex++) {
//             const sectorPoints = pointsBySector[sectorIndex];
//             const sectorWidth = sectorWidths[sectorIndex];
//             const sectorStart = sectorStarts[sectorIndex];

//             if (sectorPoints.length === 0) continue;

//             // Create scale for dimension values in this sector
//             const findMinMax = (points, dim) => {
//                 const values = points.map(p => {
//                     const coords = Object.entries(p).filter(([key]) => key !== "Point_ID");
//                     return coords[dim][1]; // Get the value for this dimension
//                 });
//                 return [Math.min(...values), Math.max(...values)];
//             };

//             // Set up k equidistant vertical lines within the sector
//             const k = lastSubspace.length; // number of dimensions
//             const lineSpacing = sectorWidth / (k + 1);

//             // Draw vertical dimension lines
//             for (let dim = 0; dim < k; dim++) {
//                 const lineX = sectorStart + (dim + 1) * lineSpacing;
//                 const [minVal, maxVal] = findMinMax(sectorPoints, dim);

//                 // Draw dimension line
//                 g.append("line")
//                     .attr("x1", lineX)
//                     .attr("y1", 5)
//                     .attr("x2", lineX)
//                     .attr("y2", stripHeight - 5)
//                     .attr("stroke", "#ddd")
//                     .attr("stroke-width", 1)
//                     .attr("stroke-dasharray", "3,3");

//                 // Draw dimension label
//                 g.append("text")
//                     .attr("x", lineX)
//                     .attr("y", 0)
//                     .attr("text-anchor", "middle")
//                     .attr("font-size", "9px")
//                     .text(`D${dim}`);

//                 // Draw min/max labels
//                 g.append("text")
//                     .attr("x", lineX - 15)
//                     .attr("y", stripHeight - 5)
//                     .attr("text-anchor", "end")
//                     .attr("font-size", "8px")
//                     .text(`${minVal.toFixed(1)}`);

//                 g.append("text")
//                     .attr("x", lineX + 15)
//                     .attr("y", stripHeight - 5)
//                     .attr("text-anchor", "start")
//                     .attr("font-size", "8px")
//                     .text(`${maxVal.toFixed(1)}`);

//                 // Create a y-scale for this dimension
//                 const yScale = d3.scaleLinear()
//                     .domain([minVal, maxVal])
//                     .range([stripHeight - 10, 10]);

//                 // Plot points on this dimension line
//                 sectorPoints.forEach(point => {
//                     const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
//                     const value = pointData[dim][1];
//                     const yPos = yScale(value);

//                     g.append("circle")
//                         .attr("cx", lineX)
//                         .attr("cy", yPos)
//                         .attr("r", 3)
//                         .attr("fill", point.Point_ID.map(id => getLabelColor(id))[0])
//                         .attr("stroke", "white")
//                         .attr("stroke-width", 0.5)
//                         .style("cursor", "pointer")
//                         .on("mouseover", (event) => {
//                             const pointIds = point.Point_ID.join(", ");
//                             let associatedLabels = [];
//                             if (labelsData && labelsData.labels) {
//                                 Object.entries(labelsData.labels).forEach(([label, pointList]) => {
//                                     if (point.Point_ID.some(id => pointList.includes(Number(id)))) {
//                                         associatedLabels.push(label);
//                                     }
//                                 });
//                             }
//                             const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

//                             tooltip
//                                 .style("visibility", "visible")
//                                 .html(
//                                     `Point_IDs: ${pointIds}<br>` +
//                                     `Dimension ${dim}: ${value.toFixed(2)}<br>` +
//                                     `Sector: ${sectorIndex}<br>` +
//                                     `Label: ${labelText}`
//                                 );

//                             if (setHoveredCoordinates) {
//                                 setHoveredCoordinates({ ...point, label: labelText });
//                             }
//                         })
//                         .on("mousemove", (event) => {
//                             tooltip
//                                 .style("top", event.pageY + 10 + "px")
//                                 .style("left", event.pageX + 10 + "px");
//                         })
//                         .on("mouseout", () => {
//                             tooltip.style("visibility", "hidden");
//                             if (setHoveredCoordinates) {
//                                 setHoveredCoordinates(null);
//                             }
//                         });
//                 });
//             }

//             // Connect points from the same Point_ID
//             const pointsById = {};
//             sectorPoints.forEach(point => {
//                 point.Point_ID.forEach(id => {
//                     if (!pointsById[id]) {
//                         pointsById[id] = { positions: [] };
//                     }

//                     const positions = [];
//                     const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");

//                     for (let dim = 0; dim < k; dim++) {
//                         const lineX = sectorStart + (dim + 1) * lineSpacing;
//                         const [minVal, maxVal] = findMinMax(sectorPoints, dim);
//                         const value = pointData[dim][1];

//                         const yScale = d3.scaleLinear()
//                             .domain([minVal, maxVal])
//                             .range([stripHeight - 10, 10]);

//                         const yPos = yScale(value);
//                         positions.push({ x: lineX, y: yPos });
//                     }

//                     pointsById[id].positions = positions;
//                 });
//             });

//             // Draw connecting lines for each point
//             Object.entries(pointsById).forEach(([id, data]) => {
//                 const positions = data.positions;
//                 if (positions.length > 1) {
//                     for (let i = 0; i < positions.length - 1; i++) {
//                         g.append("line")
//                             .attr("x1", positions[i].x)
//                             .attr("y1", positions[i].y)
//                             .attr("x2", positions[i + 1].x)
//                             .attr("y2", positions[i + 1].y)
//                             .attr("stroke", getLabelColor(id))
//                             .attr("stroke-width", 0.7)
//                             .attr("stroke-opacity", 0.9);
//                     }
//                 }
//             });
//         }

//         return () => {
//             tooltip.remove();
//         };
//     }, [jsonData, labelsData, setHoveredCoordinates, stripHeight, stripMargin]);

//     return (
//         <div>
//             <h3 style={{ marginBottom: "10px" }}>Horizontal Strip - Last Ring Projection</h3>
//             <svg
//                 ref={stripRef}
//                 style={{ width: "100%", height: `${stripHeight + stripMargin.top + stripMargin.bottom}px` }}
//             ></svg>
//         </div>
//     );
// };

// export default HorizontalStrip;



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

        // Shared utilities
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
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

        // Data preparation
        const subspaces = Object.keys(jsonData);
        subspaces.sort((a, b) => a.length - b.length);
        const pointsData = subspaces.map((key) => ({
            key,
            points: jsonData[key] || [],
            dimensions: key.length,
            subspaceId: key,
        }));
        const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));

        // Radial Graph Setup
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

        // Tooltip
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

        // Ring and Sector Colors
        const getRingColor = (index) => {
            const totalRings = subspaces.length;
            const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
            return d3.color(colorScaleInd(index));
        };
        const getSectorColor = (index, sectorIndex) => {
            const baseColor = d3.hsl(getRingColor(index));
            const isPositive = sectorIndex % 2 === 0;
            return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
        };

        // Sector Point Counts
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

        // Draw sectors with their proportional angles
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
        // Store Point Position
        const pointPositions = {};
        const storePointPosition = (point, x, y, index) => {
            point.Point_ID.forEach((id) => {
                if (!pointPositions[id]) {
                    pointPositions[id] = [];
                }
                pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
            });
        };

        // Draw Point (Radial)
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
                            if (point.Point_ID.some((id) => pointList.includes(Number(id)))) {
                                associatedLabels.push(label);
                            }
                        });
                    }
                    const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

                    tooltip
                        .style("visibility", "visible")
                        .html(
                            `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(
                                2
                            )})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
                        );
                    setHoveredCoordinates({ ...point, label: labelText });
                })
                .on("mousemove", (event) => {
                    tooltip.style("top", event.pageY + 10 + "px").style("left", event.pageX + 10 + "px");
                })
                .on("mouseout", () => {
                    tooltip.style("visibility", "hidden");
                    setHoveredCoordinates(null);
                });
        };

        // Render Radial Graph
        if (viewMode === "normal") {
            renderNormalView();
        } else if (viewMode === "proportional") {
            renderProportionalView();
        }

        // Draw Connections
        Object.entries(pointPositions).forEach(([pointId, positions]) => {
            if (positions.length > 1) {
                for (let i = 0; i < positions.length - 1; i++) {
                    const line = g
                        .append("line")
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

        // Zoom
        const zoom = d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
        svg.call(zoom);

        // Horizontal Strip Setup
        const stripSvg = d3.select(stripRef.current);
        stripSvg.selectAll("*").remove();

        const stripHeight = 100;
        const stripMargin = { top: 20, right: 30, bottom: 30, left: 30 };
        const stripWidth = width - stripMargin.left - stripMargin.right;
        const stripTotalHeight = stripHeight + stripMargin.top + stripMargin.bottom;

        stripSvg.attr("height", stripTotalHeight);

        const stripG = stripSvg
            .append("g")
            .attr("transform", `translate(${stripMargin.left}, ${stripMargin.top})`);

        const lastSubspace = subspaces[subspaces.length - 1];
        if (!jsonData[lastSubspace] || !jsonData[lastSubspace].length) {
            return; // No data for the last ring
        }

        const lastRingPoints = jsonData[lastSubspace];
        const sectors = 2 ** lastSubspace.length;
        const pointsBySector = {};

        for (let i = 0; i < sectors; i++) {
            pointsBySector[i] = [];
        }

        lastRingPoints.forEach((point) => {
            const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
            const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
            const sectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);
            pointsBySector[sectorIndex].push(point);
        });

        const totalPoints = lastRingPoints.length;
        const sectorWidths = {};
        let sectorStarts = {};
        let currentStart = 0;

        for (let i = 0; i < sectors; i++) {
            const sectorPoints = pointsBySector[i].length;
            const proportion = sectorPoints / totalPoints;
            sectorWidths[i] = stripWidth * proportion;
            sectorStarts[i] = currentStart;
            currentStart += sectorWidths[i];
        }

        // Draw Sector Backgrounds (Strip)
        for (let i = 0; i < sectors; i++) {
            const sectorPoints = pointsBySector[i].length;
            if (sectorPoints === 0) continue;

            stripG
                .append("rect")
                .attr("x", sectorStarts[i])
                .attr("y", 0)
                .attr("width", sectorWidths[i])
                .attr("height", stripHeight)
                .attr("fill", i % 2 === 0 ? "#f0f0f0" : "#e0e0e0")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 0.5);

            stripG
                .append("text")
                .attr("x", sectorStarts[i] + sectorWidths[i] / 2)
                .attr("y", stripHeight + 20)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .text(`Sector ${i} (${sectorPoints})`);
        }

        // Draw Dividing Lines (Strip)
        for (let i = 1; i < sectors; i++) {
            if (sectorStarts[i] > 0) {
                stripG
                    .append("line")
                    .attr("x1", sectorStarts[i])
                    .attr("y1", 0)
                    .attr("x2", sectorStarts[i])
                    .attr("y2", stripHeight)
                    .attr("stroke", "#999")
                    .attr("stroke-width", 1);
            }
        }

        // Draw Points (Strip)
        for (let sectorIndex = 0; sectorIndex < sectors; sectorIndex++) {
            const sectorPoints = pointsBySector[sectorIndex];
            const sectorWidth = sectorWidths[sectorIndex];
            const sectorStart = sectorStarts[sectorIndex];

            if (sectorPoints.length === 0) continue;

            const findMinMax = (points, dim) => {
                const values = points.map((p) => {
                    const coords = Object.entries(p).filter(([key]) => key !== "Point_ID");
                    return coords[dim][1];
                });
                return [Math.min(...values), Math.max(...values)];
            };

            const k = lastSubspace.length;
            const lineSpacing = sectorWidth / (k + 1);

            for (let dim = 0; dim < k; dim++) {
                const lineX = sectorStart + (dim + 1) * lineSpacing;
                const [minVal, maxVal] = findMinMax(sectorPoints, dim);

                stripG
                    .append("line")
                    .attr("x1", lineX)
                    .attr("y1", 5)
                    .attr("x2", lineX)
                    .attr("y2", stripHeight - 5)
                    .attr("stroke", "#ddd")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "3,3");

                stripG
                    .append("text")
                    .attr("x", lineX)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "9px")
                    .text(`D${dim}`);

                stripG
                    .append("text")
                    .attr("x", lineX - 15)
                    .attr("y", stripHeight - 5)
                    .attr("text-anchor", "end")
                    .attr("font-size", "8px")
                    .text(`${minVal.toFixed(1)}`);

                stripG
                    .append("text")
                    .attr("x", lineX + 15)
                    .attr("y", stripHeight - 5)
                    .attr("text-anchor", "start")
                    .attr("font-size", "8px")
                    .text(`${maxVal.toFixed(1)}`);

                const yScale = d3
                    .scaleLinear()
                    .domain([minVal, maxVal])
                    .range([stripHeight - 10, 10]);

                sectorPoints.forEach((point) => {
                    const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
                    const value = pointData[dim][1];
                    const yPos = yScale(value);

                    stripG
                        .append("circle")
                        .attr("cx", lineX)
                        .attr("cy", yPos)
                        .attr("r", 3)
                        .attr("fill", point.Point_ID.map((id) => getLabelColor(id))[0])
                        .attr("stroke", "white")
                        .attr("stroke-width", 0.5)
                        .style("cursor", "pointer")
                        .on("mouseover", (event) => {
                            const pointIds = point.Point_ID.join(", ");
                            let associatedLabels = [];
                            if (labelsData && labelsData.labels) {
                                Object.entries(labelsData.labels).forEach(([label, pointList]) => {
                                    if (point.Point_ID.some((id) => pointList.includes(Number(id)))) {
                                        associatedLabels.push(label);
                                    }
                                });
                            }
                            const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

                            tooltip
                                .style("visibility", "visible")
                                .html(
                                    `Point_IDs: ${pointIds}<br>` +
                                    `Dimension ${dim}: ${value.toFixed(2)}<br>` +
                                    `Sector: ${sectorIndex}<br>` +
                                    `Label: ${labelText}`
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

            // Connect Points (Strip)
            const pointsById = {};
            sectorPoints.forEach((point) => {
                point.Point_ID.forEach((id) => {
                    if (!pointsById[id]) {
                        pointsById[id] = { positions: [] };
                    }

                    const positions = [];
                    const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");

                    for (let dim = 0; dim < k; dim++) {
                        const lineX = sectorStart + (dim + 1) * lineSpacing;
                        const [minVal, maxVal] = findMinMax(sectorPoints, dim);
                        const value = pointData[dim][1];

                        const yScale = d3
                            .scaleLinear()
                            .domain([minVal, maxVal])
                            .range([stripHeight - 10, 10]);

                        const yPos = yScale(value);
                        positions.push({ x: lineX, y: yPos });
                    }

                    pointsById[id].positions = positions;
                });
            });

            Object.entries(pointsById).forEach(([id, data]) => {
                const positions = data.positions;
                if (positions.length > 1) {
                    for (let i = 0; i < positions.length - 1; i++) {
                        stripG
                            .append("line")
                            .attr("x1", positions[i].x)
                            .attr("y1", positions[i].y)
                            .attr("x2", positions[i + 1].x)
                            .attr("y2", positions[i + 1].y)
                            .attr("stroke", getLabelColor(id))
                            .attr("stroke-width", 0.7)
                            .attr("stroke-opacity", 0.9);
                    }
                }
            });
        }

        // Cleanup
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
            <h3 style={{ margin: "20px 0 10px" }}>Horizontal Strip - Last Ring Projection</h3>
            <svg
                ref={stripRef}
                style={{ width: "100%", height: "150px" }}
            ></svg>
        </div>
    );
};

export default HierarchicalGraph;