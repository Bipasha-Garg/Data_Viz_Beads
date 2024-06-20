from cluster_logic import *
from bead_logic import *
import numpy as np
from sklearn.datasets import make_blobs
import csv
import pandas as pd
from sklearn.preprocessing import LabelEncoder

def generate_dataset(datapoints, clusters):
    """Generate sample data with the specified number of datapoints and clusters."""
    X, y = make_blobs(
        n_samples=datapoints, centers=clusters, cluster_std=0.60, random_state=0
    )
    return X, y


def file_dataset(file_path):
    # Read the CSV file into a DataFrame
    data = pd.read_csv(file_path)

    # Fill missing values with the mean for numeric columns
    numeric_columns = data.select_dtypes(include=[np.number]).columns
    data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].mean())

    # Perform label encoding for categorical columns
    label_encoders = {}
    for column in data.select_dtypes(include=["object"]):
        label_encoders[column] = LabelEncoder()
        data[column] = label_encoders[column].fit_transform(data[column])

    # Convert all columns to numeric (including the encoded categorical columns)
    data = data.apply(pd.to_numeric, errors="ignore")

    # Return the processed data as a single NumPy array
    return data.values


def commands(X, k, num_beads):
    # Apply KMeans clustering
    y_kmeans, centers = apply_kmeans(X, k)

    # Store and print clusters
    cluster_points = store_cluster(X, y_kmeans, k)

    # Store and print beads
    all_beads = store_and_print_beads(cluster_points, num_beads)

    # Analyze and plot each cluster's beads separately
    for i, (beads, bead_centers) in enumerate(all_beads):
        bead_analysis_results = analyze_beads([(beads, bead_centers)])
        print(f"Cluster {i + 1} Beads:")
        for j, result in enumerate(bead_analysis_results[0]):
            best_p, best_norm = result
            print(f"  Bead {j + 1}: Best p = {best_p}, Best l_p norm = {best_norm}")

        # Retrieve cluster centers based on cluster labels
        cluster_centers = [centers[label] for label in y_kmeans]

        plot_beads((beads, bead_centers), bead_analysis_results[0], i + 1)
        value = i+1
        plot_name = "Cluster_" + str(value)   # Converting integers to strings explicitly

        # Set cluster center to the center of the cluster
        plot_bead_boundaries(
            (beads, bead_centers), bead_analysis_results[0], cluster_centers,plot_name
        )

def csv_file():
    # filename = input("Enter the name of the CSV file: ")
    # file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/dataset/diabetes.csv"
    file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/dataset/Iris.csv"
    k = int(input("Enter the number of clusters (k): "))
    num_beads = int(input("Enter the number of beads per cluster: "))

    # Generate dataset
    X = file_dataset(file_path)
    commands(X,k,num_beads)

def custom_points():
    k = int(input("Enter value of k: "))
    datapoints = int(input("Enter number of datapoints: "))
    num_beads = int(input("Enter number of beads per cluster: "))

    # Generate dataset
    X, y = generate_dataset(datapoints, k)
    commands(X,k,num_beads)

if __name__ == "__main__":
    data = str(input("Do you want to give CSV as input (Y/N)? "))
    if data.upper() == "Y":
        csv_file()
    elif data.upper() == "N":
        custom_points()
    else:
        print("Invalid input")
