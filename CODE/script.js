d3.json("out.json").then(data => {
  console.log(data);
  const width = 1000;
  const height = 1000;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const radius = Math.min(width, height) / 2 - margin.top * 2;
  const dimension = data[0].data_dimension;
  var numSectors = Math.pow(2, dimension);
  var angleSlice = (Math.PI * 2) / numSectors;
  

}).catch ((error)=> {
  console.error("Error loading or processing data:", error);
})