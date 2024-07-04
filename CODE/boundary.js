d3.json("new.json")
  .then((data) => {
    console.log("Data loaded:", data); // Debug log
    const width = 800;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const plotRadius =
      Math.min(width, height) / 2 - Math.max(margin.top, margin.bottom);

    // Process the data
    const processedData = exportFunction(data);
    console.log("Processed data:", processedData); // Debug log

    // Function to create radar chart for a specific cluster
    function createRadarChart(clusterData) {
      const svg = d3
        .select("#chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "chart")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      console.log("Creating radar chart for cluster:", clusterData); // Debug log

      // Calculate maximum distance for normalization
      let min = 0;
      clusterData.beads.forEach((bead) => {
        const distance = Math.sqrt(
          bead.coordinates.x ** 2 + bead.coordinates.y ** 2
        );
        if (distance < min) {
          min = distance;
        }
      });

      if (min === 0) {
        console.error("Min distance is zero, skipping cluster:", clusterData);
        // return;
      }

      clusterData.beads.forEach((bead) => {
        const { shape, radius, coordinates } = bead;
        // const scaledRadius = (radius / maxDistance) * plotRadius; // Adjust scaling factor as needed
        const scaledRadius = radius * 50;
        let shapeElement;
        switch (shape) {
          case "diamond":
            shapeElement = svg
              .append("rect")
              .attr("x", coordinates.x)
              .attr("y", coordinates.y)
              .attr("width", 2 * scaledRadius)
              .attr("height", 2 * scaledRadius)
              .attr(
                "transform",
                `translate(${-scaledRadius}, ${-scaledRadius}) rotate(45, ${scaledRadius}, ${scaledRadius})`
              )
              .attr("class", "bead diamond")
              .style("fill", "none")
              .style("stroke", "blue"); // Change color as needed
            break;
          case "circle":
            shapeElement = svg
              .append("circle")
              .attr("cx", coordinates.x)
              .attr("cy", coordinates.y)
              .attr("r", scaledRadius)
              .attr("class", "bead circle")
              .style("fill", "none")
              .style("stroke", "red"); // Change color as needed
            break;
          case "square":
            shapeElement = svg
              .append("rect")
              .attr("x", coordinates.x - scaledRadius)
              .attr("y", coordinates.y - scaledRadius)
              .attr("width", 2 * scaledRadius)
              .attr("height", 2 * scaledRadius)
              .attr("class", "bead square")
              .style("fill", "none")
              .style("stroke", "green"); // Change color as needed
            break;
        }
      });

      // Add grid lines for reference
      const numGrids = 5;
      const gridStep = plotRadius / numGrids;
      for (let i = 1; i <= numGrids; i++) {
        svg
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", gridStep * i)
          .attr("class", "grid")
          .style("fill", "none")
          .style("stroke", "lightgrey")
          .style("stroke-opacity", 0.7);
      }
    }

    // Create radar charts for each cluster
    processedData.forEach((cluster) => {
      createRadarChart(cluster);
    });
  })
  .catch((error) => {
    console.error("Error loading or processing data:", error);
  });

// Mock exportFunction for testing purposes (replace with your actual function)
function exportFunction(data) {
  const dataDimension = data[0].data_dimension;
  let result = [];

  for (let i = 1; i < data.length; i++) {
    const cluster = data[i];
    let clusterResult = {
      clusterNumber: cluster.cluster_number,
      beads: [],
    };

    // Process all beads in the cluster
    cluster.beads.forEach((bead) => {
      let bitVector = 0;

      // Obtain the position of the bead in axes-division of space
      for (let j = 0; j < dataDimension; j++) {
        if (bead.bead_center[j] > cluster.cluster_center[j]) {
          bitVector |= 1 << j;
        }
      }

      // Calculate the sector angle θ
      let theta = (2 * Math.PI * bitVector) / Math.pow(2, dataDimension);

      // Find the minimum distance between cluster center and bead points
      let minDistance = 100;
      bead.data_points.forEach((point) => {
        let distance = calculateDistance(cluster.cluster_center, point);
        if (distance < minDistance) {
          minDistance = distance;
        }
      });

      // Handle cases where minDistance is not finite
      if (!isFinite(minDistance)) {
        console.error("Invalid minDistance for bead:", bead);
        return;
      }

      // Place the bead in the corresponding sector in the 2-D plot
      let pNorm = bead.best_p;
      let shape = getShape(pNorm);
      let radius = bead.lp_norm;

      let bx = minDistance * Math.cos(theta);
      let by = minDistance * Math.sin(theta);

      // Handle cases where bx or by are not finite
      if (!isFinite(bx) || !isFinite(by)) {
        console.error("Invalid coordinates for bead:", bead);
        return;
      }

      clusterResult.beads.push({
        beadNumber: bead.bead_number,
        shape: shape,
        radius: radius,
        coordinates: { x: bx, y: by },
      });
    });

    result.push(clusterResult);
  }

  return result;
}

// Utility functions

function calculateDistance(point1, point2) {
  let sum = 0;
  for (let i = 0; i < point1.length; i++) {
    sum += Math.pow(Math.abs(point1[i] - point2[i]), 2);
  }
  return Math.sqrt(sum);
}

function getShape(lpNorm) {
  if (lpNorm <= 1) {
    return "diamond";
  } else if (lpNorm <= 2.5) {
    return "circle";
  } else {
    return "square";
  }
}
