const { useEffect, useState } = React;

async function fetchCsvPath(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error("Failed to fetch the text file");
    }
    const text = await response.text();
    return text.trim(); // Remove any extra whitespace
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch the text file");
  }
}

async function fetchCsvContent(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error("Failed to fetch the CSV file");
    }
    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch the CSV file");
  }
}

function parseAndProcessCsv(csvText) {
  const parsedData = Papa.parse(csvText, { header: true, dynamicTyping: true });
  const data = parsedData.data;

  const numericColumns = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] === "number"
  );

  numericColumns.forEach((column) => {
    const columnValues = data.map((row) => row[column]);
    const columnMean = math.mean(
      columnValues.filter((value) => value !== null && value !== undefined)
    );

    data.forEach((row) => {
      if (row[column] === null || row[column] === undefined) {
        row[column] = columnMean;
      }
    });
  });

  return data.map((row) => Object.values(row));
}

function Script() {
  const [csvFilePath, setCsvFilePath] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const filePath = await fetchCsvPath("textfile.txt"); // Replace with your text file path
        setCsvFilePath(filePath);
        const csvText = await fetchCsvContent(filePath);
        const data = parseAndProcessCsv(csvText);
        setCsvData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadCsvData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>CSV Data</h1>
      <pre>{JSON.stringify(csvData, null, 2)}</pre>
    </div>
  );
}

ReactDOM.render(<Script />, document.getElementById("root"));
