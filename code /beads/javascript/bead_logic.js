// bead_logic.js
function applyKMeans(X, clusters) {
  const kmeans = new KMeans({ nClusters: clusters });
  const sampleLabels = kmeans.fitPredict(X);
  const centers = kmeans.centroids;
  return [sampleLabels, centers];
}

function storeCluster(X, yKMeans, k) {
  const clusterPoints = Array.from({ length: k }, () => []);
  X.forEach((point, i) => {
    clusterPoints[yKMeans[i]].push(point);
  });
  return clusterPoints;
}

function calculateAndFindBestP(cluster) {
  const centroid = math.mean(cluster, 0);
  const pValues = [0.25, 0.5, 1.0, 2.0, 5.0];
  const alphaRange = math.range(1.1, 1.2, true).toArray();
  const T = [];

  pValues.forEach((p) => {
    const distances = cluster.map((point) => [
      math.norm(point - centroid, p),
      point,
    ]);
    const [disMax, pointMax] = math.max(distances, ([distance]) => distance);
    T.push([p, disMax, pointMax]);
  });
  T.sort((a, b) => b[0] - a[0]);

  for (const alpha of alphaRange) {
    let tempT = T.slice();
    while (tempT.length) {
      const t1 = tempT.shift();
      const [p1, r1, f1] = t1;
      if (!tempT.length) break;
      const [p2, r2] = tempT[0];
      if (r2 < alpha * r1) return p2;
    }
  }
  return T[0][0];
}
