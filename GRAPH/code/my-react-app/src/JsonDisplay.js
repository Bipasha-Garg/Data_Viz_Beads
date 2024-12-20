
import React, { useEffect, useState } from "react";

const JsonDisplay = ({ jsonFilename }) => {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jsonFilename) {
      setError("No JSON filename provided");
      return;
    }

    fetch(`http://127.0.0.1:5000/public/${jsonFilename}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${jsonFilename}`);
        }
        return response.json();
      })
      .then((data) => {
        setJsonData(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching JSON:", err);
      });
  }, [jsonFilename]);

  return (
    <div>
      {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default JsonDisplay;
