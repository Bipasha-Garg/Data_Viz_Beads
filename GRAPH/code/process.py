import pandas as pd
import json
from sklearn.cluster import KMeans
import os
import logging


def process_file(file_path, json_folder, json_filename):
    K=3
    N=2
    try:
        # Load the CSV file into a pandas DataFrame
        df = pd.read_csv(file_path)

        # Check if the CSV contains enough columns for clustering
        if df.shape[1] < 2:
            raise ValueError(
                "CSV file must contain at least two columns for clustering."
            )

        # Assume all columns except the last one are features for clustering
        features = df.iloc[:, :-1].values  # Modify as needed based on dataset

        # Step 1: Perform KMeans clustering to create K main clusters
        kmeans = KMeans(n_clusters=K, random_state=42)
        df["Cluster"] = kmeans.fit_predict(features)

        # Step 2: Further divide each cluster into N beads (sub-clusters)
        bead_clusters = []
        for cluster_id in range(K):
            # Extract data belonging to the current cluster
            cluster_data = df[df["Cluster"] == cluster_id].copy()

            # Check if there's enough data for sub-clustering
            if cluster_data.shape[0] < N:
                logging.warning(
                    f"Cluster {cluster_id} has fewer points than sub-clusters (N={N}). Skipping bead clustering."
                )
                cluster_data["Bead"] = 0  # Assign all points to bead 0
            else:
                # Perform KMeans to create N sub-clusters (beads)
                bead_kmeans = KMeans(n_clusters=N, random_state=42)
                cluster_data["Bead"] = bead_kmeans.fit_predict(
                    cluster_data.iloc[:, :-2].values
                )
            # Append to bead clusters list
            bead_clusters.append(cluster_data)
            print("bead df")
            print(bead_clusters)
        # Combine all bead clusters into a single DataFrame
        final_df = pd.concat(bead_clusters)
        print("final df")
        print(final_df)
        # Step 3: Create JSON data with Cluster and Bead number explicitly included
        json_data = []
        for _, row in final_df.iterrows():
            data_point = {
                "x1": row["x1"],  # Assuming 'x1' is a feature column in your CSV
                "x2": row["x2"],  # Assuming 'x2' is a feature column in your CSV
                "Cluster": row["Cluster"],  # Include cluster number
                "Bead": row["Bead"],  # Include bead number
            }
            json_data.append(data_point)

        # Create the output folder if it doesn't exist
        if not os.path.exists(json_folder):
            os.makedirs(json_folder)

        # Save the JSON data
        json_file_path = os.path.join(json_folder, json_filename)
        print(json_file_path)
        with open(json_file_path, "w") as json_file:
            json.dump(json_data, json_file, indent=4)

        logging.debug(f"JSON file successfully saved at: {json_file_path}")

        return json_folder, json_filename

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise
