// main.js
async function csvFile() {
  const filePath = "/path/to/your/csv_file.csv";
  const k = parseInt(prompt("Enter the number of clusters (k):"));
  const numBeads = parseInt(prompt("Enter the number of beads per cluster:"));
  const data = await fetchCsvData(filePath);
  const X = fileDataset(data);
  commands(X, k, numBeads);
}

async function customPoints() {
  const k = parseInt(prompt("Enter value of k:"));
  const datapoints = parseInt(prompt("Enter number of datapoints:"));
  const numBeads = parseInt(prompt("Enter number of beads per cluster:"));
  const X = generateDataset(datapoints, k);
  commands(X, k, numBeads);
}

async function fetchCsvData(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return await response.text();
}

function fileDataset(csvText) {
  const data = csvParse(csvText, { header: true });
  const numericColumns = Object.keys(data[0]).filter(
    (key) => !isNaN(data[0][key])
  );
  numericColumns.forEach((column) => {
    data.forEach((row) => {
      if (isNaN(row[column])) {
        row[column] = math.mean(
          data.map((r) => r[column]).filter((x) => !isNaN(x))
        );
      }
    });
  });
  return data.map((row) => Object.values(row));
}

function commands(X, k, numBeads) {
  const [yKMeans, centers] = applyKMeans(X, k);
  const clusterPoints = storeCluster(X, yKMeans, k);
  const allBeads = storeAndPrintBeads(clusterPoints, numBeads);
  const beadAnalysisResults = analyzeBeads(allBeads);
  allBeads.forEach((beads, i) => {
    plotBeads(beads, beadAnalysisResults[i], i + 1);
    plotBeadBoundaries(beads, beadAnalysisResults[i], centers);
  });
}

async function main() {
  const data = prompt("Do you want to give CSV as input (Y/N)?");
  if (data.toUpperCase() === "Y") {
    await csvFile();
  } else if (data.toUpperCase() === "N") {
    await customPoints();
  } else {
    console.log("Invalid input");
  }
}

main();
