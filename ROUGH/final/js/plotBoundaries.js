// plotBoundaries.js

import * as d3 from "d3";
import { findClosestBead } from "./commonLogic.js";

// Function to plot boundaries around beads based on best_p value
function plotBoundaries(clusterData, clusterIndex, svg) {
  // Iterate through beads
  clusterData.beads.forEach((bead, j) => {
    const centroid = clusterData.cluster_center;
    const closestBead = findClosestBead(centroid, bead.data_points);

    // Calculate radius based on lp_norm value of the bead group
    const lp_norm = bead.lp_norm; // Assuming lp_norm is defined in your bead object
    const beadRadius = lp_norm; /* Scale factor or constant for radius */

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

    // Plot shape based on shape type
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
      // Example implementation for circle shape (customize as needed)
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

export { plotBoundaries };
