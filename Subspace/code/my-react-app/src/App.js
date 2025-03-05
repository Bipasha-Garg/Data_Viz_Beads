  import React, { useState, useEffect, useRef } from "react";
  import * as d3 from "d3";
  import HierarchicalGraph from "./JsonDisplay";

  const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCoordinates, setHoveredCoordinates] = useState(null);
    const [labelsData, setLabelsData] = useState(null);
    const [ringVisibility, setRingVisibility] = useState({});
    const legendRef = useRef(null); // Initialize legendRef

    const subspaceLegendRef = useRef(null);
    useEffect(() => {
      if (labelsData && legendRef.current) {
        // Clear any existing SVG content in the legend container
        d3.select(legendRef.current).select("svg").remove();

        const labelEntries = Object.keys(labelsData.labels || {});
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(labelEntries);

        // Create an SVG element for the legend
        const legend = d3.select(legendRef.current)
          .append("svg")
          .attr("width", 200)
          .attr("height", labelEntries.length * 25 + 20);

        // Add rectangles for each label
        legend.selectAll("rect")
          .data(labelEntries)
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", (d, i) => i * 25)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", d => colorScale(d));

        // Add text for each label
        legend.selectAll("text")
          .data(labelEntries)
          .enter()
          .append("text")
          .attr("x", 30)
          .attr("y", (d, i) => i * 25 + 15)
          .text(d => d)
          .attr("font-size", "12px")
          .attr("alignment-baseline", "middle");
      }
    }, [labelsData]); // Re-run this effect when labelsData changes

    // useEffect(() => {
    //   if (jsonData && subspaceLegendRef.current) {
    //     d3.select(subspaceLegendRef.current).select("svg").remove();
    //     const subspaces = Object.keys(jsonData || {});
    //     const subspaceLabels = subspaces.map((_, index) => String.fromCharCode(65 + index));
    //     const legend = d3.select(subspaceLegendRef.current)
    //       .append("svg")
    //       .attr("width", 500)
    //       .attr("height", subspaces.length * 25 + 20);
    //     legend.selectAll("text")
    //       .data(subspaces)
    //       .enter()
    //       .append("text")
    //       .attr("x", 0)
    //       .attr("y", (d, i) => i * 25 + 15)
    //       .text((d, i) => `${subspaceLabels[i]} = ${d}`)
    //       .attr("font-size", "12px")
    //       .attr("alignment-baseline", "middle");
    //   }
    // }, [jsonData]);

    useEffect(() => {
      if (jsonData && subspaceLegendRef.current) {
        // Clear previous legend content
        d3.select(subspaceLegendRef.current).html("");

        const subspaces = Object.keys(jsonData || {});
        const subspaceLabels = subspaces.map((_, index) => String.fromCharCode(65 + index));

        // Create a container for the legend items
        const legendContainer = d3.select(subspaceLegendRef.current)
          .append("div")
          .attr("class", "flex flex-wrap gap-2 w-full");

        // Append legend items
        legendContainer.selectAll("div")
          .data(subspaces)
          .enter()
          .append("div")
          .attr("class", "p-2 bg-gray-200 rounded w-full break-words")
          .text((d, i) => `${subspaceLabels[i]} = ${d}`);
      }
    }, [jsonData]);

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

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const result = await uploadResponse.json();
        console.log("Upload successful:", result);

        const jsonResponse = await fetch(
          `http://127.0.0.1:5000/uploads/${result.json_filename}`
        );
        const processedData = await jsonResponse.json();

        const labelsResponse = await fetch(
          `http://127.0.0.1:5000/uploads/labels_file.json`
        );
        const processedLabelsData = await labelsResponse.json();

        setJsonData(processedData);
        setLabelsData(processedLabelsData);

        // Initialize ring visibility
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
      setRingVisibility((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
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
      <div className="h-screen bg-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row">
        {/* Left Dashboard */}
        <div className="w-full sm:w-1/4 p-4 bg-white shadow rounded-lg mb-4 sm:mb-0 sm:mr-4">
          <h1 className="text-xl font-bold mb-4">File Upload</h1>
          <div className="mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="mb-2 w-full"
              disabled={isLoading}
            />
            {fileName && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                Selected file: <span className="font-semibold">{fileName}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            {isLoading ? "Processing..." : "Upload"}
          </button>
          {error && <div className="mt-2 text-red-500">{error}</div>}

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Subspace Rings</h2>
            <button
              onClick={toggleAllRingsVisibility}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
            >
              {Object.values(ringVisibility).every((v) => v)
                ? "Collapse All Rings"
                : "Expand All Rings"}
            </button>
            {Object.keys(jsonData || {}).map((key) => (
              <div key={key} className="mb-2">
                <button
                  onClick={() => toggleRingVisibility(key)}
                  className="w-full p-2 text-left rounded"
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

        {/* Visualization Area */}
        <div className="flex-1 flex flex-col bg-white shadow rounded-lg p-4 mb-4 sm:mb-0 sm:mr-4">
          <h2 className="text-2xl font-bold mb-4">Visualization</h2>
          <div className="flex-1 flex justify-center items-center">
            {jsonData && (
              <HierarchicalGraph
                jsonData={jsonData}
                labelsData={labelsData}
                setHoveredCoordinates={setHoveredCoordinates}
                ringVisibility={ringVisibility}
              />
            )}
          </div>
        </div>

        {/* Right Dashboard */}
        <div className="w-full sm:w-1/4 p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-bold mb-4">Point Info</h2>

          {/* Subspace Legend */}
          <div ref={subspaceLegendRef} className="flex flex-wrap w-full overflow-auto max-h-60">
            {/* Ensure text takes full width */}
          </div>

          {/* Labels Legend */}
          <div ref={legendRef} className="mt-4"></div>

          {/* Hovered Node Info */}
          {hoveredCoordinates && (
            <div className="p-2 bg-green-50 rounded text-lg w-full break-words">
              <strong>Hovered Node:</strong>
              <div className="w-full">ID: {hoveredCoordinates.Point_IDs}</div>
              {Object.keys(hoveredCoordinates)
                .filter((key) => key !== "id")
                .map((key) => (
                  <div key={key} className="w-full break-words">
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
    );
  };

  export default App;