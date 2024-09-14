from flask import Flask, request, jsonify, send_from_directory
import os
import subprocess
from main import *  # Import the main function from your script

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith(".csv"):
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Get 'cure_choice' from the request form, default to 'n' for kmeans
        cure_choice = request.form.get("cure_choice", "n")

        try:
            # Call the main function, passing the file path and cure_choice
            main(file_path, cure_choice)
        except Exception as e:
            return jsonify({"error": f"Script failed: {str(e)}"}), 500

        json_path = os.path.join(UPLOAD_FOLDER, "data.json")
        if not os.path.exists(json_path):
            return jsonify({"error": "JSON file not generated"}), 500

        return (
            jsonify(
                {"message": "File processed successfully", "json_file": "data.json"}
            ),
            200,
        )

    return jsonify({"error": "Invalid file type"}), 400


@app.route("/data/<filename>", methods=["GET"])
def get_file(filename):
    print(f"Request for file: {filename}")
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
