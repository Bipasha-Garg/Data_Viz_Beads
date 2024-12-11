from flask import Flask, request, jsonify
import pandas as pd
import json
from datetime import datetime
from sklearn.cluster import KMeans
import os
import logging 

app = Flask(__name__)


def process_file(file_path, json_folder, json_filename, K, N):
    # Load the CSV file into a pandas DataFrame
    df = pd.read_csv(file_path)

    # Check if the CSV contains enough columns for clustering
    if df.shape[1] < 2:
        raise ValueError("Insufficient columns in the CSV file")

    # Assume that all columns except the last one are features for clustering
    features = df.iloc[:, :-1].values  # Modify as needed for your dataset

    # Step 1: Perform KMeans clustering with K clusters
    kmeans = KMeans(n_clusters=K, random_state=42)
    df["Cluster"] = kmeans.fit_predict(features)

    # Step 2: For each cluster, further divide it into N beads (sub-clusters)
    bead_clusters = []
    for cluster_id in range(K):
        cluster_data = df[df["Cluster"] == cluster_id].copy()
        bead_kmeans = KMeans(n_clusters=N, random_state=42)
        cluster_data["Bead"] = bead_kmeans.fit_predict(cluster_data.iloc[:, :-1].values)

        # Store each bead cluster's data
        bead_clusters.append(cluster_data)

    # Combine all bead clusters into a single DataFrame
    final_df = pd.concat(bead_clusters)

    # Step 3: Convert the DataFrame to JSON
    json_data = final_df.to_dict(orient="records")

    # Save the JSON data to the specified folder
    if not os.path.exists(json_folder):
        os.makedirs(json_folder)

    json_file_path = os.path.join(json_folder, json_filename)
    with open(json_file_path, "w") as json_file:
        json.dump(json_data, json_file, indent=4)

    logging.debug(f"JSON file saved at: {json_file_path}")

    return json_folder, json_filename
