import React from "react";

const JsonDisplay = ({ jsonDetails }) => {
  // Assuming jsonDetails contains a 'jsonContent' field that holds the actual JSON data
  const jsonData = jsonDetails?.jsonContent;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
          JSON File Contents
        </h2>
        <div className="bg-gray-50 p-4 border-l-4 border-blue-400">
          <h3 className="font-bold text-lg">JSON Data:</h3>
          {jsonData ? (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-600">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonDisplay;
