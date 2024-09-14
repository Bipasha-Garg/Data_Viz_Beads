import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors
import json
from functions import *
import os

# def file_dataset(file_path):
#     data = pd.read_csv(file_path)
#     if "Id" in data.columns:
#         data = data.drop(columns=["Id"])
#     numeric_columns = data.select_dtypes(include=[np.number]).columns
#     data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())
#     label_encoders = {}
#     for column in data.select_dtypes(include=["object"]):
#         label_encoders[column] = LabelEncoder()
#         data[column] = label_encoders[column].fit_transform(data[column])
#     data = data.apply(pd.to_numeric, errors="ignore")
#     scaler = StandardScaler()
#     data[numeric_columns] = scaler.fit_transform(data[numeric_columns])
#     return data.values  # array of arrays


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

    # Define custom scaling function
    def custom_scale(series):
        # Separate positive and negative values
        pos = series[series >= 0]
        neg = series[series < 0]

        # Min-Max scale positive values to [0, 1]
        if len(pos) > 0:
            pos = (pos - pos.min()) / (pos.max() - pos.min())

        # Min-Max scale negative values to [-1, 0]
        if len(neg) > 0:
            neg = (neg - neg.max()) / (neg.min() - neg.max())

        # Combine the scaled values
        return pd.concat([pos, neg]).reindex(series.index)

    # Normalize numeric columns
    data[numeric_columns] = data[numeric_columns].apply(custom_scale)

    return data.values  # Return array of arrays


def implement_cure(file_path, k, num_beads, output_path, X):
    features = X[:, :-1]
    labels = X[:, -1]
    y_kmeans, centers = apply_kmeans(features, k)
    cluster_points = store_cluster(features, y_kmeans, k)
    all_beads = store_and_print_beads(cluster_points, num_beads)
    output_data = []
    data_dimension = features.shape[1]
    output_data.append({"data_dimension": data_dimension})

    representatives = int(input("number of representative points per bead: "))
    cured_X = cureBeads(all_beads, representatives)

    for i, (cluster_beads, b_center) in enumerate(cured_X):
        bead_analysis_results = analyze_beads([(cluster_beads, b_center)])
        cluster_center = centers[i]
        cluster_data = {
            "cluster_number": i + 1,
            "cluster_center": cluster_center.tolist(),
            "beads": [],
        }
        print(f"Cluster {i + 1} Beads:")

        # Use nearest neighbors to find the closest points
        nbrs = NearestNeighbors(n_neighbors=1).fit(features)

        for j, result in enumerate(bead_analysis_results[0]):
            best_p, best_norm = result
            bead_center = np.mean(cluster_beads[j], axis=0)
            bead_info = {
                "bead_number": j + 1,
                "best_p": best_p,
                "lp_norm": best_norm,
                "bead_center": bead_center.tolist(),
                "data_points": [],
            }
            for point in cluster_beads[j]:
                distances, indices = nbrs.kneighbors([point])
                nearest_index = indices[0][0]
                point_label = labels[nearest_index]
                bead_info["data_points"].append(
                    {
                        "coordinates": features[nearest_index].tolist(),
                        "label": int(point_label),
                    }
                )
            cluster_data["beads"].append(bead_info)
            print(f"  Bead {j + 1}: Best p = {best_p}, Best l_p norm = {best_norm}")
        output_data.append(cluster_data)

    with open(output_path, "w") as json_file:
        json.dump(output_data, json_file, indent=4)

    return output_data


def implement_kmeans(file_path, k, num_beads, output_path, X):
    features = X[:, :-1]
    labels = X[:, -1]
    y_kmeans, centers = apply_kmeans(features, k)
    cluster_points = store_cluster(features, y_kmeans, k)
    all_beads = store_and_print_beads(cluster_points, num_beads)
    output_data = []
    data_dimension = features.shape[1]
    output_data.append({"data_dimension": data_dimension})
    for i, (cluster_beads, b_center) in enumerate(all_beads):
        bead_analysis_results = analyze_beads([(cluster_beads, b_center)])
        cluster_center = centers[i]
        cluster_data = {
            "cluster_number": i + 1,
            "cluster_center": cluster_center.tolist(),
            "beads": [],
        }
        print(f"Cluster {i + 1} Beads:")
        for j, result in enumerate(bead_analysis_results[0]):
            best_p, best_norm = result
            bead_center = np.mean(cluster_beads[j], axis=0)
            bead_info = {
                "bead_number": j + 1,
                "best_p": best_p,
                "lp_norm": best_norm,
                "bead_center": bead_center.tolist(),
                "data_points": [],
            }
            for point in cluster_beads[j]:
                point_index = np.where((features == point).all(axis=1))[0][0]
                point_label = labels[point_index]
                bead_info["data_points"].append(
                    {
                        "coordinates": point.tolist(),
                        "label": int(point_label),  # Ensure label is serializable
                    }
                )
            cluster_data["beads"].append(bead_info)
            print(f"  Bead {j + 1}: Best p = {best_p}, Best l_p norm = {best_norm}")
        output_data.append(cluster_data)
    with open(output_path, "w") as json_file:
        json.dump(output_data, json_file, indent=4)
    return output_data


def check_and_convert_excel(file_path):
    """Check if the input file is an Excel file and convert it to CSV if needed."""
    if file_path.endswith(".xls") or file_path.endswith(".xlsx"):
        try:
            # Specify the engine manually to avoid ValueError
            excel_data = pd.read_excel(file_path, engine="openpyxl")
        except ValueError:
            # Try using a different engine if the first fails
            excel_data = pd.read_excel(file_path, engine="xlrd")
        csv_path = file_path.replace(".xlsx", ".csv").replace(".xls", ".csv")
        excel_data.to_csv(csv_path, index=False)
        return csv_path
    return file_path


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_csv.py <input_file>")
        sys.exit(1)
    input_file = sys.argv[1]
    print("printing")
    print(input_file)
    k = 4
    num_beads = 6
    output_path = "./uploads/data.json"
    cure = str(input("Do you want to apply cure? (y/n):"))
    X = file_dataset(input_file)
    print(X)
    if cure == "y":
        implement_cure(input_file, k, num_beads, output_path,X)
    else:
        implement_kmeans(input_file, k, num_beads, output_path,X)
