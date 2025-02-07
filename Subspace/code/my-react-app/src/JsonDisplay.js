// // // // import React, { useEffect, useRef } from "react";
// // // // import * as d3 from "d3";

// // // // const HierarchicalGraph = ({ jsonData }) => {
// // // //   const graphRef = useRef(null);

// // // //   useEffect(() => {
// // // //     if (!jsonData || Object.keys(jsonData).length === 0) return;

// // // //     const subspaces = Object.keys(jsonData);
// // // //     console.log(subspaces.length);
    
// // // //     subspaces.sort((a, b) => a.length - b.length);

// // // //     const pointsData = subspaces.map((key) => ({
// // // //       key,
// // // //       points: jsonData[key],
// // // //       dimensions: key.length, 
// // // //       subspaceId: key, 
// // // //     }));

// // // //     const svg = d3.select(graphRef.current);
// // // //     const width = 1200;
// // // //     const height = 1200;
// // // //     const margin = 20;

// // // //     svg.selectAll("*").remove(); 
// // // //     const maxRadius = Math.min(width, height) / 2 - margin;
// // // //     const g = svg
// // // //       .attr("width", width)
// // // //       .attr("height", height)
// // // //       .append("g")
// // // //       .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
// // // //     pointsData.forEach((subspace, index) => {
// // // //       const radius = maxRadius * ((index + 1) / subspaces.length);
// // // //       const sectors = 2 ** (index +1); 
// // // //       console.log(sectors);
      
// // // //       const colorScale = d3
// // // //         .scaleOrdinal()
// // // //         .range(["#FFD700", "#FF69B4", "#33B5E5"]); 
      
// // // //       const subspaceColor = colorScale(
// // // //         subspace.dimensions % colorScale.range().length
// // // //       );
      
// // // //       g.append("circle")
// // // //         .attr("r", radius)
// // // //         .attr("stroke", "black") 
// // // //         .attr("fill", subspaceColor)
// // // //         .attr("fill-opacity", 0.2) 
// // // //         .attr("stroke-width", 2); 
      
// // // //       if (subspace.dimensions > 0) {
        
// // // //         for (let i = 0; i < sectors; i++) {
// // // //           const angle = (2 * Math.PI * i) / sectors;
// // // //           const x1 = radius * Math.cos(angle);
// // // //           const y1 = radius * Math.sin(angle);
// // // //           g.append("line")
// // // //             .attr("x1", 0)
// // // //             .attr("y1", 0)
// // // //             .attr("x2", x1)
// // // //             .attr("y2", y1)
// // // //             .attr("stroke", "black")
// // // //             .attr("stroke-width", 1);
          
// // // //           const labelX = (radius + 10) * Math.cos(angle); 
// // // //           const labelY = (radius + 10) * Math.sin(angle);

// // // //           g.append("text")
// // // //             .attr("x", labelX)
// // // //             .attr("y", labelY + 5) 
// // // //             .attr("text-anchor", "middle")
// // // //             .attr("dominant-baseline", "middle")
// // // //             .style("font-size", "10px")
// // // //             .style("fill", "black");
// // // //         }
// // // //       }

// // // //       const sectorRadius = radius;

// // // //       subspace.points.forEach((point) => {
// // // //         const bitPattern = point.Point_ID.toString(2).padStart(
// // // //           subspace.dimensions,
// // // //           "0"
// // // //         );
// // // //         const sectorIndex = parseInt(bitPattern, 2);
// // // //         const sectorAngleStart = (2 * Math.PI * sectorIndex) / sectors;
// // // //         const sectorAngleEnd = (2 * Math.PI * (sectorIndex + 1)) / sectors;

// // // //         const minRadius = sectorRadius * 0.2;
// // // //         const randomRadius =
// // // //           minRadius + Math.random() * (sectorRadius - minRadius);
// // // //         const randomAngle =
// // // //           sectorAngleStart +
// // // //           Math.random() * (sectorAngleEnd - sectorAngleStart);

// // // //         const x = randomRadius * Math.cos(randomAngle);
// // // //         const y = randomRadius * Math.sin(randomAngle);

