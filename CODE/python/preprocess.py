import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

from logic import *

def commands(X, k, num_beads, output_path):
    # Separate features and labels
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

# def file_dataset(file_path):
#     data = pd.read_csv(file_path)
#     numeric_columns = data.select_dtypes(include=[np.number]).columns
#     data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())
#     label_encoders = {}
#     for column in data.select_dtypes(include=["object"]):
#         label_encoders[column] = LabelEncoder()
#         data[column] = label_encoders[column].fit_transform(data[column])
#     data = data.apply(pd.to_numeric, errors="ignore")
#     return data.values

def file_dataset(file_path):
    data = pd.read_csv(file_path)
    if "Id" in data.columns:
        data = data.drop(columns=["Id"])
    numeric_columns = data.select_dtypes(include=[np.number]).columns
    data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())
    label_encoders = {}
    for column in data.select_dtypes(include=["object"]):
        label_encoders[column] = LabelEncoder()
        data[column] = label_encoders[column].fit_transform(data[column])
    data = data.apply(pd.to_numeric, errors="ignore")
    scaler = StandardScaler()
    data[numeric_columns] = scaler.fit_transform(data[numeric_columns])
    return data.values

def preprocess_csv(file_path, k, num_beads, output_path):
    X = file_dataset(file_path)
    commands(X, k, num_beads, output_path)
    print(f"Cluster data including beads and analysis results saved to {output_path}")

def file_preprocessing(file_path, k, num_beads, output_path):
    X = file_dataset(file_path)
    return X

def cure_algorithm(X, file_path, k, num_beads, output_path):
    features = X[:, :-1]
    labels = X[:, -1]
    y_kmeans, centers = apply_kmeans(features, k)
    cluster_points = store_cluster(features, y_kmeans, k)
    all_beads = applying_cure_on_beads(cluster_points,num_beads)
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
                        "coordinates": point,
                        "label": int(point_label),  # Ensure label is serializable
                    }
                )
            cluster_data["beads"].append(bead_info)
            print(f"  Bead {j + 1}: Best p = {best_p}, Best l_p norm = {best_norm}")
        output_data.append(cluster_data)
    with open(output_path, "w") as json_file:
        json.dump(output_data, json_file, indent=4)
    return output_data

def CURE(file_path, k, num_beads, output_path):
    X = file_preprocessing(file_path, k, num_beads, output_path)
    cure_algorithm(X, file_path, k, num_beads, output_path)

if __name__ == "__main__":
    # file_path = input("Enter the path to the CSV file: ")
    file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/Iris.csv"
    # file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/diabetes.csv"
    k = int(input("Enter the number of clusters (k): "))
    num_beads = int(input("Enter the number of beads per cluster: "))
    output_path = input("Enter the output path for the clusters and beads JSON: ")
    # output_path = "iris.json"
    cure = str(input("Do you want to apply cure? (y/n):"))
    if cure == "y":
        CURE(file_path, k, num_beads, output_path)
    else:
        preprocess_csv(file_path, k, num_beads, output_path)
