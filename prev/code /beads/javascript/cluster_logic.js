function divideClusterIntoBeads(cluster, numBeads) {
  const kmeans = new KMeans({ nClusters: numBeads });
  kmeans.fit(cluster);
  const yBeads = kmeans.predict(cluster);
  const beadCenters = kmeans.centroids;
  const beadPoints = Array.from({ length: numBeads }, () => []);

  cluster.forEach((point, i) => {
    beadPoints[yBeads[i]].push(point);
  });
  return [beadPoints, beadCenters];
}

function storeAndPrintBeads(clusterPoints, numBeads) {
  const allBeads = [];
  clusterPoints.forEach((cluster, i) => {
    const [beads, beadCenters] = divideClusterIntoBeads(cluster, numBeads);
    allBeads.push([beads, beadCenters]);
    console.log(`Cluster ${i + 1} Beads:`);
    beads.forEach((bead, j) => {
      console.log(`  Bead ${j + 1}:`);
      bead.forEach((point) => console.log(`    ${point}`));
    });
  });
  return allBeads;
}

function analyzeBeads(beads) {
  const beadAnalysisResults = [];
  beads.forEach((clusterBeads) => {
    const clusterResults = clusterBeads[0].map((bead) => {
      const bestP = calculateAndFindBestP(bead);
      return [bestP];
    });
    beadAnalysisResults.push(clusterResults);
  });
  return beadAnalysisResults;
}

function plotBeads(beads, pValue, clusterNum) {
  const numBeads = beads[0].length;
  const colors = d3.interpolateViridis.ticks(numBeads);

  // Plot beads using D3 or any other library of your choice
  // You can create shapes based on pValue and plot them accordingly
}

function plotBeadBoundaries(beads, beadAnalysisResults, clusterCenters) {
  // Plot bead boundaries using D3 or any other library of your choice
  // You can create shapes based on pValue and plot them accordingly
}
