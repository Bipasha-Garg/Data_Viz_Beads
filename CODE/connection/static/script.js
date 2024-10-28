// Load the JSON data
async function fetchData() {
  try {
    const response = await fetch("../uploads/data.json"); // Fetches from /uploads/data.json
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    processData(data); // Pass data to processData function
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}


function processData(data) {
    // Your data processing logic here
    console.log('Processed Data:', data);

    // Constants for the plot dimensions and margins
    const width = 800;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const plotRadius =
      Math.min(width, height) / 2 - Math.max(margin.top, margin.bottom);

    const svgContainer = d3.select("#chart-container");

    // Process the data using the exportFunction
    const processedData = exportFunction(data);
    console.log("Processed data:", processedData);

    // Determine the dimension of the data
    const dataDimension = data[0].data_dimension;
    const maxValues = Array(dataDimension).fill(0);

    // Calculate the maximum values across all dimensions for normalization
    data.slice(1).forEach((cluster) => {
      cluster.beads.forEach((bead) => {
        bead.data_points.forEach((dataPoint) => {
          dataPoint.coordinates.forEach((coord, idx) => {
            maxValues[idx] = Math.max(maxValues[idx], Math.abs(coord));
          });
        });
      });
    });

    // Create a scale for the radius
    const rScale = d3
      .scaleLinear()
      .range([0, plotRadius])
      .domain([0, Math.max(...maxValues)]);
    function createRadarChart(clusterData) {
      const mainSvg = svgContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "chart")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      console.log("Creating radar chart for cluster:", clusterData);

      // Calculate distances of each bead center from the origin (0, 0)
      const distances = clusterData.beads.map((bead) => {
        const { x, y } = bead.coordinates;
        return Math.sqrt(x * x + y * y);
      });

      // Sort distances and use them for concentric circles
      const sortedDistances = distances.sort((a, b) => a - b);

      // Plot concentric circles based on distances for this specific cluster
      sortedDistances.forEach((distance) => {
        mainSvg
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", rScale(distance))
          .attr("class", "grid")
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-opacity", 0.7);
      });

      // Plot the beads and their data points for this cluster
      clusterData.beads.forEach((bead, beadIndex) => {
        const { shape, radius, coordinates } = bead;
        const scaledRadius = rScale(radius);
        const beadColor = d3.schemeCategory10[beadIndex % 10];

        // Plot the bead center
        const beadCenter = mainSvg
          .append("circle")
          .attr("cx", rScale(coordinates.x))
          .attr("cy", rScale(coordinates.y))
          .attr("r", 5)
          .attr("class", "bead-center")
          .style("fill", beadColor)
          .style("stroke", beadColor)
          .style("stroke-width", 2);

        // Create the shape elements based on the bead's shape
        let shapeElement;
        switch (shape) {
          case "diamond":
            shapeElement = mainSvg
              .append("rect")
              .attr("x", rScale(coordinates.x) - scaledRadius)
              .attr("y", rScale(coordinates.y) - scaledRadius)
              .attr("width", 2 * scaledRadius)
              .attr("height", 2 * scaledRadius)
              .attr(
                "transform",
                `rotate(45, ${rScale(coordinates.x)}, ${rScale(coordinates.y)})`
              )
              .attr("class", "bead diamond")
              .style("fill", "none")
              .style("stroke", beadColor)
              .style("stroke-width", 2)
              .style("stroke-dasharray", "5,5");
            break;
          case "circle":
            shapeElement = mainSvg
              .append("circle")
              .attr("cx", rScale(coordinates.x))
              .attr("cy", rScale(coordinates.y))
              .attr("r", scaledRadius)
              .attr("class", "bead circle")
              .style("fill", "none")
              .style("stroke", beadColor)
              .style("stroke-width", 2);
            break;
          case "square":
            shapeElement = mainSvg
              .append("rect")
              .attr("x", rScale(coordinates.x) - scaledRadius)
              .attr("y", rScale(coordinates.y) - scaledRadius)
              .attr("width", 2 * scaledRadius)
              .attr("height", 2 * scaledRadius)
              .attr("class", "bead square")
              .style("fill", "none")
              .style("stroke", beadColor)
              .style("stroke-width", 2);
            break;
        }

        // Plot data points within the bead
        bead.data_points.forEach((dataPoint) => {
          const pointCoordinates = dataPoint.coordinates.map((coord) =>
            rScale(coord)
          );

          console.log("Plotting data point:", pointCoordinates);

          mainSvg
            .append("circle")
            .attr("cx", pointCoordinates[0])
            .attr("cy", pointCoordinates[1])
            .attr("r", 2)
            .attr("class", "data-point")
            .style("fill", beadColor)
            .style("opacity", 0.6)
            .on("mouseover", function () {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 4)
                .style("opacity", 1);
            })
            .on("mouseout", function () {
              d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 2)
                .style("opacity", 0.6);
            });
        });

        // Add hover interaction to show data points in a new plot with fan animation
        beadCenter
          .on("mouseover", function () {
            // Remove any existing fan plot
            d3.selectAll(".fan-plot").remove();

            // Create a new SVG for the fan plot
            const fanPlotSvg = svgContainer
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "fan-plot")
              .append("g")
              .attr("transform", `translate(${width / 2},${height / 2})`);

            // Add a semi-transparent background to the fan plot
            fanPlotSvg
              .append("rect")
              .attr("x", -width / 2)
              .attr("y", -height / 2)
              .attr("width", width)
              .attr("height", height)
              .style("fill", "white")
              .style("fill-opacity", 0.7);

            // Add concentric circles to the fan plot
            const numCircles = 5;
            const gridStep = plotRadius / numCircles;
            for (let i = 1; i <= numCircles; i++) {
              fanPlotSvg
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", gridStep * i)
                .style("fill", "none")
                .style("stroke", "black")
                .style("stroke-opacity", 0.3);
            }

            // Add the boundary and data points to the fan plot
            bead.data_points.forEach((dataPoint) => {
              const pointCoordinates = dataPoint.coordinates.map((coord) =>
                rScale(coord)
              );

              fanPlotSvg
                .append("circle")
                .attr("cx", pointCoordinates[0])
                .attr("cy", pointCoordinates[1])
                .attr("r", 2)
                .attr("class", "fan-data-point")
                .style("fill", d3.schemeCategory10[beadIndex % 10])
                .style("opacity", 0.8)
                .on("mouseover", function () {
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 4)
                    .style("opacity", 1);
                })
                .on("mouseout", function () {
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", 2)
                    .style("opacity", 0.8);
                });
            });

            // Animate the appearance of the fan plot
            fanPlotSvg
              .selectAll("*")
              .attr("opacity", 0)
              .transition()
              .duration(500)
              .attr("opacity", 1);
          })
          .on("mouseout", function () {
            d3.selectAll(".fan-plot").remove(); // Remove the fan plot on mouse out
          });
      });

      // Add labels
      mainSvg
        .append("text")
        .attr("x", 0)
        .attr("y", -plotRadius - 20)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text(`Cluster ${clusterData.clusterNumber}`)
        .style("font-size", "16px")
        .style("font-weight", "bold");
    }

    // Create radar charts for each cluster
    processedData.forEach((cluster) => {
      createRadarChart(cluster);
    });
  }
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

      // Get the coordinates of the bead center for plotting
      const bx = bead.bead_center[0];
      const by = bead.bead_center[1];

      // Ensure bx and by are finite
      if (!isFinite(bx) || !isFinite(by)) {
        console.error("Invalid coordinates for bead:", bead);
        return;
      }

      let pNorm = bead.best_p;
      let shape = getShape(pNorm);
      let radius = bead.lp_norm;

      clusterResult.beads.push({
        beadNumber: bead.bead_number,
        shape: shape,
        radius: radius,
        coordinates: { x: bx, y: by },
        data_points: bead.data_points,
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

fetchData();