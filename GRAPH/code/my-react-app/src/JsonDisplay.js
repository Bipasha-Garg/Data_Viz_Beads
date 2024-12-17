// import React, { useEffect, useState } from "react";

// const JsonDisplay = ({ jsonFilename }) => {
//   const [jsonData, setJsonData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchJson = async () => {
//       try {
//         // Adjust the fetch URL depending on where the JSON file is located
//         const response = await fetch(`/public/${jsonFilename}`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch ${jsonFilename}`);
//         }
//         const data = await response.json();
//         setJsonData(data);
//       } catch (err) {
//         console.error("Error fetching JSON:", err);
//         setError(err.message);
//       }
//     };

//     fetchJson();
//   }, [jsonFilename]);

//   return (
//     <div className="bg-white shadow-lg rounded-lg p-6 mt-4 w-full max-w-3xl">
//       <h2 className="text-2xl font-bold mb-4 text-blue-800 text-center">
//         Processed JSON File
//       </h2>
//       {error ? (
//         <p className="text-red-500">{error}</p>
//       ) : jsonData ? (
//         <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
//           {JSON.stringify(jsonData, null, 2)}
//         </pre>
//       ) : (
//         <p className="text-gray-500 text-sm">Loading...</p>
//       )}
//     </div>
//   );
// };

// export default JsonDisplay;

import React, { useEffect, useState } from "react";

const JsonDisplay = ({ jsonFilename }) => {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJson = async () => {
      try {
        // Fetch the processed JSON from the server's public route
        const response = await fetch(
          `http://127.0.0.1:5000/public/${jsonFilename}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch ${jsonFilename}`);
        }
        const data = await response.json();
        setJsonData(data);
      } catch (err) {
        console.error("Error fetching JSON:", err);
        setError(err.message);
      }
    };

    if (jsonFilename) {
      fetchJson();
    }
  }, [jsonFilename]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 text-center">
        Processed JSON File
      </h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : jsonData ? (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500 text-sm">Loading...</p>
      )}
    </div>
  );
};

export default JsonDisplay;
