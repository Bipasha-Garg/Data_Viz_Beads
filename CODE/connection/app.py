# from flask import Flask, request, jsonify, send_from_directory
# import os
# from main import main  # Import the main function from your script


# app = Flask(__name__)
# UPLOAD_FOLDER = "uploads"
# # @app.route("/")
# # def home():
# #     return "Hello, Flask!"


# # Create uploads directory if it doesn't exist
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)


# # File upload route
# @app.route("/", methods=["POST"])
# def upload_file():
#     if "file" not in request.files:
#         return jsonify({"error": "No file part in the request"}), 400

#     file = request.files["file"]
#     if file.filename == "":
#         return jsonify({"error": "No file selected"}), 400

#     if file and file.filename.endswith(".csv"):
#         # Save the uploaded file
#         file_path = os.path.join(UPLOAD_FOLDER, file.filename)
#         file.save(file_path)

#         # Get 'cure_choice' from the request form, default to 'n' (kmeans)
#         cure_choice = request.form.get("cure_choice", "n")

#         try:
#             # Call the main function, passing the file path and cure_choice
#             main(file_path, cure_choice)
#         except Exception as e:
#             return jsonify({"error": f"File processing failed: {str(e)}"}), 500

#         # Ensure the JSON output file exists
#         json_path = os.path.join(UPLOAD_FOLDER, "data.json")
#         if not os.path.exists(json_path):
#             return jsonify({"error": "JSON file not generated"}), 500

#         # Return success message and reference to the JSON file
#         return (
#             jsonify(
#                 {"message": "File processed successfully", "json_file": "data.json"}
#             ),
#             200,
#         )

#     return jsonify({"error": "Invalid file type, only .csv allowed"}), 400


# # Route to download the processed JSON file
# @app.route("/data/<filename>", methods=["GET"])
# def get_file(filename):
#     try:
#         return send_from_directory(UPLOAD_FOLDER, filename)
#     except FileNotFoundError:
#         return jsonify({"error": "File not found"}), 404


# # Run the Flask app
# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

from flask import Flask, request, jsonify, send_from_directory, render_template
import os
from main import main  # Import the main function from your script

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Route to render the home page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# File upload route
@app.route("/", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if file and file.filename.endswith(".csv"):
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Get 'cure_choice' from the request form, default to 'n' (kmeans)
        cure_choice = request.form.get("cure_choice", "n")

        try:
            # Call the main function to process the CSV file and generate data.json
            main(file_path, cure_choice)
        except Exception as e:
            return jsonify({"error": f"File processing failed: {str(e)}"}), 500

        # Ensure data.json was generated
        json_path = os.path.join(UPLOAD_FOLDER, "data.json")
        if not os.path.exists(json_path):
            return jsonify({"error": "JSON file not generated"}), 500

        # Notify that processing was successful
        return jsonify({"message": "File processed successfully"}), 200

    return jsonify({"error": "Invalid file type, only .csv allowed"}), 400


# Route to serve the JSON file if requested
@app.route("/", methods=["GET"])
def get_file(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
