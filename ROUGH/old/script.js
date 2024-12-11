d3.json("out.json")
  .then((data) => {
    const width = 800;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const radius = Math.min(width, height) / 2 - margin.top * 2;
    let showBeads = true;

    // Function to toggle bead points visibility
    function toggleBeadPoints() {
      showBeads = !showBeads;
      d3.selectAll(".radarCircle").style(
        "visibility",
        showBeads ? "visible" : "hidden"
      );
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
    console.log(...maxValues);

    // Scale for the radius based on max values
    const rScale = d3
      .scaleLinear()
      .range([0, radius])
      .domain([0, Math.max(...maxValues)]);

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
      const rmax = Math.sqrt(
        inter.reduce((sum, value) => sum + value * value, 0)
      );
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

    // Function to create radar chart for a specific cluster
    function createRadarChart(clusterData, clusterIndex) {
      const svg = d3
        .select("#chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "chart")
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

      const binnedPoints = classifyPoints(
        dimension,
        clusterData.beads.flatMap((bead) =>
          bead.data_points.map((dp) => dp.coordinates)
        ),
        radius / 3,
        1
      );

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      clusterData.beads.forEach((bead, beadIndex) => {
        const beadColor = d3.schemeCategory10[beadIndex % 10];
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
            .attr("r", 4) // Reduced radius
            .attr(
              "cx",
              rad * Math.cos(angle - Math.PI / 2) + (Math.random() - 0.5) * 5
            ) // Jitter effect
            .attr(
              "cy",
              rad * Math.sin(angle - Math.PI / 2) + (Math.random() - 0.5) * 5
            ) // Jitter effect
            .style("fill", beadColor)
            .style("fill-opacity", 0.6) // Transparency
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

    data.slice(1).forEach((cluster, index) => {
      createRadarChart(cluster, index + 1);
    });
  })
  .catch((error) => {
    console.error("Error loading or processing data:", error);
  });