// // // //         if (Math.sqrt(x * x + y * y) <= radius) {
// // // //           const circle = g
// // // //             .append("circle")
// // // //             .attr("cx", x)
// // // //             .attr("cy", y)
// // // //             .attr("r", 4)
// // // //             .attr("fill", "black")
// // // //             .attr("stroke", "white")
// // // //             .attr("stroke-width", 0.5)
// // // //             .append("title")
// // // //             .text(
// // // //               `ID: ${point.Point_ID}, Binary: ${bitPattern}, Subspace: ${subspace.subspaceId}`
// // // //             );

          
// // // //           circle
// // // //             .on("mouseover", function () {
// // // //               d3.select(this).attr("fill", "red");
// // // //             })
// // // //             .on("mouseout", function () {
// // // //               d3.select(this).attr("fill", "black");
// // // //             });
// // // //         } else {
// // // //           console.warn(
// // // //             `Point ${point.Point_ID} is outside the subspace ${subspace.subspaceId}`
// // // //           ); 
// // // //         }
// // // //       });
// // // //     });
// // // //   }, [jsonData]);

// // // //   return <svg ref={graphRef} style={{ width: "1200px", height: "1200px" }}></svg>;
// // // // };

// // // // export default HierarchicalGraph;

// // // // import React, { useEffect, useRef } from "react";
// // // // import * as d3 from "d3";

// // // // const HierarchicalGraph = ({ jsonData }) => {
// // // //   const graphRef = useRef(null);

// // // //   useEffect(() => {
// // // //     if (!jsonData || Object.keys(jsonData).length === 0) return;

// // // //     const subspaces = Object.keys(jsonData);
// // // //     console.log("Number of subspaces:", subspaces.length);

// // // //     subspaces.sort((a, b) => a.length - b.length);

// // // //     const pointsData = subspaces.map((key) => ({
// // // //       key,
// // // //       points: jsonData[key],
// // // //       dimensions: key.length,
// // // //       subspaceId: key,
// // // //     }));

// // // //     const svg = d3.select(graphRef.current);
// // // //     const width = 600;
// // // //     const height = 600;
// // // //     const margin = 20;

// // // //     svg.selectAll("*").remove();
// // // //     const maxRadius = Math.min(width, height) / 2 - margin;
// // // //     const g = svg
// // // //       .attr("width", width)
// // // //       .attr("height", height)
// // // //       .append("g")
// // // //       .attr("transform", `translate(${width / 2}, ${height / 2})`);

// // // //     pointsData.forEach((subspace, index) => {
// // // //       const radius = maxRadius * ((index + 1) / subspaces.length);
// // // //       const sectors = 2 ** (index + 1);

// // // //       const colorScale = d3
// // // //         .scaleOrdinal()
// // // //         .range(["#FFD700", "#FF69B4", "#33B5E5"]);

// // // //       const subspaceColor = colorScale((index + 1) % colorScale.range().length);

// // // //       g.append("circle")
// // // //         .attr("r", radius)
// // // //         .attr("stroke", "black")
// // // //         .attr("fill", subspaceColor)
// // // //         .attr("fill-opacity", 0.2)
// // // //         .attr("stroke-width", 2);

// // // //       if (index + 1 > 0) {
// // // //         for (let i = 0; i < sectors; i++) {
// // // //           const angle = (2 * Math.PI * i) / sectors;
// // // //           const x1 = radius * Math.cos(angle);
// // // //           const y1 = radius * Math.sin(angle);
// // // //           g.append("line")
// // // //             .attr("x1", 0)
// // // //             .attr("y1", 0)
// // // //             .attr("x2", x1)
// // // //             .attr("y2", y1)
// // // //             .attr("stroke", "black")
// // // //             .attr("stroke-width", 1);

// // // //           const labelX = (radius + 10) * Math.cos(angle);
// // // //           const labelY = (radius + 10) * Math.sin(angle);

// // // //           g.append("text")
// // // //             .attr("x", labelX)
// // // //             .attr("y", labelY + 5)
// // // //             .attr("text-anchor", "middle")
// // // //             .attr("dominant-baseline", "middle")
// // // //             .style("font-size", "10px")
// // // //             .style("fill", "black");
// // // //         }
// // // //       }

// // // //       const sectorRadius = radius;

