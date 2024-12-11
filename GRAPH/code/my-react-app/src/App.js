// import React, { useState } from "react";

// function App() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [jsonDetails, setJsonDetails] = useState(null); // State for JSON file details

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       if (selectedFile.size > 20 * 1024 * 1024) {
//         setStatus("File size exceeds 20MB limit.");
//         setFile(null);
//       } else if (!selectedFile.name.endsWith(".csv")) {
//         setStatus("Please select a CSV file.");
//         setFile(null);
//       } else {
//         setFile(selectedFile);
//         setStatus("");
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       setStatus("Please select a file before uploading.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setIsLoading(true);
//       const response = await fetch("http://127.0.0.1:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.text();
//         setIsLoading(false);
//         setStatus(`Upload failed with status ${response.status}: ${errorData}`);
//         return;
//       }

//       const data = await response.json();
//       setIsLoading(false);
//       setStatus(`Upload successful: ${data.message}`);

//       // Set the JSON file details in the state
//       setJsonDetails({
//         jsonFolder: data.json_folder,
//         jsonFilename: data.json_filename,
//         jsonPath: data.json_path,
//       });
//     } catch (error) {
//       setIsLoading(false);
//       setStatus("Error uploading file. Please try again.");
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
//       <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
//         <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
//           Upload Your File
//         </h2>
//         <form className="mb-6">
//           <label className="block">
//             <span className="text-sm font-medium text-gray-700">
//               Choose a file
//             </span>
//             <div className="relative mt-2">
//               {/* Hidden file input */}
//               <input
//                 type="file"
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 onChange={handleFileChange}
//               />
//               {/* Custom styled button */}
//               <div className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
//                 Browse
//               </div>
//             </div>
//           </label>
//           <p className="mt-2 text-xs text-gray-500">
//             Only CSV files are allowed. Maximum file size: 20MB.
//           </p>
//         </form>
//         {file && (
//           <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
//             <p className="text-blue-700 text-sm">
//               Selected file: <span className="font-medium">{file.name}</span>
//             </p>
//           </div>
//         )}
//         <button
//           onClick={handleSubmit}
//           disabled={!file || isLoading}
//           className={`w-full py-3 px-5 rounded-lg text-white font-semibold transition-colors ${
//             isLoading
//               ? "bg-blue-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           {isLoading ? "Uploading..." : "Upload File"}
//         </button>
//         {status && (
//           <div
//             className={`mt-6 text-sm text-center p-4 rounded-lg ${
//               status.includes("successful")
//                 ? "bg-green-50 text-green-700 border-l-4 border-green-400"
//                 : "bg-red-50 text-red-700 border-l-4 border-red-400"
//             }`}
//           >
//             {status}
//           </div>
//         )}

//         {/* Display the JSON file details if available */}
//         {jsonDetails && (
//           <div className="mt-6 bg-gray-50 p-4 border-l-4 border-blue-400">
//             <h3 className="font-bold text-lg">JSON File Details</h3>
//             <p>
//               <strong>Folder:</strong> {jsonDetails.jsonFolder}
//             </p>
//             <p>
//               <strong>Filename:</strong> {jsonDetails.jsonFilename}
//             </p>
//             <p>
//               <strong>File Path:</strong> {jsonDetails.jsonPath}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import JsonDisplay from "./JsonDisplay";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jsonDetails, setJsonDetails] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        setStatus("File size exceeds 20MB limit.");
        setFile(null);
      } else if (!selectedFile.name.endsWith(".csv")) {
        setStatus("Please select a CSV file.");
        setFile(null);
      } else {
        setFile(selectedFile);
        setStatus("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        setIsLoading(false);
        setStatus(`Upload failed with status ${response.status}: ${errorData}`);
        return;
      }

      const data = await response.json();
      setIsLoading(false);
      setStatus(`Upload successful: ${data.message}`);

      setJsonDetails({
        jsonFolder: data.json_folder,
        jsonFilename: data.json_filename,
        jsonPath: data.json_path,
      });
    } catch (error) {
      setIsLoading(false);
      setStatus("Error uploading file. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
          Upload Your File
        </h2>
        <form className="mb-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Choose a file
            </span>
            <div className="relative mt-2">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                Browse
              </div>
            </div>
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Only CSV files are allowed. Maximum file size: 20MB.
          </p>
        </form>

        {file && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-700 text-sm">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className={`w-full py-3 px-5 rounded-lg text-white font-semibold transition-colors ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload File"}
        </button>

        {status && (
          <div
            className={`mt-6 text-sm text-center p-4 rounded-lg ${
              status.includes("successful")
                ? "bg-green-50 text-green-700 border-l-4 border-green-400"
                : "bg-red-50 text-red-700 border-l-4 border-red-400"
            }`}
          >
            {status}
          </div>
        )}

        {jsonDetails && (
          <div className="mt-6 bg-gray-50 p-4 border-l-4 border-blue-400">
            <h3 className="font-bold text-lg">JSON File Details</h3>
            <p>
              <strong>Folder:</strong> {jsonDetails.jsonFolder}
            </p>
            <p>
              <strong>Filename:</strong> {jsonDetails.jsonFilename}
            </p>
            <p>
              <strong>File Path:</strong> {jsonDetails.jsonPath}
            </p>

            <Link
              to="/json-display"
              className="mt-4 text-blue-600 hover:underline"
            >
              View JSON File Details
            </Link>
          </div>
        )}
      </div>
      <Routes>
        <Route
          path="/json-display"
          element={<JsonDisplay jsonDetails={jsonDetails} />}
        />
      </Routes>
    </div>
  );
}

export default App;
