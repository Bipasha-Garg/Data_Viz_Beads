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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
          Upload Your File
        </h2>
        <div className="mb-6">
          <input
            type="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleFileChange}
          />
          <p className="mt-2 text-xs text-gray-500">
            Only CSV files are allowed. Maximum file size: 20MB.
          </p>
        </div>
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
      </div>
    </div>
  );
}

export default App;
