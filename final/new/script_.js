// Load JSON data
d3.json("iris.json")
  .then((data) => {
    const width = 1200;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const radius = Math.min(width, height) / 2 - margin.top;

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

    // Function to create radar chart for a specific cluster
    function createRadarChart(clusterData, clusterIndex) {
      const svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Tooltip
      const tooltip = d3.select("body").append("div").attr("class", "tooltip");

      // Circular grid
      const levels = 5;
      for (let i = 0; i <= levels; i++) {
        const levelFactor = radius * (i / levels);
        svg
          .selectAll(`.levels-${i}`)
          .data([1]) // Dummy data to trigger the enter() selection
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
          .data([1]) // Dummy data to trigger the enter() selection
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

      // Define a color scale for the beads
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      // Function to draw shapes
      function drawShape(svg, shape, x, y, size, color) {
        if (shape === "diamond") {
          svg
            .append("rect")
            .attr("x", x - size / 2)
            .attr("y", y - size / 2)
            .attr("width", size)
            .attr("height", size)
            .attr("transform", `rotate(45, ${x}, ${y})`)
            .style("fill", color)
            .style("fill-opacity", 0.8);
        } else if (shape === "circle") {
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size / 2)
            .style("fill", color)
            .style("fill-opacity", 0.8);
        } else if (shape === "square") {
          svg
            .append("rect")
            .attr("x", x - size / 2)
            .attr("y", y - size / 2)
            .attr("width", size)
            .attr("height", size)
            .style("fill", color)
            .style("fill-opacity", 0.8);
        }
      }

      // Find the closest bead to the center of the cluster
      clusterData.beads.forEach((bead, j) => {
        // Find the closest bead to the cluster center
        let closestBead = bead.data_points[0];
        let minDistance = Infinity;

        bead.data_points.forEach((dataPoint) => {
          const distance = Math.sqrt(
            dataPoint.coordinates.reduce((acc, coord, idx) => {
              return (
                acc + Math.pow(coord - clusterData.center.coordinates[idx], 2)
              );
            }, 0)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestBead = dataPoint;
          }
        });

        const closestBeadDistance = minDistance;
        const closestBeadRadius = closestBead.radius;

        // Determine the shape based on best_p value
        let shape = "square";
        if (bead.best_p <= 1) {
          shape = "diamond";
        } else if (bead.best_p <= 2.5) {
          shape = "circle";
        }

        // Compute sector angle
        const sectorBitVector = closestBead.coordinates.map((coord, idx) =>
          coord > clusterData.center.coordinates[idx] ? 1 : 0
        );
        const sectorIndex = parseInt(sectorBitVector.join(""), 2);
        const angle = (Math.PI * 2 * sectorIndex) / numSectors;

        // Calculate the position of the bead
        const bx = closestBeadDistance * Math.cos(angle - Math.PI / 2);
        const by = closestBeadDistance * Math.sin(angle - Math.PI / 2);

        // Draw the shape at the calculated position
        drawShape(svg, shape, bx, by, closestBeadRadius * 2, colorScale(j));

        // Data points
        bead.data_points.forEach((dataPoint, k) => {
          // Determine the angle for the data point based on its binary coordinates
          const sector = parseInt(dataPoint.coordinates.join(""), 2);
          const angle = angleSlice * sector;

          // Calculate the radius value for each coordinate
          const value = Math.sqrt(
            dataPoint.coordinates.reduce((acc, coord, idx) => {
              return acc + Math.pow(rScale(Math.abs(coord)), 2);
            }, 0)
          );

          // Append data point circles
          svg
            .append("circle")
            .attr("class", `radarCircle${j + 1}`)
            .attr("r", 4)
            .attr("cx", value * Math.cos(angle - Math.PI / 2))
            .attr("cy", value * Math.sin(angle - Math.PI / 2))
            .style("fill", colorScale(j)) // Assign color based on bead index
            .style("fill-opacity", 0.8)
            .on("mouseover", function (event, d) {
              tooltip
                .style("visibility", "visible")
                .html(`Coordinates: ${dataPoint.coordinates.join(", ")}`)
                .style("top", `${event.pageY}px`)
                .style("left", `${event.pageX}px`);
            })
            .on("mousemove", function (event, d) {
              tooltip
                .style("top", `${event.pageY}px`)
                .style("left", `${event.pageX}px`);
            })
            .on("mouseout", function (event, d) {
              tooltip.style("visibility", "hidden");
            });
        });
      });

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

    // Toggle button functionality
    const toggleButton = d3.select("#toggleButton");
    let dataPointsVisible = true;

    toggleButton.on("click", () => {
      dataPointsVisible = !dataPointsVisible;
      if (dataPointsVisible) {
        d3.selectAll("circle").style("visibility", "visible");
        toggleButton.text("Hide Data Points");
      } else {
        d3.selectAll("circle").style("visibility", "hidden");
        toggleButton.text("Show Data Points");
      }
    });
  })
  .catch((error) => {
    console.error("Error loading or processing data:", error);
  });
