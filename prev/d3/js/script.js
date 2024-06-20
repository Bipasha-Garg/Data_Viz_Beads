// Load data from CSV file
d3.csv("data.csv").then(function (data) {
  // Convert strings to numbers
  data.forEach(function (d) {
    d.xValue = +d.xValue;
    d.yValue = +d.yValue;
  });

  // Set up SVG dimensions and margins
  var margin = { top: 20, right: 20, bottom: 30, left: 40 };
  var width = 600 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // Append SVG to the specified div
  var svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set up scales for x and y axes
  var xScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.xValue;
      }),
    ])
    .range([0, width]);

  var yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.yValue;
      }),
    ])
    .range([height, 0]);

  // Add x-axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  // Add y-axis
  svg.append("g").call(d3.axisLeft(yScale));

  // Add dots for each data point
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.xValue);
    })
    .attr("cy", function (d) {
      return yScale(d.yValue);
    })
    .attr("r", 5); // Adjust circle radius as needed

  // Optional: Add labels to dots
  svg
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", function (d) {
      return xScale(d.xValue);
    })
    .attr("y", function (d) {
      return yScale(d.yValue);
    })
    .text(function (d) {
      return "(" + d.xValue + ", " + d.yValue + ")";
    })
    .attr("dx", 6)
    .attr("dy", ".35em");

  // Optional: Add axis labels
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 10) + ")"
    )
    .style("text-anchor", "middle")
    .text("X Axis Label");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Y Axis Label");
});
