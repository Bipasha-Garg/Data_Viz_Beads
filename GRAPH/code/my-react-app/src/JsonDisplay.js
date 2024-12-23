
// import React, { useEffect, useState } from "react";

// const JsonDisplay = ({ jsonFilename }) => {
//   const [jsonData, setJsonData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!jsonFilename) {
//       setError("No JSON filename provided");
//       return;
//     }
//     console.log("i am working");
//     fetch(`http://127.0.0.1:5000/public/${jsonFilename}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Failed to fetch ${jsonFilename}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setJsonData(data);
//         setError(null);
//       })
//       .catch((err) => {
//         setError(err.message);
//         console.error("Error fetching JSON:", err);
//       });
//   }, [jsonFilename]);

//   return (
//     <div>
//       {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
//       {error && <p>Error: {error}</p>}
//     </div>
//   );
// };

// export default JsonDisplay;


// import React from "react";

// const JsonDisplay = ({ jsonData }) => {
//   if (!jsonData) return null;

//   return (
//     <div className="mt-6 bg-blue p-4 rounded shadow">
//       <pre className="whitespace-pre-wrap">
//         {JSON.stringify(jsonData, null, 2)}
//       </pre>
//     </div>
//   );
// };

// export default JsonDisplay;

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HierarchicalGraph = ({ jsonData }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (!jsonData || jsonData.length === 0) return;

    // Dynamically extract coordinate keys (dimensions)
    const coordinateKeys = Object.keys(jsonData[0]).filter(
      (key) => key !== "Cluster" && key !== "Bead"
    );

    // Helper to calculate centroid
    const calculateCentroid = (points) => {
      const n = points.length;
      const sum = points.reduce((acc, point) => {
        coordinateKeys.forEach((key) => {
          acc[key] = (acc[key] || 0) + point[key];
        });
        return acc;
      }, {});
      // Compute average for each dimension
      Object.keys(sum).forEach((key) => (sum[key] /= n));
      return sum;
    };

    // Parse and process data
    const clusters = d3.group(jsonData, (d) => d.Cluster);
    const beads = d3.group(jsonData, (d) => `${d.Cluster}-${d.Bead}`);

    // Root centroid
    const rootCentroid = calculateCentroid(jsonData);

    // Cluster centroids
    const clusterCentroids = Array.from(clusters, ([cluster, points]) => ({
      cluster,
      centroid: calculateCentroid(points),
    }));

    // Bead centroids
    const beadCentroids = Array.from(beads, ([key, points]) => {
      const [cluster, bead] = key.split("-");
      return {
        cluster,
        bead,
        centroid: calculateCentroid(points),
        points,
      };
    });

    // Build hierarchical links
    const links = [];
    const nodes = [
      { id: "root", ...rootCentroid }, // Root node
    ];

    // Add cluster nodes and links
    clusterCentroids.forEach(({ cluster, centroid }) => {
      nodes.push({ id: `cluster-${cluster}`, ...centroid });
      links.push({ source: "root", target: `cluster-${cluster}` });
    });

    // Add bead nodes and links
    beadCentroids.forEach(({ cluster, bead, centroid, points }) => {
      nodes.push({ id: `bead-${cluster}-${bead}`, ...centroid });
      links.push({
        source: `cluster-${cluster}`,
        target: `bead-${cluster}-${bead}`,
      });

      // Add individual points and links
      points.forEach((point, index) => {
        const pointId = `point-${cluster}-${bead}-${index}`;
        nodes.push({ id: pointId, ...point });
        links.push({ source: `bead-${cluster}-${bead}`, target: pointId });
      });
    });

    // Set up container dimensions
    const container = d3.select(graphRef.current.parentNode);
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3
      .select(graphRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Clear previous render
    svg.selectAll("*").remove();

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(20)
      )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force(
              "collision",
              d3.forceCollide().radius((d) => (d.id.startsWith("point") ? 10 : 15)) // Adjust radii for different node types
            )

      .force("charge", d3.forceManyBody().strength(-10))
      .force(
        "center",
        d3.forceCenter(
          (width - margin.left - margin.right) / 2,
          (height - margin.top - margin.bottom) / 2
        )
      )
      .on("tick", () => {
        link
          .attr("x1", (d) => clamp(d.source.x, 0, width))
          .attr("y1", (d) => clamp(d.source.y, 0, height))
          .attr("x2", (d) => clamp(d.target.x, 0, width))
          .attr("y2", (d) => clamp(d.target.y, 0, height));

        node
          .attr("cx", (d) => clamp(d.x, 0, width))
          .attr("cy", (d) => clamp(d.y, 0, height));
      });

    // Clamp function to restrict within bounds
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    // Draw links
    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => {
        if (d.id === "root") return "red";
        if (d.id.startsWith("cluster")) return "blue";
        if (d.id.startsWith("bead")) return "green";
        return "gray";
      })
      .call(
        d3
          .drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
      );

    // Add tooltips
    node.append("title").text((d) => d.id);
  }, [jsonData]);

  return <svg ref={graphRef} style={{ width: "100%", height: "100%" }}></svg>;
};

export default HierarchicalGraph;


// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const HierarchicalGraph = ({ jsonData }) => {
//   const graphRef = useRef(null);

