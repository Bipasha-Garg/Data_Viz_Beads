// Load JSON data
d3.json("iris.json")
  .then((data) => {
    const width = 1200;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const radius = Math.min(width, height) / 2 - margin.top * 2;
    let showBeads = true; // Initial state: show bead points

    // Function to toggle bead points visibility
    function toggleBeadPoints() {
      showBeads = !showBeads; // Toggle state
      d3.selectAll(".radarCircle") // Select all bead points
        .style("visibility", showBeads ? "visible" : "hidden"); // Show or hide based on state
    }

    // Bind toggle function to button click
    d3.select("#toggleButton").on("click", toggleBeadPoints);

    // Finding dimension, number of sectors, and angle slice of the sector
    const dimension = data[0].data_dimension;
    const numSectors = Math.pow(2, dimension);
    const angleSlice = (Math.PI * 2) / numSectors;

    // Calculate max value for normalization
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

    // Scale for the radius based on max values
    const rScale = d3
      .scaleLinear()
      .range([0, radius])
      .domain([0, Math.max(...maxValues)]);

    // Binning logic
    function binPoints(points) {
      const bins = [];

      points.forEach((dataPoint) => {
        const coordinates = dataPoint.coordinates;
        const rad = Math.sqrt(
          coordinates.reduce((acc, coord) => acc + coord * coord, 0)
        );
        const index = Math.ceil(rScale(rad) / (radius / numSectors));
        // Find quadrant
        let qnum = 0;
        coordinates.forEach((coord) => {
          qnum = qnum * 2 + (coord >= 0 ? 0 : 1);
        });

        if (!bins[index]) bins[index] = {};
        if (!bins[index][qnum]) bins[index][qnum] = [];
        bins[index][qnum].push(dataPoint);
      });

      return bins;
    }

    // Function to create radar chart for a specific cluster
    function createRadarChart(clusterData, clusterIndex) {
      const svg = d3
        .select("#chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Circular grid
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

        // Add labels for each level
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

      // Axes for each sector
      for (let i = 0; i < numSectors; i++) {
        const angle = angleSlice * i;
        // Draw the axis line
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

        // Add labels for each axis
        svg
          .append("text")
          .attr(
            "x",
            rScale(Math.max(...maxValues) * 1.1) * Math.cos(angle - Math.PI / 2)
          )
          .attr(
            "y",
            rScale(Math.max(...maxValues) * 1.1) * Math.sin(angle - Math.PI / 2)
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
      // Bin points
      const binnedPoints = binPoints(
        clusterData.beads.flatMap((bead) => bead.data_points)
      );

      // Define a color scale for the beads
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      // Data points
      binnedPoints.forEach((bin, index) => {
        if (!bin) return;
        Object.entries(bin).forEach(([qnum, points]) => {
          points.forEach((dataPoint, j) => {
            const angle = angleSlice * qnum;
            const rad = Math.sqrt(
              dataPoint.coordinates.reduce(
                (acc, coord) => acc + Math.pow(rScale(Math.abs(coord)), 2),
                0
              )
            );
            svg
              .append("circle")
              .attr("class", `radarCircle radarCircle${index}-${j}`) // Ensure each circle has a unique class
              .attr("r", 4)
              .attr("cx", rad * Math.cos(angle - Math.PI / 2))
              .attr("cy", rad * Math.sin(angle - Math.PI / 2))
              .style("fill", colorScale(index))
              .style("fill-opacity", 0.8)
              .style("visibility", showBeads ? "visible" : "hidden"); // Initial visibility based on state
          });
        });
      });

      // Add boundaries for beads
      // plotBoundaries(clusterData, clusterIndex);

      // Add a title for each cluster chart
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", -radius - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Cluster ${clusterIndex}`);

      // Add a legend
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius + 20},${-radius})`);

      // Add legend entries
      clusterData.beads.forEach((bead, j) => {
        const legendEntry = legend
          .append("g")
          .attr("transform", `translate(0, ${j * 20})`);

        legendEntry
          .append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", colorScale(j));

        legendEntry
          .append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .style("font-size", "12px")
          .text(`Bead ${j + 1}`);
      });
    }

    // Iterate through each cluster and plot its radar chart
    data.slice(1).forEach((cluster, index) => {
      createRadarChart(cluster, index + 1);
    });
    // Function to plot boundaries around beads based on best_p value
    function plotBoundaries(clusterData, clusterIndex) {
      const svg = d3.select(
        `#chart-container svg:nth-child(${clusterIndex}) g`
      );

      // Iterate through beads
      clusterData.beads.forEach((bead, j) => {
        const centroid = clusterData.cluster_center;
        const beadRadius = Math.sqrt(
          bead.data_points[0].coordinates.reduce(
            (acc, coord) => acc + Math.pow(coord, 2),
            0
          )
        ); // Assuming radius calculation is based on coordinates

        // Determine shape based on best_p value
        let shape;
        if (bead.best_p <= 1) {
          shape = "diamond";
        } else if (bead.best_p <= 2.5) {
          shape = "circle";
        } else {
          shape = "square";
        }

        // Calculate position relative to centroid and plot the shape
        const dCiBi = Math.sqrt(
          bead.data_points[0].coordinates.reduce(
            (acc, coord, idx) => acc + Math.pow(coord - centroid[idx], 2), // Assuming centroid is in the same dimension as coordinates
            0
          )
        );
        const angle =
          (Math.PI * 2 * bead.position) / Math.pow(2, clusterData.dimension);

        const bx = dCiBi * Math.cos(angle - Math.PI / 2);
        const by = dCiBi * Math.sin(angle - Math.PI / 2);

        // Plot shape
        if (shape === "diamond") {
          // Example implementation for diamond shape (customize as needed)
          svg
            .append("polygon")
            .attr(
              "points",
              `${bx},${by - beadRadius} ${bx + beadRadius},${by} ${bx},${
                by + beadRadius
              } ${bx - beadRadius},${by}`
            )
            .style("stroke", "black")
            .style("fill", "none");
        } else if (shape === "circle") {
          svg
            .append("circle")
            .attr("cx", bx)
            .attr("cy", by)
            .attr("r", beadRadius)
            .style("stroke", "black")
            .style("fill", "none");
        } else if (shape === "square") {
          // Example implementation for square shape (customize as needed)
          svg
            .append("rect")
            .attr("x", bx - beadRadius)
            .attr("y", by - beadRadius)
            .attr("width", beadRadius * 2)
            .attr("height", beadRadius * 2)
            .style("stroke", "black")
            .style("fill", "none");
        }
      });
    }
  })
  .catch((error) => {
    console.error("Error loading or processing data:", error);
  });