// // // //       subspace.points.forEach((point) => {
// // // //         const bitPattern = point.Point_ID.toString(2).padStart(index + 1, "0");
// // // //         const sectorIndex = parseInt(bitPattern, 2);
// // // //         const sectorAngleStart = (2 * Math.PI * sectorIndex) / sectors;
// // // //         const sectorAngleEnd = (2 * Math.PI * (sectorIndex + 1)) / sectors;

// // // //         const minRadius = sectorRadius * 0.2;
// // // //         const randomRadius =
// // // //           minRadius + Math.random() * (sectorRadius - minRadius);
// // // //         const randomAngle =
// // // //           sectorAngleStart +
// // // //           Math.random() * (sectorAngleEnd - sectorAngleStart);

// // // //         const x = randomRadius * Math.cos(randomAngle);
// // // //         const y = randomRadius * Math.sin(randomAngle);

// // // //         if (Math.sqrt(x * x + y * y) <= radius) {
// // // //           const circle = g
// // // //             .append("circle")
// // // //             .attr("cx", x)
// // // //             .attr("cy", y)
// // // //             .attr("r", 4)
// // // //             .attr("fill", "black")
// // // //             .attr("stroke", "white")
// // // //             .attr("stroke-width", 0.5);

// // // //           circle
// // // //             .append("title")
// // // //             .text(
// // // //               `ID: ${point.Point_ID}, Binary: ${bitPattern}, Subspace: ${subspace.subspaceId}`
// // // //             );

// // // //           circle
// // // //             .on("mouseover", function (event) {
// // // //               d3.select(this).attr("fill", "red");
// // // //               g.append("text")
// // // //                 .attr("id", "tooltip")
// // // //                 .attr("x", x + 10)
// // // //                 .attr("y", y - 10)
// // // //                 .attr("text-anchor", "middle")
// // // //                 .attr("dominant-baseline", "middle")
// // // //                 .style("font-size", "12px")
// // // //                 .style("fill", "black")
// // // //                 .text(bitPattern);
// // // //             })
// // // //             .on("mouseout", function () {
// // // //               d3.select(this).attr("fill", "black");
// // // //               g.select("#tooltip").remove();
// // // //             });
// // // //         } else {
// // // //           console.warn(
// // // //             `Point ${point.Point_ID} is outside the subspace ${subspace.subspaceId}`
// // // //           );
// // // //         }
// // // //       });
// // // //     });
// // // //   }, [jsonData]);

// // // //   return <svg ref={graphRef} style={{ width: "600px", height: "600px" }}></svg>;
// // // // };

// // // // export default HierarchicalGraph;

// // // import React, { useEffect, useRef } from "react";
// // // import * as d3 from "d3";

// // // const HierarchicalGraph = ({ jsonData }) => {
// // //   const graphRef = useRef(null);

// // //   useEffect(() => {
// // //     if (!jsonData || Object.keys(jsonData).length === 0) return;

// // //     const subspaces = Object.keys(jsonData);
// // //     subspaces.sort((a, b) => a.length - b.length);

// // //     const pointsData = subspaces.map((key) => ({
// // //       key,
// // //       points: jsonData[key],
// // //       dimensions: key.length,
// // //       subspaceId: key,
// // //     }));

// // //     const svg = d3.select(graphRef.current);
// // //     const width = 600;
// // //     const height = 600;
// // //     const margin = 20;

// // //     svg.selectAll("*").remove();
// // //     const maxRadius = Math.min(width, height) / 2 - margin;
// // //     const g = svg
// // //       .attr("width", width)
// // //       .attr("height", height)
// // //       .append("g")
// // //       .attr("transform", `translate(${width / 2}, ${height / 2})`);

// // //     pointsData.forEach((subspace, index) => {
// // //       const innerRadius = (index / subspaces.length) * maxRadius;
// // //       const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// // //       const sectors = 2 ** (index + 1);
// // //       const colorScale = d3
// // //         .scaleOrdinal()
// // //         .range(["#FFD700", "#FF69B4", "#33B5E5"]);
// // //       const subspaceColor = colorScale((index + 1) % colorScale.range().length);

// // //       g.append("circle")
// // //         .attr("r", outerRadius)
// // //         .attr("stroke", "black")
// // //         .attr("fill", subspaceColor)
// // //         .attr("fill-opacity", 0.2)
// // //         .attr("stroke-width", 2);

