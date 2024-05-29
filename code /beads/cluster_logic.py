import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from matplotlib.patches import Polygon, Circle, Rectangle
import seaborn as sns


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
    return cluster_points


def plot_clusters(X, y_kmeans, centers):
    """Plot the clusters and their centers using PCA for dimensionality reduction."""
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)

    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y_kmeans, s=50, cmap="viridis")
    centers_pca = pca.transform(centers)
    plt.scatter(
        centers_pca[:, 0], centers_pca[:, 1], c="red", s=200, alpha=0.75, marker="."
    )
    plt.xlabel("PCA Feature 1")
    plt.ylabel("PCA Feature 2")
    plt.title("K-Means Clustering (PCA-reduced)")
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
    """Plot the clusters with different shapes based on their p and l_p norm values using PCA for dimensionality reduction."""
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
        cluster_pca = pca.transform(np.array(cluster))
        for point in cluster_pca:
            plt.scatter(point[0], point[1], marker=shape, s=50, c=[color])
    plt.scatter(
        centers_pca[:, 0], centers_pca[:, 1], c="red", s=200, alpha=0.75, marker="."
    )
    plt.xlabel("PCA Feature 1")
    plt.ylabel("PCA Feature 2")
    plt.title("Cluster Shapes based on p and l_p norm (PCA-reduced)")
    plt.show()


def plot_cluster_boundaries(X, centers, analysis_results):
    """Plot the boundaries of clusters based on their lp norm values using PCA for dimensionality reduction."""
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
    plt.xlabel("PCA Feature 1")
    plt.ylabel("PCA Feature 2")
    plt.title("Cluster Boundaries based on lp norm (PCA-reduced)")
    plt.show()


def get_shape(p):
    """Determine the shape based on the value of p."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square