//   useEffect(() => {
//     if (!jsonData || jsonData.length === 0) return;

//     // Dynamically extract coordinate keys (dimensions)
//     const coordinateKeys = Object.keys(jsonData[0]).filter(
//       (key) => key !== "Cluster" && key !== "Bead"
//     );

//     // Helper to calculate centroid
//     const calculateCentroid = (points) => {
//       const n = points.length;
//       const sum = points.reduce((acc, point) => {
//         coordinateKeys.forEach((key) => {
//           acc[key] = (acc[key] || 0) + point[key];
//         });
//         return acc;
//       }, {});
//       // Compute average for each dimension
//       Object.keys(sum).forEach((key) => (sum[key] /= n));
//       return sum;
//     };

//     // Parse and process data
//     const clusters = d3.group(jsonData, (d) => d.Cluster);
//     const beads = d3.group(jsonData, (d) => `${d.Cluster}-${d.Bead}`);

//     // Root centroid
//     const rootCentroid = calculateCentroid(jsonData);

//     // Cluster centroids
//     const clusterCentroids = Array.from(clusters, ([cluster, points]) => ({
//       cluster,
//       centroid: calculateCentroid(points),
//     }));

//     // Bead centroids
//     const beadCentroids = Array.from(beads, ([key, points]) => {
//       const [cluster, bead] = key.split("-");
//       return {
//         cluster,
//         bead,
//         centroid: calculateCentroid(points),
//         points,
//       };
//     });

//     // Build hierarchical links
//     const links = [];
//     const nodes = [
//       { id: "root", ...rootCentroid }, // Root node
//     ];

//     // Add cluster nodes and links
//     clusterCentroids.forEach(({ cluster, centroid }) => {
//       nodes.push({ id: `cluster-${cluster}`, ...centroid });
//       links.push({ source: "root", target: `cluster-${cluster}` });
//     });

//     // Add bead nodes and links
//     beadCentroids.forEach(({ cluster, bead, centroid, points }) => {
//       nodes.push({ id: `bead-${cluster}-${bead}`, ...centroid });
//       links.push({
//         source: `cluster-${cluster}`,
//         target: `bead-${cluster}-${bead}`,
//       });

//       // Add individual points and links
//       points.forEach((point, index) => {
//         const pointId = `point-${cluster}-${bead}-${index}`;
//         nodes.push({ id: pointId, ...point });
//         links.push({ source: `bead-${cluster}-${bead}`, target: pointId });
//       });
//     });

//     // Render graph with D3
//     const width = 1400;
//     const height = 1000;
//     const svg = d3
//       .select(graphRef.current)
//       .attr("width", width)
//       .attr("height", height)
//       .style("border", "1px solid black");

//     // Clear previous render
//     svg.selectAll("*").remove();

//     // Force simulation
//     const simulation = d3
//       .forceSimulation(nodes)
//       .force(
//         "link",
//         d3
//           .forceLink(links)
//           .id((d) => d.id)
//           .distance(50) // Adjusted for better spacing
//       )
//       .force("charge", d3.forceManyBody().strength(-100))
//       .force("center", d3.forceCenter(width / 2, height / 2))
//       .force(
//         "collision",
//         d3.forceCollide().radius((d) => (d.id.startsWith("point") ? 10 : 15)) // Adjust radii for different node types
//       );

//     // Draw links
//     const link = svg
//       .append("g")
//       .attr("class", "links")
//       .selectAll("line")
//       .data(links)
//       .enter()
//       .append("line")
//       .attr("stroke", "#aaa")
//       .attr("stroke-width", 1.5);

//     // Draw nodes
//     const node = svg
//       .append("g")
//       .attr("class", "nodes")
//       .selectAll("circle")
//       .data(nodes)
//       .enter()
//       .append("circle")
//       .attr("r", (d) =>
//         d.id.startsWith("point") ? 5 : d.id.startsWith("bead") ? 7 : 10
//       ) // Dynamic radius
//       .attr("fill", (d) => {
//         if (d.id === "root") return "red";
//         if (d.id.startsWith("cluster")) return "blue";
//         if (d.id.startsWith("bead")) return "green";
//         return "gray";
//       })
//       .call(
//         d3
//           .drag()
//           .on("start", (event) => {
//             if (!event.active) simulation.alphaTarget(0.3).restart();
//             event.subject.fx = event.subject.x;
//             event.subject.fy = event.subject.y;
//           })
//           .on("drag", (event) => {
//             event.subject.fx = event.x;
//             event.subject.fy = event.y;
//           })
//           .on("end", (event) => {
//             if (!event.active) simulation.alphaTarget(0);
//             event.subject.fx = null;
//             event.subject.fy = null;
//           })
//       );

//     // Add tooltips
//     node.append("title").text((d) => d.id);

//     // Update simulation
//     simulation.on("tick", () => {
//       link
//         .attr("x1", (d) => d.source.x)
//         .attr("y1", (d) => d.source.y)
//         .attr("x2", (d) => d.target.x)
//         .attr("y2", (d) => d.target.y);

//       node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
//     });
//   }, [jsonData]);

//   return <svg ref={graphRef}></svg>;
// };

// export default HierarchicalGraph;