// // //       for (let i = 0; i < sectors; i++) {
// // //         const angle = (2 * Math.PI * i) / sectors;
// // //         const x1 = outerRadius * Math.cos(angle);
// // //         const y1 = outerRadius * Math.sin(angle);
// // //         g.append("line")
// // //           .attr("x1", 0)
// // //           .attr("y1", 0)
// // //           .attr("x2", x1)
// // //           .attr("y2", y1)
// // //           .attr("stroke", "black")
// // //           .attr("stroke-width", 1);
// // //       }
 
        
// // //       subspace.points.forEach((point) => {
// // //         const minRadius = innerRadius;
// // //         const maxRadius = outerRadius;
// // //         const randomRadius =
// // //           minRadius + Math.random() * (maxRadius - minRadius);
// // //         const randomAngle = Math.random() * 2 * Math.PI;
// // //         const x = randomRadius * Math.cos(randomAngle);
// // //         const y = randomRadius * Math.sin(randomAngle);

// // //         g.append("circle")
// // //           .attr("cx", x)
// // //           .attr("cy", y)
// // //           .attr("r", 4)
// // //           .attr("fill", "black")
// // //           .attr("stroke", "white")
// // //           .attr("stroke-width", 0.5);
// // //       });
// // //     });
// // //   }, [jsonData]);

// // //   return <svg ref={graphRef} style={{ width: "600px", height: "600px" }}></svg>;
// // // };

// // // export default HierarchicalGraph;

// // import React, { useEffect, useRef } from "react";
// // import * as d3 from "d3";

// // const HierarchicalGraph = ({ jsonData }) => {
// //   const graphRef = useRef(null);

// //   useEffect(() => {
// //     if (!jsonData || Object.keys(jsonData).length === 0) return;

// //     const subspaces = Object.keys(jsonData);
// //     subspaces.sort((a, b) => a.length - b.length);

// //     const pointsData = subspaces.map((key) => ({
// //       key,
// //       points: jsonData[key],
// //       dimensions: key.length,
// //       subspaceId: key,
// //     }));

// //     const svg = d3.select(graphRef.current);
// //     const width = 600;
// //     const height = 600;
// //     const margin = 20;

// //     svg.selectAll("*").remove();
// //     const maxRadius = Math.min(width, height) / 2 - margin;
// //     const g = svg
// //       .attr("width", width)
// //       .attr("height", height)
// //       .append("g")
// //       .attr("transform", `translate(${width / 2}, ${height / 2})`);

// //     pointsData.forEach((subspace, index) => {
// //       const innerRadius = (index / subspaces.length) * maxRadius;
// //       const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
// //       const sectors = 2 ** (index + 1);
// //       const colorScale = d3
// //         .scaleOrdinal()
// //         .range(["#FFD700", "#FF69B4", "#33B5E5"]);
// //       const subspaceColor = colorScale((index + 1) % colorScale.range().length);

// //       // Draw the outer circle representing the subspace
// //       g.append("circle")
// //         .attr("r", outerRadius)
// //         .attr("stroke", "black")
// //         .attr("fill", subspaceColor)
// //         .attr("fill-opacity", 0.2)
// //         .attr("stroke-width", 2);

// //       // Draw the radial lines dividing the sector
// //       for (let i = 0; i < sectors; i++) {
// //         const angle = (2 * Math.PI * i) / sectors;
// //         const x1 = outerRadius * Math.cos(angle);
// //         const y1 = outerRadius * Math.sin(angle);
// //         g.append("line")
// //           .attr("x1", 0)
// //           .attr("y1", 0)
// //           .attr("x2", x1)
// //           .attr("y2", y1)
// //           .attr("stroke", "black")
// //           .attr("stroke-width", 1);
// //       }

// //       // Place points inside the subspace
// //       subspace.points.forEach((point) => {
// //         // Randomly place points within the subspace's radial range
// //         const minRadius = innerRadius;
// //         const maxRadius = outerRadius;
// //         const randomRadius =
// //           minRadius + Math.random() * (maxRadius - minRadius);

// //         // Randomly choose an angle within the subspace's sector
// //         const sectorAngleStart = (2 * Math.PI * index) / subspaces.length;
// //         const sectorAngleEnd = (2 * Math.PI * (index + 1)) / subspaces.length;
// //         const randomAngle =
// //           sectorAngleStart +
// //           Math.random() * (sectorAngleEnd - sectorAngleStart);

