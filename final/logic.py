import numpy as np
from sklearn.cluster import KMeans
import json


def apply_kmeans(X, clusters):
    """Apply KMeans clustering to the dataset."""
    kmeans = KMeans(n_clusters=clusters, random_state=0)
    kmeans.fit(X)
    sample_labels = kmeans.predict(X)
    centers = kmeans.cluster_centers_
    return sample_labels, centers


def store_cluster(X, y_kmeans, k):
    """Store the clusters in an array of arrays."""
    cluster_points = [[] for _ in range(k)]
    for i, label in enumerate(y_kmeans):
        cluster_points[label].append(X[i])
    return cluster_points


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
            print()
    return all_beads


def calculate_and_find_best_p(cluster):
    """
    Calculate the tuples (p, radius, farthest_point) for a range of p values and find the best p value for a given cluster.
    """
    # alpha = 1.15
    alpha_range = np.linspace(
        1.1, 1.2, 11
    )  # Create 11 evenly spaced alpha values between 1.1 and 1.2
    centroid = np.mean(cluster, axis=0)  # will be bead center if bead is passed
    p_values = [
        0.25,
        0.5,
        1.0,
        2.0,
        5.0,
    ]
    T = []
    for p in p_values:
        distances = []
        for point in cluster:
            distance = np.linalg.norm(point - centroid, ord=p)
            distances.append((distance, point))
        dis_max, point_max = max(distances, key=lambda x: x[0])
        print(f"p:{p}, distance: {dis_max}")
        T.append((p, dis_max, point_max))
    T.sort(key=lambda x: x[0], reverse=True)

    # Initialize the best_p and best_t values
    best_p = None
    best_t = None
    print("printing best norm")
    # Process the sorted tuples to find the best p value
    while T:
        # Step 1: Get the tuple with the largest p
        t1 = T.pop(0)
        p1, r1, f1 = t1

        if not T:
            best_p, best_t = p1, t1
            break

        # Step 2: Get the next tuple with the largest p
        t2 = T[0]
        p2, r2, f2 = t2

        # Step 3: Check if the condition is satisfied for all alpha values
        if all(r2 < alpha * r1 for alpha in alpha_range):
            best_p, best_t = p2, t1
        else:
            best_p, best_t = p1, t1
            break
        print(f"p: {best_p}, lp: {best_t}")
    # If no suitable p value is found, return the last processed tuple
    return best_p, best_t


def analyze_beads(beads):
    """Analyze each bead to find the best p value and the corresponding l_p norm."""
    bead_analysis_results = []
    for cluster_beads in beads:
        cluster_results = []
        for bead in cluster_beads[0]:
            bead = np.array(bead)
            best_p, best_norm_tuple = calculate_and_find_best_p(bead)
            best_norm = best_norm_tuple[1]
            print(best_p)
            print(best_norm)
            cluster_results.append((best_p, best_norm))
        bead_analysis_results.append(cluster_results)
    return bead_analysis_results

