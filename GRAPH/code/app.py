from flask import Flask, request, jsonify
from flask import send_from_directory
from flask_cors import CORS
import os
import logging
import pandas as pd
from datetime import datetime
from process import process_file

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
# app = Flask(__name__)
app = Flask(__name__)
CORS(app, resources={
    r"/upload": {"origins": ["http://localhost:3000"]},
    r"/public/*": {"origins": ["http://localhost:3000"]}
})# Enable CORS for cross-origin requests

# Configure upload and JSON folders
UPLOAD_FOLDER = "uploads"
JSON_FOLDER = "uploads"  # Directly store JSON files here
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["JSON_FOLDER"] = JSON_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(JSON_FOLDER, exist_ok=True)


def process_file_and_convert_to_json(file_path, json_folder, filename_prefix="data"):
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(file_path)

        # Check if the CSV contains enough columns for clustering
        if df.shape[1] < 2:
            raise ValueError("Insufficient columns in the CSV file")

        # Call the process function to create the JSON
        # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_filename = "processed.json"
        json_folder, json_filename = process_file(
            file_path, json_folder, json_filename, 5, 3
        )

        # Log the JSON creation
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
        
        # Save the file to the server
        filename = file.filename
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(upload_path)
        logging.debug(f"File uploaded: {filename}")

        # Call the new function to process the file and convert it to JSON
        json_folder, json_filename = process_file(
            upload_path, app.config["JSON_FOLDER"],"processed.json"
        )

        json_path = os.path.join(json_folder, json_filename)  # Full path to JSON file

        # Return the JSON file details to the front-end
        return (
            jsonify(
                {
                    "message": "File uploaded and processed successfully",
                    "filename": filename,
                    "json_folder": json_folder,
                    "json_filename": json_filename,
                    "json_path": json_path,
                }
            ),
            200,
        )

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": f"Error: {str(e)}"}), 500


# Serve the processed JSON file when requested
@app.route("/public/<filename>")
def serve_file(filename):
    try:
        logging.debug(f"Requesting file: {filename}")
        # Serve the file from the public folder
        return send_from_directory(app.config["JSON_FOLDER"], filename)
    except Exception as e:
        logging.error(f"Error serving file: {e}")
        return jsonify({"error": "File not found"}), 404



if __name__ == "__main__":
    app.run()

# from flask import Flask, request, jsonify
# from flask_cors import CORS  # Allow cross-origin requests
# import os
# import logging
# import pandas as pd
# from process import process_file  # Import the process_file function

# # Set up logging
# logging.basicConfig(level=logging.DEBUG)

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Configure upload and JSON folders
# UPLOAD_FOLDER = "uploads"
# JSON_FOLDER = "my-react-app/public"
# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# app.config["JSON_FOLDER"] = JSON_FOLDER
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(JSON_FOLDER, exist_ok=True)


# @app.route("/upload", methods=["POST"])
# def upload_file():
#     if "file" not in request.files:
#         return jsonify({"error": "No file part"}), 400

#     file = request.files["file"]
#     if file.filename == "":
#         return jsonify({"error": "No selected file"}), 400

#     try:
#         # Save the file
#         filename = file.filename
#         upload_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
#         file.save(upload_path)
#         logging.debug(f"File uploaded: {filename}")

#         # Process file and save JSON to the public folder using the process_file function
#         json_filename = (
#             "processed.json"  # Fixed output name, you can customize this if needed
#         )
#         json_folder, json_filename = process_file(
#             upload_path, app.config["JSON_FOLDER"], json_filename
#         )

#         logging.debug(
#             f"Processed JSON file saved at: {os.path.join(json_folder, json_filename)}"
#         )

#         json_path = os.path.join(json_folder, json_filename)  # Full path to JSON file
#         console.log(json_filename);
#         console.log(json_path);
#         return (
#              jsonify(
#                 {
#                     "message": "File uploaded and processed successfully",
#                     "filename": json_filename,
#                     "json_folder": json_folder,
#                     "json_filename": json_filename,
#                     "json_path": json_path,
#                 }
#             ),
#             200,
#         )
#     except Exception as e:
#         logging.error(f"Error: {e}")
#         return jsonify({"error": f"Error: {str(e)}"}), 500


# if __name__ == "__main__":
#     app.run(debug=True, port=5000)