// //         const x = randomRadius * Math.cos(randomAngle);
// //         const y = randomRadius * Math.sin(randomAngle);

// //         // Draw the point inside the subspace
// //         g.append("circle")
// //           .attr("cx", x)
// //           .attr("cy", y)
// //           .attr("r", 4)
// //           .attr("fill", "black")
// //           .attr("stroke", "white")
// //           .attr("stroke-width", 0.5);
// //       });
// //     });
// //   }, [jsonData]);

// //   return <svg ref={graphRef} style={{ width: "600px", height: "600px" }}></svg>;
// // };

// // export default HierarchicalGraph;
// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const HierarchicalGraph = ({ jsonData }) => {
//   const graphRef = useRef(null);

//   useEffect(() => {
//     if (!jsonData || Object.keys(jsonData).length === 0) return;

//     const subspaces = Object.keys(jsonData);
//     subspaces.sort((a, b) => a.length - b.length);

//     const pointsData = subspaces.map((key) => ({
//       key,
//       points: jsonData[key],
//       dimensions: key.length,
//       subspaceId: key,
//     }));

//     const svg = d3.select(graphRef.current);
//     const width = 600;
//     const height = 600;
//     const margin = 20;

//     svg.selectAll("*").remove();
//     const maxRadius = Math.min(width, height) / 2 - margin;
//     const g = svg
//       .attr("width", width)
//       .attr("height", height)
//       .append("g")
//       .attr("transform", `translate(${width / 2}, ${height / 2})`);

//     // Tooltip container
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

//     pointsData.forEach((subspace, index) => {
//       const innerRadius = (index / subspaces.length) * maxRadius;
//       const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
//       const sectors = 2 ** (index + 1); // Number of sectors based on subspace index
//       const colorScale = d3
//         .scaleOrdinal()
//         .range(["#FFD700", "#FF69B4", "#33B5E5"]);
//       const subspaceColor = colorScale((index + 1) % colorScale.range().length);

//       // Draw the outer circle representing the subspace
//       g.append("circle")
//         .attr("r", outerRadius)
//         .attr("stroke", "black")
//         .attr("fill", subspaceColor)
//         .attr("fill-opacity", 0.2)
//         .attr("stroke-width", 2)
//         .style("pointer-events", "none"); // Ensure circles do not block hover

//       // Draw the radial lines dividing the sector
//       for (let i = 0; i < sectors; i++) {
//         const angle = (2 * Math.PI * i) / sectors;
//         const x1 = outerRadius * Math.cos(angle);
//         const y1 = outerRadius * Math.sin(angle);
//         g.append("line")
//           .attr("x1", 0)
//           .attr("y1", 0)
//           .attr("x2", x1)
//           .attr("y2", y1)
//           .attr("stroke", "black")
//           .attr("stroke-width", 1)
//           .style("pointer-events", "none"); // Ensure radial lines do not block hover
//       }

//       // Place points inside the subspace with bit vectors
//       subspace.points.forEach((point) => {
//         // Exclude Point_ID from bit vector calculation if present
//         const pointData = Object.entries(point).filter(
//           ([key]) => key !== "Point_ID"
//         );

//         // Generate bit vector for all coordinates excluding Point_ID
//         const bitVector = pointData
//           .map(([key, coord]) => (coord >= 0 ? 1 : 0)) // 1 if positive, 0 if negative
//           .join(""); // Combine into a bit vector string

//         const minRadius = innerRadius;
//         const maxRadius = outerRadius;
//         const randomRadius =
//           minRadius + Math.random() * (maxRadius - minRadius);

//         // Randomly choose an angle within the subspace's sector
//         const sectorAngleStart = (2 * Math.PI * index) / subspaces.length;
//         const sectorAngleEnd = (2 * Math.PI * (index + 1)) / subspaces.length;
//         const randomAngle =
//           sectorAngleStart +
//           Math.random() * (sectorAngleEnd - sectorAngleStart);

//         // Position based on bit vector
//         let x = randomRadius * Math.cos(randomAngle);
//         let y = randomRadius * Math.sin(randomAngle);

