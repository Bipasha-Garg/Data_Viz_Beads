document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.json_file) {
                // Fetch the JSON data after successful upload
                return fetch(`/data/${data.json_file}`);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .then(response => response.json())
        .then(jsonData => {
            // Pass the JSON data to your external processing script
            processData(jsonData);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
