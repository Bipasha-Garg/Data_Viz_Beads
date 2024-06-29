function filterData(data) {
  data.forEach(function (d) {
    for (let key in d) {
      if (key !== "label") {
        d[key] = +d[key];
      }
    }
  });
  return data.filter((d) => Object.values(d).every((value) => value >= 0));
}

function euclideanDistance(point1, point2) {
  return Math.sqrt(
    Object.keys(point1).reduce((sum, key) => {
      if (key !== "label") {
        return sum + Math.pow(point1[key] - point2[key], 2);
      }
      return sum;
    }, 0)
  );
}

function kmeans(data, k, maxIterations = 100) {
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }

  let clusters = new Array(k);
  let iterations = 0;
  let change = true;

  while (iterations < maxIterations && change) {
    change = false;
    clusters = new Array(k).fill(null).map(() => []);

    data.forEach((point) => {
      let minDist = Infinity;
      let clusterIndex = 0;
      centroids.forEach((centroid, index) => {
        const dist = euclideanDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = index;
        }
      });
      clusters[clusterIndex].push(point);
    });

    let newCentroids = clusters.map((cluster) => {
      let sums = {};
      cluster.forEach((point) => {
        for (let key in point) {
          if (key !== "label") {
            if (!sums[key]) {
              sums[key] = 0;
            }
            sums[key] += point[key];
          }
        }
      });
      let newCentroid = {};
      for (let key in sums) {
        newCentroid[key] = sums[key] / cluster.length;
      }
      return newCentroid;
    });

    for (let i = 0; i < k; i++) {
      if (euclideanDistance(centroids[i], newCentroids[i]) > 0.001) {
        change = true;
      }
    }
    centroids = newCentroids;
    iterations++;
  }

  return clusters;
}


// Prompt user for k value
const k = prompt("Enter the number of clusters (k):");

// Load data and perform clustering
d3.csv("diabetes.csv").then(function (data) {
  var filteredData = filterData(data);

  // Perform K-means clustering with user-provided k value
  var clusters = kmeans(filteredData, parseInt(k));

  console.log("Clusters:", clusters);

  // Call the function to plot the chart with the clustered data
  plotClusters(clusters);
});