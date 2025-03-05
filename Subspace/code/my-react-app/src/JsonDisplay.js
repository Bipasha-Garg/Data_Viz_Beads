// // import React, { useEffect, useRef } from "react";
// // import * as d3 from "d3";

// // const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
// //   const graphRef = useRef(null);

// //   useEffect(() => {
// //     if (
// //       !jsonData ||
// //       typeof jsonData !== "object" ||
// //       Object.keys(jsonData).length === 0
// //     ) {
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

// //     const edgePopup = d3
// //       .select("body")
// //       .append("div")
// //       .attr("class", "edge-popup")
// //       .style("position", "absolute")
// //       .style("visibility", "hidden")
// //       .style("background-color", "rgba(255, 255, 255, 0.9)")
// //       .style("color", "black")
// //       .style("padding", "10px")
// //       .style("border-radius", "4px")
// //       .style("font-size", "12px")
// //       .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
// //       .style("max-width", "300px");

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

// //     const colorScale = d3
// //       .scaleOrdinal(d3.schemeCategory10)
// //       .domain(Object.keys(labelsData.labels || {}));

// //     const getSectorColor = (index, sectorIndex) => {
// //       return d3.hsl(sectorIndex % 2 === 0 ? 0 : 220, 0.9, 0.6);
// //     };


// //     const subspaces = Object.keys(jsonData);
// //     subspaces.sort((a, b) => a.length - b.length);

// //     const pointsData = subspaces.map((key) => ({
// //       key,
// //       points: jsonData[key],
// //       dimensions: key.length,
// //       subspaceId: key,
// //     }));
// //     const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i)); 

// //     const pointPositions = {};
// //     let highlightedElements = null;

// //     // Function to clear highlights
// //     const clearHighlights = () => {
// //       if (highlightedElements) {
// //         highlightedElements.line.attr("stroke-width", 0.3).attr("stroke", highlightedElements.originalColor);
// //         highlightedElements.circles.forEach(circle =>
// //           circle.attr("r", 3).attr("fill", "black")
// //         );
// //         highlightedElements = null;
// //       }
// //     };

// //     subspaces.forEach((key, index) => {
// //       if (!ringVisibility[key]) return;

// //       const innerRadius = (index / subspaces.length) * maxRadius;
// //       const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// //       const sectors = 2 ** (index + 1);
// //       const rotationOffset = Math.PI / 2;

// //       for (let i = 0; i < sectors; i++) {
// //         const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
// //         const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;

// //         g.append("path")
// //           .attr("d", d3.arc()
// //             .innerRadius(innerRadius)
// //             .outerRadius(outerRadius)
// //             .startAngle(startAngle)
// //             .endAngle(endAngle)
// //           )
// //           .attr("fill", getSectorColor(index, i))
// //           .attr("fill-opacity", 0.3)
// //           .attr("stroke", "black")
// //           .attr("stroke-width", 0.1)
// //           .style("cursor", "pointer");

// //         g.append("text")
// //           .attr("x", 0)
// //           .attr("y", -outerRadius - 5)
// //           .attr("text-anchor", "middle")
// //           .attr("font-size", "16px")
// //           .attr("fill", "red")
// //           .attr("font-weight", "bold")
// //         // .text(key);
// //           .text(ringLabels[index]); // Use generated lab
// //       }

// //       for (let i = 0; i < sectors; i++) {
// //         const angle = (2 * Math.PI * i) / sectors;
// //         const x1 = outerRadius * Math.cos(angle);
// //         const y1 = outerRadius * Math.sin(angle);
// //         const x2 = innerRadius * Math.cos(angle);
// //         const y2 = innerRadius * Math.sin(angle);
// //         g.append("line")
// //           .attr("x1", x2)
// //           .attr("y1", y2)
// //           .attr("x2", x1)
// //           .attr("y2", y1)
// //           .attr("stroke", "black")
// //           .attr("stroke-width", 0.25)
// //           .style("pointer-events", "none");
// //       }

// //       pointsData[index].points.forEach((point, i) => {
// //         const pointData = Object.entries(point).filter(
// //           ([key]) => key !== "Point_ID"
// //         );
// //         const bitVector = pointData
// //           .map(([key, coord]) => (coord >= 0 ? 1 : 0))
// //           .join("");

// //         const minRadius = innerRadius;
// //         const maxRadius = outerRadius;
// //         const randomRadius =
// //           minRadius + Math.random() * (maxRadius - minRadius);

// //         const bitVectorIndex = parseInt(bitVector, 2);
// //         const angleStart = (2 * Math.PI * bitVectorIndex) / sectors;
// //         const angleEnd = (2 * Math.PI * (bitVectorIndex + 1)) / sectors;
// //         const centerAngle = (angleStart + angleEnd) / 2;

// //         const totalPoints = pointsData[index].points.length;
// //         const clusterFactor = 0.86;
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
// //           pointPositions[id].push({ x, y, point, subspaceId: key });
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
// //                 `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${key}<br>Label: ${labelText}`
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
// //     });

