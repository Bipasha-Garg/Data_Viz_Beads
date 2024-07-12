import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
import json
from functions import *

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
    return data.values #array of arrays


def implement_cure(file_path, k, num_beads, output_path,X):
    features = X[:, :-1]
    labels = X[:, -1]
    y_kmeans, centers = apply_kmeans(features, k)
    # print(y_kmeans)
    # print("centers")
    # print(centers)
    cluster_points = store_cluster(features, y_kmeans, k)
    # print(cluster_points)
    all_beads = store_and_print_beads(cluster_points, num_beads)
    # print(all_beads)
    output_data = []
    data_dimension = features.shape[1]
    output_data.append({"data_dimension": data_dimension})
    # now implement cure on beads
    representatives = input("number of representative points per bead: ")
    cured_X = cureBeads(all_beads,representatives)
    print(cured_X)


def implement_kmeans(file_path, k, num_beads, output_path,X):
    features = X[:, :-1]
    labels = X[:, -1]
    y_kmeans, centers = apply_kmeans(features, k)
    # print(y_kmeans)
    # print("centers")
    # print(centers)
    cluster_points = store_cluster(features, y_kmeans, k)
    # print(cluster_points)
    all_beads = store_and_print_beads(cluster_points, num_beads)
    # print(all_beads)
    output_data = []
    data_dimension = features.shape[1]
    output_data.append({"data_dimension": data_dimension})


if __name__ == "__main__":
    # file_path = input("Enter the path to the CSV file: ")
    # k = int(input("Enter the number of clusters (k): "))
    # num_beads = int(input("Enter the number of beads per cluster: "))
    # output_path = input("Enter the output path for the clusters and beads JSON: ")
    file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/CODE/old/Iris.csv"
    k = 3
    num_beads = 3
    output_path = "out.json"
    cure = str(input("Do you want to apply cure? (y/n):"))
    X = file_dataset(file_path)
    # print(X)
    if cure == "y":
        implement_cure(file_path, k, num_beads, output_path,X)
    else:
        implement_kmeans(file_path, k, num_beads, output_path,X)
