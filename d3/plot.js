function plotClusters(clusters) {
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
  console.log("All Dimensions:", allDimensions);

  const angleSlice = (Math.PI * 2) / allDimensions.length;

  const rScale = d3
    .scaleLinear()
    .range([0, radius])
    .domain([
      0,
      d3.max(clusters.flat(), (d) => d3.max(allDimensions, (dim) => d[dim])),
    ]);

  clusters.forEach((cluster, clusterIndex) => {
    let dataValues = cluster.map((d) => {
      return allDimensions.map((dim, i) => {
        return {
          axis: dim,
          value: d[dim],
          x: rScale(d[dim]) * Math.cos(angleSlice * i - Math.PI / 2),
          y: rScale(d[dim]) * Math.sin(angleSlice * i - Math.PI / 2),
        };
      });
    });

    dataValues.forEach((data) => {
      data.forEach((d) => {
        svg
          .append("circle")
          .attr("cx", d.x)
          .attr("cy", d.y)
          .attr("r", 3)
          .attr("fill", colors(clusterIndex));
      });
    });
  });

  const axisGrid = svg.append("g").attr("class", "axisWrapper");

  axisGrid
    .selectAll(".levels")
    .data(d3.range(1, 6).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", (d) => (radius / 5) * d)
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", 0.1);

  const axis = axisGrid
    .selectAll(".axis")
    .data(allDimensions)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr(
      "x2",
      (d, i) =>
        rScale(d3.max(clusters.flat(), (p) => p[d])) *
        Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      "y2",
      (d, i) =>
        rScale(d3.max(clusters.flat(), (p) => p[d])) *
        Math.sin(angleSlice * i - Math.PI / 2)
    )
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

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
}

