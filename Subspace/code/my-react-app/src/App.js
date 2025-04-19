
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import HierarchicalGraph from "./JsonDisplay";
// import HierarchicalGraph from "./GraphBase";
import ScatterPlot from "./ScatterPlot";
import ParallelCoordinates from "./ParallelCoordinates";
import HorizontalStrip from "./strip";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCoordinates, setHoveredCoordinates] = useState(null);
  const [labelsData, setLabelsData] = useState(null);
  const [classificationData, setClassificationData] = useState(null);
  const [parallelData, setParallelData] = useState(null);
  const [ringVisibility, setRingVisibility] = useState({});
  const legendRef = useRef(null);
  const subspaceLegendRef = useRef(null);
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (labelsData && legendRef.current) {
      d3.select(legendRef.current).select("svg").remove();
      const labelEntries = Object.keys(labelsData.labels || {});
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(labelEntries);
      const legendHeight = Math.min(labelEntries.length * 25 + 20, dimensions.height * 0.3);

      const legend = d3.select(legendRef.current)
        .append("svg")
        .attr("width", "100%")
        .attr("height", legendHeight);

      const legendGroup = legend.append("g")
        .attr("transform", "translate(10,10)");

      legendGroup.selectAll("rect")
        .data(labelEntries)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (_, i) => i * 25)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d));

      legendGroup.selectAll("text")
        .data(labelEntries)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (_, i) => i * 25 + 15)
        .text(d => d)
        .attr("font-size", "clamp(10px, 2vw, 12px)")
        .attr("alignment-baseline", "middle");
    }
  }, [labelsData, dimensions]);

  useEffect(() => {
    if (jsonData && subspaceLegendRef.current) {
      d3.select(subspaceLegendRef.current).html("");
      const subspaces = Object.keys(jsonData || {});
      const subspaceLabels = subspaces.map((_, index) => String.fromCharCode(65 + index));
      const legendContainer = d3.select(subspaceLegendRef.current)
        .append("div")
        .attr("class", "flex flex-col gap-2 w-full overflow-y-auto")
        .style("max-height", "20vh");

      legendContainer.selectAll("div")
        .data(subspaces)
        .enter()
        .append("div")
        .attr("class", "p-2 bg-gray-200 rounded text-sm break-words")
        .text((d, i) => `${subspaceLabels[i]} = ${d}`);
    }
  }, [jsonData, dimensions]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const uploadResponse = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const result = await uploadResponse.json();
      const jsonResponse = await fetch(`http://127.0.0.1:5000/uploads/${result.json_filename}`);
      const processedData = await jsonResponse.json();

      const labelsResponse = await fetch(`http://127.0.0.1:5000/uploads/labels_file.json`);
      const processedLabelsData = await labelsResponse.json();

      const classificationResponse = await fetch(`http://127.0.0.1:5000/uploads/classification.json`);
      const classificationData = await classificationResponse.json();

      const parallelResponse = await fetch(`http://127.0.0.1:5000/uploads/parallel.json`);
      const parallelData = await parallelResponse.json();

      setJsonData(processedData);
      setLabelsData(processedLabelsData);
      setClassificationData(classificationData);
      setParallelData(parallelData);

      const subspaces = Object.keys(processedData);
      subspaces.sort((a, b) => a.length - b.length);
      const initialVisibility = subspaces.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setRingVisibility(initialVisibility);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRingVisibility = (key) => {
    setRingVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllRingsVisibility = () => {
    const subspaces = Object.keys(jsonData || {});
    subspaces.sort((a, b) => a.length - b.length);
    const newVisibility = subspaces.reduce((acc, key, index) => {
      acc[key] = index >= subspaces.length - 2 ? true : !ringVisibility[key];
      return acc;
    }, {});
    setRingVisibility(newVisibility);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 p-2 sm:p-4 flex flex-col gap-4"
    >
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Left Dashboard */}
        <div className="w-full lg:w-1/4 p-4 bg-white shadow rounded-lg min-w-[250px]">
          <h1 className="text-lg sm:text-xl font-bold mb-4">File Upload</h1>
          <div className="mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="mb-2 w-full text-sm"
              disabled={isLoading}
            />
            {fileName && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                Selected file: <span className="font-semibold">{fileName}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full text-sm sm:text-base disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Upload"}
          </button>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

          <div className="mt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Subspace Rings</h2>
            <button
              onClick={toggleAllRingsVisibility}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4 text-sm sm:text-base"
            >
              {Object.values(ringVisibility).every((v) => v)
                ? "Collapse All Rings"
                : "Expand All Rings"}
            </button>
            <div className="max-h-[30vh] overflow-y-auto">
              {Object.keys(jsonData || {}).map((key) => (
                <div key={key} className="mb-2">
                  <button
                    onClick={() => toggleRingVisibility(key)}
                    className="w-full p-2 text-left rounded text-sm break-words"
                    style={{
                      backgroundColor: ringVisibility[key] ? "#fca5a5" : "lightgray",
                      border: "1px solid #ccc",
                    }}
                  >
                    {ringVisibility[key] ? `- ${key}` : `+ ${key}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="flex-1 flex flex-col bg-white shadow rounded-lg p-4">
          <h2 className="text-lg sm:text-2xl font-bold mb-4">Hierarchical Graph</h2>
          <div className="flex-1 w-full overflow-auto">
            {jsonData && (
              <HierarchicalGraph
                jsonData={jsonData}
                labelsData={labelsData}
                setHoveredCoordinates={setHoveredCoordinates}
                ringVisibility={ringVisibility}
                width={dimensions.width * 0.7}  // Pass dynamic width
                height={dimensions.height * 0.5} // Pass dynamic height
              />
            )}
          </div>
          {/* Horizontal Strip Visualization */}
          {/* {jsonData && (
            <div className="mt-6 w-full">
              <HorizontalStrip
                jsonData={jsonData}
                labelsData={labelsData}
                setHoveredCoordinates={setHoveredCoordinates}
                stripHeight={120}
                stripMargin={{ top: 30, right: 30, bottom: 40, left: 30 }}
              />
            </div>
          )} */}
        </div>

        {/* Right Dashboard */}
        <div className="w-full lg:w-1/4 p-4 bg-white shadow rounded-lg min-w-[200px]">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Point Info</h2>
          <div
            ref={subspaceLegendRef}
            className="w-full overflow-y-auto mb-4"
            style={{ maxHeight: '20vh' }}
          />
          <div
            ref={legendRef}
            className="mt-4 overflow-y-auto"
            style={{ maxHeight: '20vh' }}
          />
          {hoveredCoordinates && (
            <div className="p-2 bg-green-50 rounded text-sm w-full break-words">
              <strong>Hovered Node:</strong>
              <div>ID: {hoveredCoordinates.Point_IDs}</div>
              {Object.keys(hoveredCoordinates)
                .filter((key) => key !== "id")
                .map((key) => (
                  <div key={key} className="break-words">
                    <strong>{key}:</strong>{" "}
                    {hoveredCoordinates[key].toFixed
                      ? hoveredCoordinates[key].toFixed(2)
                      : hoveredCoordinates[key]}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* New Visualizations */}
      <div className="w-full flex flex-col lg:flex-row gap-4">
        {/* Scatter Plot */}
        {/* <div className="w-full lg:w-1/2 p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Scatter Plot</h2>
          <div className="w-full h-[40vh] overflow-auto">
            {classificationData && (
              <ScatterPlot
                data={classificationData}
                width={dimensions.width * 0.45}
                height={dimensions.height * 0.4}
              />
            )}
          </div>
        </div> */}

        {/* Parallel Coordinates */}
        {/* <div className="w-full lg:w-1/2 p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Parallel Coordinates</h2>
          <div className="w-full h-[40vh] overflow-auto">
            {parallelData && (
              <ParallelCoordinates
                data={parallelData}
                width={dimensions.width * 0.45}
                height={dimensions.height * 0.4}
              />
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default App;