// //     Object.entries(pointPositions).forEach(([pointId, positions]) => {
// //       if (positions.length > 1) {
// //         for (let i = 0; i < positions.length - 1; i++) {
// //           const line = g.append("line")
// //             .attr("x1", positions[i].x)
// //             .attr("y1", positions[i].y)
// //             .attr("x2", positions[i + 1].x)
// //             .attr("y2", positions[i + 1].y)
// //             .attr("stroke", getLabelColor(pointId))
// //             .attr("stroke-width", 0.3)
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
// //             })
// //             .on("click", (event) => {
// //               // Clear previous highlights
// //               clearHighlights();

// //               // Highlight the clicked edge
// //               const originalColor = getLabelColor(pointId);
// //               line.attr("stroke-width", 2).attr("stroke", "yellow");

// //               // Highlight connected points
// //               const circles = g.selectAll("circle")
// //                 .filter(d => {
// //                   const circleX = parseFloat(this.getAttribute("cx"));
// //                   const circleY = parseFloat(this.getAttribute("cy"));
// //                   return (
// //                     (Math.abs(circleX - positions[i].x) < 0.1 && Math.abs(circleY - positions[i].y) < 0.1) ||
// //                     (Math.abs(circleX - positions[i + 1].x) < 0.1 && Math.abs(circleY - positions[i + 1].y) < 0.1)
// //                 )})
// //                 .attr("r", 6)
// //                 .attr("fill", "yellow");

// //               highlightedElements = { line, circles, originalColor };

// //               // Show popup
// //               const point1 = positions[i].point;
// //               const point2 = positions[i + 1].point;

// //               const coords1 = Object.entries(point1)
// //                 .filter(([key]) => key !== "Point_ID")
// //                 .map(([key, value]) => `${key}: ${value}`)
// //                 .join(", ");
// //               const coords2 = Object.entries(point2)
// //                 .filter(([key]) => key !== "Point_ID")
// //                 .map(([key, value]) => `${key}: ${value}`)
// //                 .join(", ");

// //               const label1 = Object.entries(labelsData?.labels || {})
// //                 .find(([_, ids]) => ids.includes(Number(pointId)))?.[0] || "No Label";

// //               edgePopup
// //                 .style("visibility", "visible")
// //                 .html(`
// //                   <strong>Connected Points (ID: ${pointId})</strong><br><br>
// //                   <strong>Point 1</strong><br>
// //                   Subspace: ${positions[i].subspaceId}<br>
// //                   Coordinates: ${coords1}<br>
// //                   Label: ${label1}<br><br>
// //                   <strong>Point 2</strong><br>
// //                   Subspace: ${positions[i + 1].subspaceId}<br>
// //                   Coordinates: ${coords2}<br>
// //                   Label: ${label1}
// //                 `)
// //                 .style("top", event.pageY + 15 + "px")
// //                 .style("left", event.pageX + 15 + "px");

// //               d3.select("body").on("click.edgePopup", (e) => {
// //                 if (!edgePopup.node().contains(e.target)) {
// //                   edgePopup.style("visibility", "hidden");
// //                   clearHighlights();
// //                   d3.select("body").on("click.edgePopup", null);
// //                 }
// //               });
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
// //       edgePopup.remove();
// //       svg.select(".zoom-view").remove();
// //     };

    
// //   }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates]);

// //   return (
// //     <div style={{ width: "100%", height: "100%" }}>
// //       <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
// //     </div>
// //   );
// // };

// // export default HierarchicalGraph;


