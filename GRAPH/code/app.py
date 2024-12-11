from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure upload folder
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    try:
        # Save the file
        filename = file.filename
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        logging.debug(f"File uploaded: {filename}")
        return (
            jsonify({"message": "File uploaded successfully", "filename": filename}),
            200,
        )
    except Exception as e:
        logging.error(f"Error saving file: {e}")
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
