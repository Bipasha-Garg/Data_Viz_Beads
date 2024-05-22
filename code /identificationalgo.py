import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from matplotlib.patches import Circle, Rectangle, Polygon


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
        print(f"Cluster {i + 1}:")
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
    """
    Calculate the tuples (p, radius, farthest_point) for a range of p values and find the best p value for a given cluster.
    """
    alpha = 1.15
    # Step 1: Calculate the centroid of the cluster
    centroid = np.mean(cluster, axis=0)

    # Step 2: Define the range of p values
    p_values = [0.25, 0.5, 1.0, 2.0, 5.0]

    # Step 3: Initialize the set T
    T = []

    # Step 4: Calculate tuples for each p value
    for p in p_values:
        distances = []
        for point in cluster:
            distance = np.linalg.norm(point - centroid, ord=p)
            distances.append((distance, point))

        # Find the farthest point and its distance
        dp_max, fp_max = max(distances, key=lambda x: x[0])
        T.append((p, dp_max, fp_max))

    # Step 5: Sort T in decreasing order of p
    T.sort(key=lambda x: x[0], reverse=True)

    # Step 6: Find the best p value
    while T:
        # Get the tuple with the largest p
        t1 = T.pop(0)
        p1, r1, f1 = t1

        if not T:
            break  # No more tuples to compare with

        # Get the tuple with the next largest p
        t2 = T[0]
        p2, r2, f2 = t2

        # Check the condition
        """The condition if r2 < alpha * r1: checks if the distance r2r2 for the next largest pp is significantly smaller than r1r1 (by a factor of αα). If it is, it implies that the lower pp value might be a more efficient representation since the envelope for pp would be tighter."""
        if r2 < alpha * r1:
            best_p = p2
            return best_p, t1  # Return the best p and the relevant tuples

    # If no suitable p value found, return the largest p value's tuple
    return t1[0], t1


def analyze_clusters(cluster_points):
    """Analyze each cluster to find the best p value and the corresponding l_p norm."""
    analysis_results = []
    for i, cluster in enumerate(cluster_points):
        cluster = np.array(cluster)
        best_p, best_norm_tuple = calculate_and_find_best_p(cluster)
        best_norm = best_norm_tuple[1]  # Extract the radius (l_p norm)
        analysis_results.append((i + 1, best_p, best_norm))
    return analysis_results


def plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results):
    """Plot the clusters with different shapes based on their p and l_p norm values."""
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
    plt.title("Cluster Shapes based on p and l_p norm")
    plt.show()


def plot_cluster_boundaries(X, centers, analysis_results):
    """Plot the boundaries of clusters based on their lp norm values."""
    plt.figure(figsize=(8, 6))

    for center, (_, best_p, best_norm) in zip(centers, analysis_results):
        shape = get_shape(best_p)
        adjusted_norm = float(best_norm) * 0.5  # Decrease the shape size by 50%

        if shape == "D":
            # Diamond shape: Create a rotated square
            diamond = np.array(
                [
                    [center[0] - adjusted_norm, center[1]],
                    [center[0], center[1] - adjusted_norm],
                    [center[0] + adjusted_norm, center[1]],
                    [center[0], center[1] + adjusted_norm],
                ]
            )
            boundary = Polygon(diamond, edgecolor="blue", facecolor="none")
        elif shape == "o":
            # Circle shape
            boundary = Circle(
                center, radius=adjusted_norm, edgecolor="green", facecolor="none"
            )
        else:
            # Square shape
            boundary = Rectangle(
                (center[0] - adjusted_norm, center[1] - adjusted_norm),
                2 * adjusted_norm,
                2 * adjusted_norm,
                edgecolor="purple",
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

    # Plot clusters
    plot_clusters(X, y_kmeans, centers)

    # Plot clusters with different shapes based on p and l_p norm
    plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results)

    # Plot cluster boundaries based on l_p norm
    plot_cluster_boundaries(X, centers, analysis_results)