import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
  const graphRef = useRef(null);
  const [isProportionalView, setIsProportionalView] = useState(false);
  const [applyToAllRings, setApplyToAllRings] = useState(false);

  useEffect(() => {
    // check data json file
    if (
      !jsonData ||
      typeof jsonData !== "object" ||
      Object.keys(jsonData).length === 0
    ) {
      console.error("Invalid or empty jsonData:", jsonData);
      return;
    }
// check label json file
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
      return d3.hsl(sectorIndex % 2 === 0 ? 0 : 220, 0.9, 0.6);
    };

    const subspaces = Object.keys(jsonData);
    // subspaces.sort((a, b) => a.length - b.length);

    const pointsData = subspaces.map((key) => ({
      key,
      points: jsonData[key],
      dimensions: key.length,
      subspaceId: key,
    }));
    const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));

    const pointPositions = {};
    let highlightedElements = null;


    const drawGraph = () => {
      svg.selectAll("*").remove();
      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      subspaces.forEach((key, index) => {
        if (!ringVisibility[key]) return;

        const innerRadius = (index / subspaces.length) * maxRadius;
        const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
        const sectors = 2 ** (index + 1);
        // const rotationOffset = Math.PI / 2;

        const pointsBySector = new Array(sectors).fill(0);
        pointsData[index].points.forEach((point) => {
          const pointData = Object.entries(point).filter(([k]) => k !== "Point_ID");
          const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
          const sectorIndex = parseInt(bitVector, 2);
          pointsBySector[sectorIndex]++;
        });

        const totalPoints = pointsData[index].points.length;
        const minSectorAngle = totalPoints > 0 ? (Math.PI * 0.91) / sectors : (2 * Math.PI) / sectors;

        let sectorAngles = [];
        if (isProportionalView && (applyToAllRings || index === subspaces.length - 1)) {
          const totalAngle = 2 * Math.PI;
          const totalOccupiedSectors = pointsBySector.filter(count => count > 0).length;
          const remainingAngle = totalAngle - (totalOccupiedSectors * minSectorAngle);
          
          sectorAngles = pointsBySector.map(count => {
            if (count === 0) return minSectorAngle;
            return minSectorAngle + (remainingAngle * count / totalPoints);
          });
        } else {
          sectorAngles = new Array(sectors).fill(2 * Math.PI / sectors);
        }

        // let currentAngle = rotationOffset;
        let currentAngle = 0;
        const sectorStartAngles = [currentAngle];

        for (let i = 0; i < sectors; i++) {
          const startAngle = currentAngle;
          const endAngle = startAngle + sectorAngles[i];
          currentAngle = endAngle;
          sectorStartAngles.push(currentAngle);

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
            .attr("stroke-width", 0.1)
            .style("cursor", "pointer");

          if (i === 0) {
            g.append("text")
              .attr("x", 0)
              .attr("y", -outerRadius - 5)
              .attr("text-anchor", "middle")
              .attr("font-size", "16px")
              .attr("fill", "red")
              .attr("font-weight", "bold")
              .text(ringLabels[index]);
          }

          const x1 = outerRadius * Math.cos(endAngle);
          const y1 = outerRadius * Math.sin(endAngle);
          const x2 = innerRadius * Math.cos(endAngle);
          const y2 = innerRadius * Math.sin(endAngle);
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
          const pointData = Object.entries(point).filter(([k]) => k !== "Point_ID");
          const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
          const bitVectorIndex = parseInt(bitVector, 2);

          const minRadius = innerRadius;
          const maxRadius = outerRadius;
          const randomRadius = minRadius + Math.random() * (maxRadius - minRadius);

          const startAngle = sectorStartAngles[bitVectorIndex];
          const endAngle = sectorStartAngles[bitVectorIndex + 1];
          const centerAngle = (startAngle + endAngle) / 2;

          const totalPointsInSector = pointsBySector[bitVectorIndex];
          const clusterFactor = 0.86;
          const overlapRadius = totalPointsInSector > 0
            ? innerRadius + (clusterFactor * (outerRadius - innerRadius) * (i % totalPointsInSector)) / totalPointsInSector
            : randomRadius;

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
                // clearHighlights();

                const originalColor = getLabelColor(pointId);
                line.attr("stroke-width", 2).attr("stroke", "yellow");

                const circles = g.selectAll("circle")
                  .filter(d => {
                    const circleX = parseFloat(this.getAttribute("cx"));
                    const circleY = parseFloat(this.getAttribute("cy"));
                    return (
                      (Math.abs(circleX - positions[i].x) < 0.1 && Math.abs(circleY - positions[i].y) < 0.1) ||
                      (Math.abs(circleX - positions[i + 1].x) < 0.1 && Math.abs(circleY - positions[i + 1].y) < 0.1)
                    );
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

                // edgePopup
                //   .style("visibility", "visible")
                //   .html(`
                //     <strong>Connected Points (ID: ${pointId})</strong><br><br>
                //     <strong>Point 1</strong><br>
                //     Subspace: ${positions[i].subspaceId}<br>
                //     Coordinates: ${coords1}<br>
                //     Label: ${label1}<br><br>
                //     <strong>Point 2</strong><br>
                //     Subspace: ${positions[i + 1].subspaceId}<br>
                //     Coordinates: ${coords2}<br>
                //     Label: ${label1}
                //   `)
                //   .style("top", event.pageY + 15 + "px")
                //   .style("left", event.pageX + 15 + "px");

                // d3.select("body").on("click.edgePopup", (e) => {
                //   if (!edgePopup.node().contains(e.target)) {
                //     edgePopup.style("visibility", "hidden");
                //     // clearHighlights();
                //     d3.select("body").on("click.edgePopup", null);
                //   }
                // });
              });
          }
        }
      });

      const zoom = d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      svg.call(zoom);
    };

    drawGraph();

    return () => {
      tooltip.remove();
      // edgePopup.remove();
      svg.select(".zoom-view").remove();
    };
  }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, isProportionalView, applyToAllRings]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={() => setIsProportionalView(!isProportionalView)}
          style={{
            padding: "5px 10px",
            marginRight: "10px",
            backgroundColor: isProportionalView ? "#4CAF50" : "#f0f0f0",
            color: isProportionalView ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isProportionalView ? "Normal View" : "Proportional View"}
        </button>
        
        {isProportionalView && (
          <label style={{ marginLeft: "10px" }}>
            <input
              type="checkbox"
              checked={applyToAllRings}
              onChange={(e) => setApplyToAllRings(e.target.checked)}
            />
            Apply to all rings
          </label>
        )}
      </div>
      <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
    </div>
  );
};

export default HierarchicalGraph;






// ____________________________________________________________________________________________________________________________________________





