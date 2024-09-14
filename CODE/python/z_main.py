import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
import json
from functions import *


def file_dataset(file_path):
    # Load data
    data = pd.read_csv(file_path)

    # Drop the 'Id' column if it exists
    if "Id" in data.columns:
        data = data.drop(columns=["Id"])

    # Identify numeric columns
    numeric_columns = data.select_dtypes(include=[np.number]).columns

    # Fill missing values with the mean
    data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())

    # Encode categorical variables
    label_encoders = {}
    for column in data.select_dtypes(include=["object"]):
        label_encoders[column] = LabelEncoder()
        data[column] = label_encoders[column].fit_transform(data[column])

    # Apply to_numeric to all columns
    data = data.apply(pd.to_numeric, errors="ignore")

    # Return the preprocessed data
    return data.values  # Return as numpy array for clustering


def detect_outliers(cluster_points, cluster_center, threshold=95):
    """Detect outliers in a cluster based on distance to cluster center."""
    distances = np.linalg.norm(cluster_points - cluster_center, axis=1)
    distance_threshold = np.percentile(distances, threshold)
    non_outliers = cluster_points[distances <= distance_threshold]
    outliers = cluster_points[distances > distance_threshold]
    return non_outliers, outliers


def apply_kmeans(features, k):
    """Apply K-Means and return labels and cluster centers."""
    kmeans = KMeans(n_clusters=k, random_state=42)
    y_kmeans = kmeans.fit_predict(features)
    centers = kmeans.cluster_centers_
    return y_kmeans, centers


def store_cluster(features, labels, k):
    """Store points belonging to each cluster."""
    cluster_points = {}
    for i in range(k):
        cluster_points[i] = features[labels == i]
    return cluster_points


def store_and_print_beads(cluster_points, num_beads, centers):
    """Store beads and detect outliers as extra beads."""
    all_beads = {}

    for i, cluster in cluster_points.items():
        cluster_center = centers[i]
        non_outliers, outliers = detect_outliers(cluster, cluster_center)

        # Divide non-outliers into beads
        beads = np.array_split(non_outliers, num_beads)

        # Store both non-outlier beads and outlier beads in the same cluster
        all_beads[i] = {
            "core_beads": beads,  # Core beads from non-outliers
            "outlier_beads": outliers,  # Outliers to be treated as individual beads
        }

    return all_beads


def implement_kmeans_with_outliers(file_path, k, num_beads, output_path, X):
    """Implementation of K-Means with outlier detection, bead formation, and best_p/lp_norm analysis."""
    features = X[:, :-1]
    labels = X[:, -1]

    # Apply K-Means clustering
    y_kmeans, centers = apply_kmeans(features, k)

    # Store points belonging to each cluster
    cluster_points = store_cluster(features, y_kmeans, k)

    # Form beads and extra beads (outliers)
    all_beads = store_and_print_beads(cluster_points, num_beads, centers)

    output_data = []
    data_dimension = features.shape[1]
    output_data.append({"data_dimension": data_dimension})

    # Process and store beads (core and outlier beads) per cluster
    for i, beads_data in all_beads.items():
        core_beads = beads_data["core_beads"]
        outlier_beads = beads_data["outlier_beads"]
        cluster_center = centers[i]

        cluster_data = {
            "cluster_number": i + 1,
            "cluster_center": cluster_center.tolist(),
            "beads": [],
        }

        # Perform analysis for core beads to get best_p and lp_norm
        core_bead_analysis_results = analyze_beads([(core_beads, cluster_center)])

        # Store core beads
        for j, bead in enumerate(core_beads):
            bead_center = np.mean(bead, axis=0)
            best_p, best_norm = core_bead_analysis_results[0][
                j
            ]  # Retrieve best p and lp norm for the bead
            bead_info = {
                "bead_number": j + 1,
                "bead_center": bead_center.tolist(),
                "best_p": best_p,  # Store best p
                "lp_norm": best_norm,  # Store lp norm
                "data_points": [
                    {
                        "coordinates": point.tolist(),
                        "label": int(
                            labels[np.where((features == point).all(axis=1))[0][0]]
                        ),
                    }
                    for point in bead
                ],
            }
            cluster_data["beads"].append(bead_info)

        # Store outlier beads (treat each outlier as a separate bead)
        for j, outlier in enumerate(outlier_beads):
            bead_info = {
                "bead_number": len(core_beads) + j + 1,
                "bead_center": outlier.tolist(),  # Each outlier is its own bead center
                "best_p": None,  # Outliers don't have best_p or lp_norm
                "lp_norm": None,  # Outliers don't have lp_norm
                "data_points": [
                    {
                        "coordinates": outlier.tolist(),
                        "label": int(
                            labels[np.where((features == outlier).all(axis=1))[0][0]]
                        ),
                    }
                ],
            }
            cluster_data["beads"].append(bead_info)

        output_data.append(cluster_data)

    # Save the results to a JSON file
    with open(output_path, "w") as json_file:
        json.dump(output_data, json_file, indent=4)

    return output_data


if __name__ == "__main__":
    # Load the dataset (modify file_path as needed)
    file_path = (
        "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/dataset/Customers.csv"
    )

    # Parameters
    k = 4
    num_beads = 3
    output_path = "cust.json"

    # Preprocess the dataset and return as numpy array
    X = file_dataset(file_path)

    # Run K-Means with outlier detection and bead formation
    implement_kmeans_with_outliers(file_path, k, num_beads, output_path, X)
