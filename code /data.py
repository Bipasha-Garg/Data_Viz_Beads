import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans


def generate_dataset(datapoints, clusters):
    """Generate sample data with the specified number of datapoints and clusters."""
    X, y = make_blobs(
        n_samples=datapoints, centers=clusters, cluster_std=0.60, random_state=0
    )
    return X, y


def apply_kmeans(X, clusters):
    """Apply KMeans clustering to the dataset."""
    kmeans = KMeans(n_clusters=clusters)
    kmeans.fit(X)
    y_kmeans = kmeans.predict(X)
    centers = kmeans.cluster_centers_
    return y_kmeans, centers


def store_and_print_clusters(X, y_kmeans, clusters):
    """Store the clusters in an array of arrays and print them."""
    cluster_points = [[] for _ in range(clusters)]
    for i, label in enumerate(y_kmeans):
        cluster_points[label].append(X[i])
    print_cluster(cluster_points)

def print_cluster(cluster_points):
    # Print the clusters
    for i, cluster in enumerate(cluster_points):
        print(f"Cluster {i+1}:")
        for point in cluster:
            print(tuple(point))
        print()  # Add an empty line between clusters


def plot_clusters(X, y_kmeans, centers):
    """Plot the clusters and their centers."""
    plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=50, cmap="viridis")
    plt.scatter(centers[:, 0], centers[:, 1], c="red", s=200, alpha=0.75, marker="*")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("K-Means Clustering")
    plt.show()


if __name__ == "__main__":
    clusters = int(input("Enter value of k: "))
    datapoints = int(input("Enter number of datapoints: "))

    # Generate dataset
    X, y = generate_dataset(datapoints, clusters)

    # Apply KMeans clustering
    y_kmeans, centers = apply_kmeans(X, clusters)

    # Store and print clusters
    store_and_print_clusters(X, y_kmeans, clusters)

    # Plot clusters
    plot_clusters(X, y_kmeans, centers)
