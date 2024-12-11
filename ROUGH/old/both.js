// Function to load and process data
function loadDataAndProcess() {
  d3.json("new.json")
    .then((data) => {
      // Clear existing chart
      // d3.select("#chart-container").selectAll("*").remove();

      const width = 1000;
      const height = 1000;
      const radius = Math.min(width, height) / 2;
      let showBeads = true;

      const processedData = exportFunction(data);

      function toggleBeadPoints() {
        showBeads = !showBeads;
        d3.selectAll(".radarCircle").style(
          "visibility",
          showBeads ? "visible" : "hidden"
        );
      }

      d3.select("#toggleButton").on("click", toggleBeadPoints);
      d3.select("#chart-container").selectAll("*").remove();
      const dimension = data[0].data_dimension;
      const numSectors = Math.pow(2, dimension);
      const angleSlice = (Math.PI * 2) / numSectors;

      const maxValues = Array(dimension).fill(0);
      data.slice(1).forEach((cluster) => {
        cluster.beads.forEach((bead) => {
          bead.data_points.forEach((dataPoint) => {
            dataPoint.coordinates.forEach((coord, idx) => {
              maxValues[idx] = Math.max(maxValues[idx], Math.abs(coord));
            });
          });
        });
      });

      const rScale = d3
        .scaleLinear()
        .range([0, radius])
        .domain([0, Math.max(...maxValues)]);

      function createRadarChart(clusterData, clusterIndex) {
        const svg = d3
          .select("#chart-container")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "chart")
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);

        const levels = 4;
        for (let i = 0; i <= levels; i++) {
          const levelFactor = radius * (i / levels);
          svg
            .selectAll(`.levels-${i}`)
            .data([1])
            .enter()
            .append("circle")
            .attr("class", `levels-${i}`)
            .attr("r", levelFactor)
            .style("fill", "none")
            .style("stroke", "#CDCDCD")
            .style("stroke-opacity", 0.5);

          svg
            .selectAll(`.levels-labels-${i}`)
            .data([1])
            .enter()
            .append("text")
            .attr("x", 4)
            .attr("y", -levelFactor)
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .style("fill", "#737373")
            .text(((i / levels) * Math.max(...maxValues)).toFixed(2));
        }

        for (let i = 0; i < numSectors; i++) {
          const angle = angleSlice * i;
          svg
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr(
              "x2",
              rScale(Math.max(...maxValues)) * Math.cos(angle - Math.PI / 2)
            )
            .attr(
              "y2",
              rScale(Math.max(...maxValues)) * Math.sin(angle - Math.PI / 2)
            )
            .style("stroke", "grey")
            .style("stroke-width", "2px");

          svg
            .append("text")
            .attr(
              "x",
              rScale(Math.max(...maxValues) * 1.1) *
                Math.cos(angle - Math.PI / 2)
            )
            .attr(
              "y",
              rScale(Math.max(...maxValues) * 1.1) *
                Math.sin(angle - Math.PI / 2)
            )
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("fill", "#737373")
            .style(
              "text-anchor",
              i === 0 || i === numSectors / 2
                ? "middle"
                : i < numSectors / 2
                ? "start"
                : "end"
            )
            .text(`Sector ${i + 1}`);
        }

        clusterData.beads.forEach((bead, beadIndex) => {
          const beadColor = d3.schemeCategory10[beadIndex % 10];
          const { shape, radius, coordinates } = bead;
          const scaledRadius = rScale(radius);
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
                .style("stroke", beadColor);
              break;
            case "circle":
              shapeElement = svg
                .append("circle")
                .attr("cx", coordinates.x)
                .attr("cy", coordinates.y)
                .attr("r", scaledRadius)
                .attr("class", "bead circle")
                .style("fill", "none")
                .style("stroke", beadColor);
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
                .style("stroke", beadColor);
              break;
          }

          bead.data_points.forEach((dataPoint, dataPointIndex) => {
            const coordinates = dataPoint.coordinates;
            const angle = angleSlice * Math.floor(Math.random() * numSectors);
            const rad = Math.sqrt(
              coordinates.reduce(
                (sum, coord) => sum + Math.pow(rScale(Math.abs(coord)), 2),
                0
              )
            );
            svg
              .append("circle")
              .attr(
                "class",
                `radarCircle radarCircle${beadIndex}-${dataPointIndex}`
              )
              .attr("r", 4)
              .attr(
                "cx",
                rad * Math.cos(angle - Math.PI / 2) + (Math.random() - 0.5) * 5
              )
              .attr(
                "cy",
                rad * Math.sin(angle - Math.PI / 2) + (Math.random() - 0.5) * 5
              )
              .style("fill", beadColor)
              .style("fill-opacity", 0.6)
              .style("visibility", showBeads ? "visible" : "hidden");
          });
        });

        svg
          .append("text")
          .attr("x", 0)
          .attr("y", -radius - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text(`Cluster ${clusterIndex}`);

        const legend = svg
          .append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${radius + 20},${-radius})`);

        clusterData.beads.forEach((bead, j) => {
          const legendEntry = legend
            .append("g")
            .attr("transform", `translate(0, ${j * 20})`);

          legendEntry
            .append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d3.schemeCategory10[j % 10]);

          legendEntry
            .append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(`Bead ${j + 1}`);
        });
      }

      // Clear existing chart
      d3.select("#chart-container").selectAll("*").remove();

      // Create radar charts for each cluster
      processedData.forEach((cluster, index) => {
        createRadarChart(cluster, index + 1);
      });
    })
    .catch((error) => {
      console.error("Error loading the data:", error);
    });
}

// Function to classify points into bins
function classifyPoints(dimen, points, intervalLen, extra) {
  const meanPt = new Array(dimen).fill(0);
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < dimen; j++) {
      meanPt[j] += points[i][j];
    }
  }
  for (let j = 0; j < dimen; j++) {
    meanPt[j] /= points.length;
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < dimen; j++) {
      points[i][j] -= meanPt[j];
    }
  }

  const minPt = new Array(dimen).fill(Infinity);
  const maxPt = new Array(dimen).fill(-Infinity);

  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < dimen; j++) {
      if (points[i][j] < minPt[j]) minPt[j] = points[i][j];
      if (points[i][j] > maxPt[j]) maxPt[j] = points[i][j];
    }
  }

  const inter = maxPt.map((max, index) => max - minPt[index]);
  const rmax = Math.sqrt(inter.reduce((sum, value) => sum + value * value, 0));
  const bins = Math.max(1, Math.ceil(rmax / intervalLen) - extra);

  const distribution = Array.from({ length: bins }, () =>
    Array.from({ length: 2 ** dimen }, () => [])
  );

  for (let i = 0; i < points.length; i++) {
    const rad = Math.sqrt(
      points[i].reduce((sum, value) => sum + value * value, 0)
    );
    let index = Math.max(0, Math.ceil(rad / intervalLen) - 1);
    let qnum = 0;
    for (let j = 0; j < dimen; j++) {
      if (points[i][j] >= 0) {
        qnum = 2 * qnum;
      } else {
        qnum = 2 * qnum + 1;
      }
    }

    distribution[index][qnum].push(points[i]);
  }

  return [distribution, rmax];
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
        data_points: bead.data_points.map((point) => ({
          coordinates: point.coordinates,
        })),
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
