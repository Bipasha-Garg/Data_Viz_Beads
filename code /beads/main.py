# main.py

from cluster_logic import *
from bead_logic import *
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from matplotlib.patches import Circle, Rectangle, Polygon
import csv


def generate_dataset(datapoints, clusters):
    """Generate sample data with the specified number of datapoints and clusters."""
    X, y = make_blobs(
        n_samples=datapoints, centers=clusters, cluster_std=0.60, random_state=0
    )
    return X, y

def csv_file():
    filename = input("Enter the name of the CSV file: ")
    file_path = "/home/bipasha/Desktop/research/Data_Viz_Beads/dataset/diabetes.csv"



def custom_points():
    k = int(input("Enter value of k: "))
    datapoints = int(input("Enter number of datapoints: "))
    num_beads = int(input("Enter number of beads per cluster: "))

    # Generate dataset
    X, y = generate_dataset(datapoints, k)

    # Apply KMeans clustering
    y_kmeans, centers = apply_kmeans(X, k)

    # Store and print clusters
    cluster_points = store_and_print_clusters(X, y_kmeans, k)

    # Store and print beads
    all_beads = store_and_print_beads(cluster_points, num_beads)

    # plot_clusters(X, y_kmeans, centers)

    # Analyze and plot each cluster's beads separately
    for i, (beads, bead_centers) in enumerate(all_beads):
        bead_analysis_results = analyze_beads([(beads, bead_centers)])
        print(f"Cluster {i + 1} Beads:")
        for j, result in enumerate(bead_analysis_results[0]):
            best_p, best_norm = result
            print(f"  Bead {j + 1}: Best p = {best_p}, Best l_p norm = {best_norm}")

        cluster_center = bead_centers
        plot_beads((beads, bead_centers), bead_analysis_results[0], i + 1)
        plot_bead_boundaries(
            (beads, bead_centers), bead_analysis_results[0], cluster_center
        )


if __name__ == "__main__":
    data = str(input("Do you want to give CSV as input (Y/N)? "))
    if data.upper() == "Y":
        csv_file()
    elif data.upper() == "N":
        custom_points()
    else:
        print("Invalid input")
