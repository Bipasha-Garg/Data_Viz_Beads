import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      setIsLoading(false);
      setStatus("Error uploading file. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          File Upload
        </h2>
        <div className="mb-4">
          <input
            type="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            onChange={handleFileChange}
          />
        </div>
        {file && (
          <p className="text-sm text-gray-600 mb-2">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        {status && (
          <p className="mt-4 text-sm text-center text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
}

export default App;
