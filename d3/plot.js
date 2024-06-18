function plotClusters(clusters, centroids) {
  const width = 600;
  const height = 600;
  const radius = Math.min(width, height) / 2;

  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const allDimensions = Object.keys(clusters[0][0]).filter(
    (d) => d !== "label"
  );

  const rScale = d3
    .scaleLinear()
    .range([0, radius])
    .domain([
      0,
      d3.max(clusters.flat(), (d) => d3.max(allDimensions, (dim) => d[dim])),
    ]);

  // Draw radial lines (sector divisions)
  const radialLines = svg.append("g").attr("class", "radialLines");

  allDimensions.forEach((dim, i) => {
    radialLines
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr(
        "x2",
        rScale.range()[1] *
          Math.cos((i / allDimensions.length) * 2 * Math.PI - Math.PI / 2)
      )
      .attr(
        "y2",
        rScale.range()[1] *
          Math.sin((i / allDimensions.length) * 2 * Math.PI - Math.PI / 2)
      )
      .attr("stroke", "#CDCDCD") // Color of sector division lines
      .attr("stroke-width", 1); // Width of sector division lines
  });

  clusters.forEach((cluster, clusterIndex) => {
    cluster.forEach((d) => {
      allDimensions.forEach((dim, i) => {
        const x =
          rScale(d[dim]) *
          Math.cos((i / allDimensions.length) * 2 * Math.PI - Math.PI / 2);
        const y =
          rScale(d[dim]) *
          Math.sin((i / allDimensions.length) * 2 * Math.PI - Math.PI / 2);

        svg
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 3)
          .attr("fill", colors(clusterIndex))
          .style("stroke-width", "1"); // Ensure no stroke for circles
      });
    });
  });

  // Add grid circles
  const axisGrid = svg.append("g").attr("class", "axisWrapper");

  axisGrid
    .selectAll(".levels")
    .data(d3.range(1, 6).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", (d) => (radius / 5) * d)
    .style("fill", "none")
    .style("stroke", "#CDCDCD") // Grid line color
    .style("stroke-opacity", 0.5) // Grid line opacity
    .style("stroke-width", 1); // Grid line width

  // Add legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width / 2 - 100}, ${-height / 2 + 20})`);

  clusters.forEach((_, i) => {
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colors(i));

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 9)
      .text(`Cluster ${i + 1}`)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });

  // Ensure no unintended elements are added
  // svg.selectAll("line").remove(); // Remove any <line> elements
  // svg.selectAll("polygon").remove(); // Remove any <polygon> elements
  // svg.selectAll("path").remove(); // Remove any <path> elements
}

// Example usage:
// plotClusters([], []); // Replace [] with actual data if plotting clusters and centroids
