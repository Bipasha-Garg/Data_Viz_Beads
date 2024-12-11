document
  .getElementById("uploadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.json) {
            // Fetch the JSON data after successful upload
            return fetch(`/uploads/${data.json}`);
          } else {
            throw new Error(data.error || "Unknown error");
          }
        })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch JSON data");
          return response.json();
        })
        .then((jsonData) => {
          // Pass the JSON data to your external processing script
          processData(jsonData);
          displayData(jsonData); // Display JSON data on the main page
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });

// Function to display data on the main page
function displayData(jsonData) {
  const displayElement = document.getElementById("dataDisplay");
  displayElement.innerHTML = JSON.stringify(jsonData, null, 2);
}
