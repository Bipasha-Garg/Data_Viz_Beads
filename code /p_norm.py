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
    kmeans = KMeans(n_clusters=clusters, random_state=0)
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
    return cluster_points


def print_cluster(cluster_points):
    """Print the clusters."""
    for i, cluster in enumerate(cluster_points):
        print(f"Cluster {i+1}:")
        for point in cluster:
            print(tuple(point))
        print()  # Add an empty line between clusters


def plot_clusters(X, y_kmeans, centers):
    """Plot the clusters and their centers."""
    plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=50, cmap="viridis")
    plt.scatter(centers[:, 0], centers[:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("K-Means Clustering")
    plt.show()


def calculate_and_find_best_p(cluster):
    """Calculate the l_p norms for a range of p values and find the best p value for a given cluster."""
    norms = []
    p_values = np.arange(1, 1000.5, 0.1)  # Generate p values from 1 to 100 with step 0.5

    # Calculate l_p norms for each p value in the specified range
    for p in p_values:
        sum =0
        for point in cluster:
            value = abs(point[0]-point[1])
            new = value**p
            sum = sum + new
        lp = sum ** (1/p)
        norm_value = lp
        # norm_value = np.mean(lp)
        norms.append((p, norm_value))

    # Find the p value with the minimum mean l_p norm from the specified range
    min_norm = min(norms, key=lambda x: x[1])
    return min_norm


def analyze_clusters(cluster_points):
    """Analyze each cluster to find the best p value and the corresponding l_p norm."""
    analysis_results = []
    for i, cluster in enumerate(cluster_points):
        cluster = np.array(cluster)
        best_p, best_norm = calculate_and_find_best_p(cluster)
        analysis_results.append((i + 1, best_p, best_norm))
    return analysis_results


def plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results):
    """Plot the clusters with different shapes based on their p and lp norm values."""
    plt.figure(figsize=(8, 6))

    # Generate a list of distinct colors for each cluster
    num_clusters = len(cluster_points)
    colors = plt.cm.viridis(np.linspace(0, 1, num_clusters))

    for i, (cluster, result) in enumerate(zip(cluster_points, analysis_results)):
        cluster_num, best_p, best_norm = result
        shape = get_shape(best_p)
        color = colors[i]  # Assign a unique color to each cluster

        # Plot points in the cluster with the assigned color
        for point in cluster:
            plt.scatter(point[0], point[1], marker=shape, s=50, c=[color])

    plt.scatter(centers[:, 0], centers[:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("Cluster Shapes based on p and lp norm")
    plt.show()

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle


def plot_cluster_boundaries(X, centers, analysis_results):
    """Plot the boundaries of clusters based on their lp norm values."""
    plt.figure(figsize=(8, 6))

    for center, (_, best_p, best_norm) in zip(centers, analysis_results):
        shape = get_shape(best_p)
        if shape == "D":
            # Diamond shape
            boundary = Circle(
                center, radius=best_norm, edgecolor="blue", facecolor="none"
            )
        elif shape == "o":
            # Circle shape
            boundary = Circle(
                center, radius=best_norm, edgecolor="blue", facecolor="none"
            )
        else:
            # Square shape
            boundary = Rectangle(
                (center[0] - best_norm, center[1] - best_norm),
                2 * best_norm,
                2 * best_norm,
                edgecolor="blue",
                facecolor="none",
            )

        plt.gca().add_patch(boundary)

    plt.scatter(centers[:, 0], centers[:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("Cluster Boundaries based on lp norm")
    plt.show()


def get_shape(p):
    """Determine the shape based on the value of p."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square


if __name__ == "__main__":
    clusters = int(input("Enter value of k: "))
    datapoints = int(input("Enter number of datapoints: "))

    # Generate dataset
    X, y = generate_dataset(datapoints, clusters)

    # Apply KMeans clustering
    y_kmeans, centers = apply_kmeans(X, clusters)

    # Store and print clusters
    cluster_points = store_and_print_clusters(X, y_kmeans, clusters)

    # Analyze clusters
    analysis_results = analyze_clusters(cluster_points)
    for result in analysis_results:
        cluster_num, best_p, best_norm = result
        print(
            f"Cluster {cluster_num}: Best p = {best_p:.2f}, l_p norm = {best_norm:.2f}"
        )

    # # Plot clusters
    plot_clusters(X, y_kmeans, centers)

    # Plot clusters with different shapes based on p and lp norm
    plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results)

    # Plot cluster boundaries based on lp norm
    plot_cluster_boundaries(X, centers, analysis_results)
