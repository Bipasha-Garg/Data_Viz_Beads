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
    """Plot the clusters with different shapes based on their p and l_p norm values."""
    plt.figure(figsize=(8, 6))
    num_clusters = len(cluster_points)
    colors = plt.cm.viridis(np.linspace(0, 1, num_clusters))
    for i, (cluster, result) in enumerate(zip(cluster_points, analysis_results)):
        cluster_num, best_p, best_norm = result
        shape = get_shape(best_p)
        color = colors[i]
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


def divide_cluster_into_beads(cluster, num_beads):
    """Divide a cluster into smaller sub-clusters (beads) using KMeans."""
    kmeans = KMeans(n_clusters=num_beads, random_state=0)
    kmeans.fit(cluster)
    y_beads = kmeans.predict(cluster)
    bead_centers = kmeans.cluster_centers_
    bead_points = [[] for _ in range(num_beads)]
    for i, label in enumerate(y_beads):
        bead_points[label].append(cluster[i])
    return bead_points, bead_centers


def store_and_print_beads(cluster_points, num_beads):
    """Store and print the sub-clusters (beads) within each cluster."""
    all_beads = []
    for i, cluster in enumerate(cluster_points):
        beads, bead_centers = divide_cluster_into_beads(np.array(cluster), num_beads)
        all_beads.append((beads, bead_centers))
        print(f"Cluster {i + 1} Beads:")
        for j, bead in enumerate(beads):
            print(f"  Bead {j + 1}:")
            for point in bead:
                print(f"    {tuple(point)}")
            print()  # Add an empty line between beads
    return all_beads


def analyze_beads(beads):
    """Analyze each bead to find the best p value and the corresponding l_p norm."""
    bead_analysis_results = []
    for cluster_beads in beads:
        cluster_results = []
        for bead in cluster_beads[0]:
            bead = np.array(bead)
            best_p, best_norm_tuple = calculate_and_find_best_p(bead)
            best_norm = best_norm_tuple[1]
            cluster_results.append((best_p, best_norm))
        bead_analysis_results.append(cluster_results)
    return bead_analysis_results


def plot_beads(beads, bead_analysis_results, cluster_num):
    """Plot the beads with different shapes based on their p and l_p norm values."""
    plt.figure(figsize=(8, 6))

    num_beads = len(beads[0])  # Number of beads in the current cluster
    colors = plt.cm.viridis(np.linspace(0, 1, num_beads))

    for i, (bead, result) in enumerate(zip(beads[0], bead_analysis_results)):
        best_p, best_norm = result
        shape = get_shape(best_p)
        color = colors[i]
        for point in bead:
            plt.scatter(point[0], point[1], marker=shape, s=50, c=[color])

    plt.scatter(beads[1][:, 0], beads[1][:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title(f"Cluster {cluster_num} Beads Shapes based on p and l_p norm")
    plt.show()


def plot_bead_boundaries(beads, bead_analysis_results):
    """Plot the boundaries of beads based on their lp norm values."""
    plt.figure(figsize=(8, 6))
    for center, (best_p, best_norm) in zip(beads[1], bead_analysis_results):
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

        # Calculate distance from cluster centroid to closest bead
        closest_bead_index = np.argmin(np.linalg.norm(beads[1] - center, axis=1))
        closest_bead = beads[1][closest_bead_index]
        distance_to_closest_bead = np.linalg.norm(center - closest_bead)

        # Compute the position of the bead in axes-division of space
        dim_values = (closest_bead > center).astype(int)
        bit_vector = int("".join(map(str, dim_values)), 2)
        sector_angle = 2 * np.pi * bit_vector / (2 * len(dim_values))

        # Obtain lp-norm information of bead
        bx = distance_to_closest_bead * np.cos(sector_angle)
        by = distance_to_closest_bead * np.sin(sector_angle)

        # Plot the 2-D shape of the bead at (bx, by)
        shape_marker = get_shape_marker(best_p)
        plt.scatter(
            center[0] + bx, center[1] + by, marker=shape_marker, s=50, c="black"
        )

    plt.scatter(beads[1][:, 0], beads[1][:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("Bead Boundaries based on lp norm")
    plt.show()


def get_shape_marker(p):
    """Return marker for plot based on p value."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square


if __name__ == "__main__":
    clusters = int(input("Enter value of k: "))
    datapoints = int(input("Enter number of datapoints: "))
    num_beads = int(input("Enter number of beads per cluster: "))

    # Generate dataset
    X, y = generate_dataset(datapoints, clusters)

    # Apply KMeans clustering
    y_kmeans, centers = apply_kmeans(X, clusters)

    # Store and print clusters
    cluster_points = store_and_print_clusters(X, y_kmeans, clusters)

    # Store and print beads
    all_beads = store_and_print_beads(cluster_points, num_beads)
    
    plot_clusters(X,y_kmeans,centers)
    # Analyze and plot each cluster's beads separately
    for i, (beads, bead_centers) in enumerate(all_beads):
        bead_analysis_results = analyze_beads([(beads, bead_centers)])
        plot_beads((beads, bead_centers), bead_analysis_results[0], i + 1)
        plot_bead_boundaries((beads, bead_centers), bead_analysis_results[0])
