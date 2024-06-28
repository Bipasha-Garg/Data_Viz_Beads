// plotBeads.js

import * as d3 from "d3";
import { toggleBeadPoints, distance } from "./commonLogic.js";

// Function to plot beads on radar charts
function plotBeads(
  data,
  rScale,
  radius,
  numSectors,
  angleSlice,
  maxValues,
  showBeads
) {
  const svg = d3
    .select("#chart-container")
    .selectAll("svg")
    .data(data.slice(1))
    .enter()
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

  // Bin points and plot beads
  // Function to bin points and plot beads will be defined here
  // This part can be similar to the plotting logic in the original code

  // Add event listener to toggle bead points visibility
  d3.select("#toggleButton").on("click", function () {
    showBeads = !showBeads;
    toggleBeadPoints(showBeads);
  });
}

export { plotBeads };
