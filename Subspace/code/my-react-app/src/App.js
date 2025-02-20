import React, { useState } from "react";
import HierarchicalGraph from "./JsonDisplay";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCoordinates, setHoveredCoordinates] = useState(null);
  const [labelsData, setLabelsData] = useState(null);
  // Separate file selection handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  // Separate upload handler
  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent form refresh

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

      // Fetch processed data
      const jsonResponse = await fetch(
        `http://127.0.0.1:5000/uploads/${result.json_filename}`
      );
      const processedData = await jsonResponse.json();
      // Fetch labels data separately
      console.log("hogya");
      const labelsResponse = await fetch(
        `http://127.0.0.1:5000/uploads/labels_file.json`
      );
      // const labelsResponse = await fetch(
      //   `http://127.0.0.1:5000/uploads/${result.labels_file.split("/").pop()}`
      // );

      console.log("fir hogya");
      const processedLabelsData = await labelsResponse.json();
      console.log("chal toh rha hai toh fir dikkt kahan hai bc ");

      console.log(processedLabelsData);
      setJsonData(processedData);
      if (
        processedLabelsData &&
        typeof processedLabelsData.label === "string"
      ) {
        setLabelsData({ label: [processedLabelsData.label] }); // Convert to array
      } else {
        setLabelsData(processedLabelsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-6 flex">
      {/* Sidebar with CSV input */}
      <div className="w-1/4 p-4 bg-white shadow rounded-lg">
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
          className="bg-blue-500 text-white px-4 py-2 rounded 
                   disabled:bg-blue-300 disabled:cursor-not-allowed w-full"
        >
          {isLoading ? "Processing..." : "Upload"}
        </button>

        {error && <div className="mt-2 text-red-500">{error}</div>}

        {isLoading && (
          <div className="mt-2 text-blue-500">Processing your file...</div>
        )}
        <div className="my-12">
          {/* Display hovered coordinates */}
          {hoveredCoordinates && (
            <div className="mb-4 p-2 bg-green-50 rounded text-2xl text-wrap">
              <strong>Hovered Node:</strong>
              <div>ID: {hoveredCoordinates.Point_IDs}</div>
              {/* Dynamically render the coordinates */}
              {Object.keys(hoveredCoordinates)
                .filter((key) => key !== "id") // Exclude 'id' from coordinates
                .map((key) => (
                  <div key={key}>
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

      {/* Main content area */}
      <div className="h-full flex-1 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">JSON Data</h2>
        <div
          className="flex justify-center items-center bg-white shadow rounded-lg p-4"
          style={{ width: "1400px", height: "1000px" }}
        >
          {jsonData && (
            <HierarchicalGraph
              jsonData={jsonData}
              labelsData={labelsData}
              setHoveredCoordinates={setHoveredCoordinates}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default App;

// import React, { useState, useEffect } from "react";
// import HierarchicalGraph from "./JsonDisplay";

// const App = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const [jsonData, setJsonData] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hoveredCoordinates, setHoveredCoordinates] = useState(null);
//   const [selectedRings, setSelectedRings] = useState([]);
//   const [availableRings, setAvailableRings] = useState([]);

//   // Update available rings when jsonData changes
//   useEffect(() => {
//     if (jsonData) {
//       const rings = Object.keys(jsonData);
//       setAvailableRings(rings);
//       setSelectedRings(rings); // Initially select all rings
//     }
//   }, [jsonData]);

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setFileName(file.name);
//       setError(null);
//     }
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!selectedFile) {
//       setError("Please select a file first");
//       return;
//     }

//     setIsLoading(true);
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const uploadResponse = await fetch("http://127.0.0.1:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!uploadResponse.ok) {
//         throw new Error("Upload failed");
//       }

//       const result = await uploadResponse.json();
//       console.log("Upload successful:", result);

//       const jsonResponse = await fetch(
//         `http://127.0.0.1:5000/public/${result.json_filename}`
//       );

//       const processedData = await jsonResponse.json();
//       setJsonData(processedData);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRingSelection = (e) => {
//     const selectedOptions = Array.from(e.target.selectedOptions).map(
//       (option) => option.value
//     );
//     setSelectedRings(selectedOptions);
//   };

//   return (
//     <div className="h-screen bg-gray-100 p-6 flex">
//       {/* Sidebar with CSV input */}
//       <div className="w-1/4 p-4 bg-white shadow rounded-lg">
//         <h1 className="text-xl font-bold mb-4">File Upload</h1>

//         <div className="mb-4">
//           <input
//             type="file"
//             accept=".csv"
//             onChange={handleFileSelect}
//             className="mb-2 w-full"
//             disabled={isLoading}
//           />

//           {fileName && (
//             <div className="mt-2 p-2 bg-blue-50 rounded">
//               Selected file: <span className="font-semibold">{fileName}</span>
//             </div>
//           )}
//         </div>

//         <button
//           type="button"
//           onClick={handleUpload}
//           disabled={!selectedFile || isLoading}
//           className="bg-blue-500 text-white px-4 py-2 rounded
//                    disabled:bg-blue-300 disabled:cursor-not-allowed w-full"
//         >
//           {isLoading ? "Processing..." : "Upload"}
//         </button>

//         {error && <div className="mt-2 text-red-500">{error}</div>}

//         {isLoading && (
//           <div className="mt-2 text-blue-500">Processing your file...</div>
//         )}

//         {/* Multi-select dropdown for rings */}
//         {availableRings.length > 0 && (
//           <div className="mt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Select Subspace Rings
//             </label>
//             <select
//               multiple
//               value={selectedRings}
//               onChange={handleRingSelection}
//               className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//             >
//               {availableRings.map((ring) => (
//                 <option key={ring} value={ring}>
//                   {ring}
//                 </option>
//               ))}
//             </select>
//             <p className="text-sm text-gray-500 mt-1">
//               Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Command</kbd> (Mac) to
//               select multiple rings.
//             </p>
//           </div>
//         )}

//         <div className="my-12">
//           {hoveredCoordinates && (
//             <div className="mb-4 p-2 bg-green-50 rounded text-2xl text-wrap">
//               <strong>Hovered Node:</strong>
//               <div>ID: {hoveredCoordinates.Point_IDs}</div>
//               {Object.keys(hoveredCoordinates)
//                 .filter((key) => key !== "id")
//                 .map((key) => (
//                   <div key={key}>
//                     <strong>{key}:</strong>{" "}
//                     {hoveredCoordinates[key].toFixed
//                       ? hoveredCoordinates[key].toFixed(2)
//                       : hoveredCoordinates[key]}
//                   </div>
//                 ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main content area */}
//       <div className="h-full flex-1 flex flex-col items-center justify-center">
//         <h2 className="text-2xl font-bold mb-4">JSON Data</h2>
//         <div
//           className="flex justify-center items-center bg-white shadow rounded-lg p-4"
//           style={{ width: "1400px", height: "1000px" }}
//         >
//           {jsonData && (
//             <HierarchicalGraph
//               jsonData={jsonData}
//               setHoveredCoordinates={setHoveredCoordinates}
//               selectedRings={selectedRings}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
