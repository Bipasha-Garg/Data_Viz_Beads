from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import pandas as pd
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configure upload and JSON folders
UPLOAD_FOLDER = "uploads"
JSON_FOLDER = "json"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["JSON_FOLDER"] = JSON_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(JSON_FOLDER, exist_ok=True)


def write_to_json(data, folder, filename_prefix="data"):

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_filename = f"{filename_prefix}_{timestamp}.json"
    json_path = os.path.join(folder, json_filename)

    with open(json_path, "w") as json_file:
        json.dump(data, json_file, indent=4)
    logging.debug(f"JSON file created: {json_path}")
    return json_filename, json_path


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
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(upload_path)
        logging.debug(f"File uploaded: {filename}")

        # Process the file and convert to JSON
        try:
            # Assuming the file is a CSV
            df = pd.read_csv(upload_path)
            json_data = df.to_dict(orient="records")

            # Write data to a JSON file
            json_filename, json_path = write_to_json(
                json_data, app.config["JSON_FOLDER"]
            )

            return (
                jsonify(
                    {
                        "message": "File uploaded and processed successfully",
                        "filename": filename,
                        "json_filename": json_filename,
                        "json_path": json_path,
                    }
                ),
                200,
            )
        except Exception as e:
            logging.error(f"Error processing file: {e}")
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500

    except Exception as e:
        logging.error(f"Error saving file: {e}")
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
