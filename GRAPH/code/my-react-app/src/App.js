import React, { useState } from "react";
import JsonDisplay from "./JsonDisplay";

const App = () => {
  const [jsonFilename, setJsonFilename] = useState(null);
  const [error, setError] = useState(null);
  console.log(jsonFilename);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();
      setJsonFilename(result.json_filename);
      console.log(result.json_filename);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">File Upload</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4 border p-2 rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      {jsonFilename && <JsonDisplay jsonFilename={jsonFilename} />}
    </div>
  );
};

export default App;
