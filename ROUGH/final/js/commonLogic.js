// commonLogic.js

// Load JSON data
function loadData() {
  return d3.json("iris.json");
}

// Function to toggle bead points visibility
function toggleBeadPoints(showBeads) {
  d3.selectAll(".radarCircle") // Select all bead points
    .style("visibility", showBeads ? "visible" : "hidden"); // Show or hide based on state
}

// Function to find closest bead to centroid
function findClosestBead(centroid, beads) {
  let closestBead = beads[0];
  let minDistance = distance(centroid, beads[0].data_points[0].coordinates);

  beads.forEach((bead) => {
    const distanceToCentroid = distance(
      centroid,
      bead.data_points[0].coordinates
    );
    if (distanceToCentroid < minDistance) {
      minDistance = distanceToCentroid;
      closestBead = bead;
    }
  });

  return closestBead;
}

// Calculate Euclidean distance between two points
function distance(point1, point2) {
  return Math.sqrt(
    point1.reduce(
      (acc, coord, idx) => acc + Math.pow(coord - point2[idx], 2),
      0
    )
  );
}

// Export functions for use in other files
export { loadData, toggleBeadPoints, findClosestBead, distance };
