import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from matplotlib.patches import Circle, Rectangle, Polygon


def generate_dataset(datapoints, clusters, features):
    """Generate sample data with the specified number of datapoints, clusters, and features."""
    X, y = make_blobs(
        n_samples=datapoints,
        centers=clusters,
        n_features=features,
        cluster_std=0.60,
        random_state=0,
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
    """Plot the clusters and their centers in 2D after PCA transformation."""
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    centers_pca = pca.transform(centers)

    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y_kmeans, s=50, cmap="viridis")
    plt.scatter(
        centers_pca[:, 0], centers_pca[:, 1], c="red", s=200, alpha=0.75, marker="."
    )
    plt.xlabel("Principal Component 1")
    plt.ylabel("Principal Component 2")
    plt.title("K-Means Clustering (2D Projection)")
    plt.show()


def calculate_and_find_best_p(cluster):
    """
    Calculate the tuples (p, radius, farthest_point) for a range of p values and find the best p value for a given cluster.
    """
    alpha = 1.15
    centroid = np.mean(cluster, axis=0)
    p_values = [0.25, 0.5, 1.0, 2.0, 5.0]
    T = []

    for p in p_values:
        distances = []
        for point in cluster:
            distance = np.linalg.norm(point - centroid, ord=p)
            distances.append((distance, point))
        dp_max, fp_max = max(distances, key=lambda x: x[0])
        T.append((p, dp_max, fp_max))

    T.sort(key=lambda x: x[0], reverse=True)

    while T:
        t1 = T.pop(0)
        p1, r1, f1 = t1

        if not T:
            break

        t2 = T[0]
        p2, r2, f2 = t2

        if r2 < alpha * r1:
            best_p = p2
            return best_p, t1

    return t1[0], t1


def analyze_clusters(cluster_points):
    """Analyze each cluster to find the best p value and the corresponding l_p norm."""
    analysis_results = []
    for i, cluster in enumerate(cluster_points):
        cluster = np.array(cluster)
        best_p, best_norm_tuple = calculate_and_find_best_p(cluster)
        best_norm = best_norm_tuple[1]
        analysis_results.append((i + 1, best_p, best_norm))
    return analysis_results


def plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results):
    """Plot the clusters with different shapes based on their p and l_p norm values in 2D after PCA transformation."""
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    centers_pca = pca.transform(centers)

    plt.figure(figsize=(8, 6))
    num_clusters = len(cluster_points)
    colors = plt.cm.viridis(np.linspace(0, 1, num_clusters))

    for i, (cluster, result) in enumerate(zip(cluster_points, analysis_results)):
        cluster_num, best_p, best_norm = result
        shape = get_shape(best_p)
        color = colors[i]
        cluster_pca = pca.transform(cluster)

        for point in cluster_pca:
            plt.scatter(point[0], point[1], marker=shape, s=50, c=[color])

    plt.scatter(
        centers_pca[:, 0], centers_pca[:, 1], c="red", s=200, alpha=0.75, marker="."
    )
    plt.xlabel("Principal Component 1")
    plt.ylabel("Principal Component 2")
    plt.title("Cluster Shapes based on p and l_p norm (2D Projection)")
    plt.show()


def plot_cluster_boundaries(X, centers, analysis_results):
    """Plot the boundaries of clusters based on their lp norm values in 2D after PCA transformation."""
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    centers_pca = pca.transform(centers)

    plt.figure(figsize=(8, 6))

    for center, (_, best_p, best_norm) in zip(centers_pca, analysis_results):
        shape = get_shape(best_p)
        adjusted_norm = float(best_norm) * 0.5

        if shape == "D":
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
            boundary = Circle(
                center, radius=adjusted_norm, edgecolor="green", facecolor="none"
            )
        else:
            boundary = Rectangle(
                (center[0] - adjusted_norm, center[1] - adjusted_norm),
                2 * adjusted_norm,
                2 * adjusted_norm,
                edgecolor="purple",
                facecolor="none",
            )

        plt.gca().add_patch(boundary)

    plt.scatter(
        centers_pca[:, 0], centers_pca[:, 1], c="red", s=200, alpha=0.75, marker="."
    )
    plt.xlabel("Principal Component 1")
    plt.ylabel("Principal Component 2")
    plt.title("Cluster Boundaries based on lp norm (2D Projection)")
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
    features = int(input("Enter number of features: "))

    # Generate dataset with user-defined number of features
    X, y = generate_dataset(datapoints, clusters, features)

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

    # Plot clusters in 2D after PCA transformation
    plot_clusters(X, y_kmeans, centers)

    # Plot clusters with different shapes based on p and l_p norm in 2D after PCA transformation
    plot_cluster_shapes(X, y_kmeans, centers, cluster_points, analysis_results)

    # Plot cluster boundaries based on l_p norm in 2D after PCA transformation
    plot_cluster_boundaries(X, centers, analysis_results)
