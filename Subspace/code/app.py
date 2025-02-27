from flask import Flask, request, jsonify
from flask import send_from_directory
from flask_cors import CORS
import os
import logging
import pandas as pd
from datetime import datetime
from proc_withLabels import process_file


logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/upload": {"origins": ["http://localhost:3000"]},
        r"/public/*": {"origins": ["http://localhost:3000"]},
        r"/uploads/*": {"origins": ["http://localhost:3000"]},
    },
)

UPLOAD_FOLDER = "uploads"
JSON_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["JSON_FOLDER"] = JSON_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(JSON_FOLDER, exist_ok=True)


def process_file_and_convert_to_json(file_path, json_folder, filename_prefix="data"):
    try:
        df = pd.read_csv(file_path)

        if df.shape[1] < 2:
            raise ValueError("Insufficient columns in the CSV file")

        json_filename = "processed.json"
        labels_file = "label_file.json"
        json_folder, json_filename, labels_file = process_file(
            file_path, json_folder, json_filename
        )

        json_path = os.path.join(json_folder, json_filename)
        logging.debug(f"JSON file created: {json_path}")

        return json_folder, json_filename

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise Exception(f"Error processing file: {str(e)}")


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:

        filename = file.filename
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(upload_path)
        logging.debug(f"File uploaded: {filename}")

        json_folder, json_filename, labels_file = process_file(
            upload_path, app.config["JSON_FOLDER"], "processed.json"
        )

        json_path = os.path.join(json_folder, json_filename)
        logging.debug(f"JSON should be available at: {json_path}")

        return (
            jsonify(
                {
                    "message": "File uploaded and processed successfully",
                    "filename": filename,
                    "json_folder": json_folder,
                    "json_filename": json_filename,
                    "json_path": json_path,
                    "labels_file": labels_file,
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": f"Error: {str(e)}"}), 500


@app.route("/uploads/<filename>")
def serve_file(filename):
    try:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        if not os.path.exists(file_path):
            logging.error(f"File not found: {file_path}")
            return jsonify({"error": "File not found"}), 404

        logging.debug(f"Serving file: {file_path}")
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    except Exception as e:
        logging.error(f"Error serving file: {e}")
        return jsonify({"error": "Error serving file"}), 500


if __name__ == "__main__":
    app.run()