//         // Adjust x, y coordinates based on bit vector (quadrants)
//         pointData.forEach(([key, coord], dimIndex) => {
//           if (bitVector[dimIndex] === "0") {
//             if (dimIndex % 2 === 0)
//               x = -Math.abs(x); // For even indices (x-axis)
//             else y = -Math.abs(y); // For odd indices (y-axis)
//           }
//         });

//         // Create a circle for each point and make sure they are on top
//         const pointElement = g
//           .append("circle")
//           .attr("cx", x)
//           .attr("cy", y)
//           .attr("r", 4)
//           .attr("fill", "black")
//           .attr("stroke", "white")
//           .attr("stroke-width", 0.5)
//           .style("pointer-events", "visible") // Make points interactive
//           .on("mouseover", (event) => {
//             tooltip.style("visibility", "visible").html(`
//                 <strong>Bit Vector:</strong> ${bitVector}<br>
//                 <strong>Coordinates:</strong> (${pointData
//                   .map(([key, coord]) => `${key}: ${coord}`)
//                   .join(", ")})
//               `);
//           })
//           .on("mousemove", (event) => {
//             tooltip
//               .style("top", event.pageY + 10 + "px")
//               .style("left", event.pageX + 10 + "px");
//           })
//           .on("mouseout", () => {
//             tooltip.style("visibility", "hidden");
//           });
//       });
//     });
//   }, [jsonData]);

//   return (
//     <>
//       <svg ref={graphRef} style={{ width: "600px", height: "600px" }}></svg>
//     </>
//   );
// };

// export default HierarchicalGraph;

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData }) => {
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

    // Tooltip container
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
      const sectors = 2 ** (index+1); // Number of sectors based on subspace dimensions
      const colorScale = d3
        .scaleOrdinal()
        .range(["#FFD700", "#FF69B4", "#33B5E5"]);
      const subspaceColor = colorScale((index + 1) % colorScale.range().length);

      // Draw the outer circle representing the subspace
      g.append("circle")
        .attr("r", outerRadius)
        .attr("stroke", "black")
        .attr("fill", subspaceColor)
        .attr("fill-opacity", 0.2)
        .attr("stroke-width", 2)
        .style("pointer-events", "none"); // Ensure circles do not block hover

      // Draw the radial lines dividing the sectors
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
          .style("pointer-events", "none"); // Ensure radial lines do not block hover
      }

      // Place points inside the subspace with bit vectors
      subspace.points.forEach((point) => {
        // Exclude Point_ID from bit vector calculation if present
        const pointData = Object.entries(point).filter(
          ([key]) => key !== "Point_ID"
        );

        // Generate bit vector for all coordinates excluding Point_ID
        const bitVector = pointData
          .map(([key, coord]) => (coord >= 0 ? 1 : 0)) // 1 if positive, 0 if negative
          .join(""); // Combine into a bit vector string

        // Calculate inner and outer radius for placement
        const minRadius = innerRadius;
        const maxRadius = outerRadius;
        const randomRadius =
          minRadius + Math.random() * (maxRadius - minRadius);

        // Calculate the angle for the sector based on the bit vector
        const bitVectorIndex = parseInt(bitVector, 2); // Convert bit vector to a decimal number (sector index)
        const angleStart = (2 * Math.PI * bitVectorIndex) / sectors;
        const angleEnd = (2 * Math.PI * (bitVectorIndex + 1)) / sectors;

        // Generate a random angle within the sector's angular range
        const randomAngle =
          angleStart + Math.random() * (angleEnd - angleStart);

        // Position based on the calculated angle and random radius
        const x = randomRadius * Math.cos(randomAngle);
        const y = randomRadius * Math.sin(randomAngle);

        // Create a circle for each point and make sure they are on top
        const pointElement = g
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", "black")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .style("pointer-events", "visible") // Make points interactive
          .on("mouseover", (event) => {
            tooltip.style("visibility", "visible").html(`
                <strong>Bit Vector:</strong> ${bitVector}<br>
                <strong>Coordinates:</strong> (${pointData
                  .map(([key, coord]) => `${key}: ${coord}`)
                  .join(", ")})
              `);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", event.pageY + 10 + "px")
              .style("left", event.pageX + 10 + "px");
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      });
    });
  }, [jsonData]);

  return (
    <>
      <svg ref={graphRef} style={{ width: "800px", height: "800px" }}></svg>
    </>
  );
};

export default HierarchicalGraph;
