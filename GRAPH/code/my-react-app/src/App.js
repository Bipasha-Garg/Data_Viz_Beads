import React, { useState } from "react";
import HierarchicalGraph from "./JsonDisplay";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        `http://127.0.0.1:5000/public/${result.json_filename}`
      );
      const processedData = await jsonResponse.json();
      setJsonData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  //   return (
  //     <div className="max-h-screen bg-gray-100 p-6">
  //       <div className="max-w-2xl mx-auto">
  //         <h1 className="text-2xl font-bold mb-4">File Upload</h1>

  //         <div className="bg-white p-6 rounded-lg shadow mb-4">
  //           <div className="mb-4">
  //             <input
  //               type="file"
  //               accept=".csv"
  //               onChange={handleFileSelect}
  //               className="mb-2"
  //               disabled={isLoading}
  //             />

  //             {fileName && (
  //               <div className="mt-2 p-2 bg-blue-50 rounded">
  //                 Selected file: <span className="font-semibold">{fileName}</span>
  //               </div>
  //             )}
  //           </div>

  //           <button
  //             type="button"
  //             onClick={handleUpload}
  //             disabled={!selectedFile || isLoading}
  //             className="bg-blue-500 text-white px-4 py-2 rounded 
  //                      disabled:bg-blue-300 disabled:cursor-not-allowed"
  //           >
  //             {isLoading ? "Processing..." : "Upload"}
  //           </button>

  //           {error && <div className="mt-2 text-red-500">{error}</div>}

  //           {isLoading && (
  //             <div className="mt-2 text-blue-500">Processing your file...</div>
  //           )}
  //         </div>
  //         <div>
  //           <h2 className="text-2xl font-bold mb-4">JSON Data</h2>
  //         </div>
  //         <div className="flex content-center" style={{ width: "1500px", height: "1200px" }}>
  //           {jsonData && <HierarchicalGraph jsonData={jsonData} />}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
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
      </div>

      {/* Main content area */}
      <div className=" h-full flex-1 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">JSON Data</h2>
        <div
          className="flex justify-center items-center bg-white shadow rounded-lg p-4"
          style={{ width: "1400px", height: "1000px" }}
        >
          {jsonData && <HierarchicalGraph jsonData={jsonData} />}
        </div>
      </div>
    </div>
  );
};
export default App;
