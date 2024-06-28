import { clustering } from "./cluster.js"; // Adjust the path as per your file structure

function renderPlot(clusterNum, beadNum) {
  // Your D3.js code to render the plot using clusterNum and beadNum
  console.log("Cluster Number:", clusterNum);
  console.log("Bead Number:", beadNum);

  const csv_file = "/home/bipasha/Desktop/research/Data_Viz_Beads/JS/Iris.csv";
  d3.csv(csv_file)
    .then(function (data) {
      // Your plotting logic here using D3.js
      console.log("Data loaded:", data);
      // Example: Plotting a scatterplot
      // Replace this with your actual D3.js code to render the plot
      const svg = d3
        .select("#plot")
        .append("svg")
        .attr("width", 400)
        .attr("height", 400);

      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.SepalLength)
        .attr("cy", (d) => d.SepalWidth)
        .attr("r", 3)
        .attr("fill", "steelblue");
    })
    .catch(function (error) {
      console.log("Error loading data:", error);
    });
}

export { renderPlot };
    