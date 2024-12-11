import numpy as np
from scipy.spatial.distance import cdist
import random
from scipy.spatial.distance import euclidean
from sklearn.cluster import KMeans
import json

def apply_kmeans(X, clusters):
    """Apply KMeans clustering to the dataset."""
    kmeans = KMeans(n_clusters=clusters, random_state=0)
    kmeans.fit(X)
    sample_labels = kmeans.predict(X)
    centers = kmeans.cluster_centers_
    return sample_labels, centers #array


def store_cluster(X, y_kmeans, k):
    """Store the clusters in an array of arrays."""
    cluster_points = [[] for _ in range(k)]
    for i, label in enumerate(y_kmeans):
        cluster_points[label].append(X[i])
    return cluster_points


def store_and_print_beads(cluster_points, num_beads):
    """Store and print the sub-clusters (beads) within each cluster."""
    all_beads = []
    for i, cluster in enumerate(cluster_points):
        beads, bead_centers = divide_cluster_into_beads(np.array(cluster), num_beads)
        all_beads.append((beads, bead_centers))
    return all_beads


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


def cure_algorithm(points, num_representatives, shrink_factor=0.5):
    # Ensure points is a numpy array of floats
    points = np.array(points, dtype=float)

    # Debugging statements
    # print(f"Points type: {type(points)}, Points shape: {points.shape}")
    # print(f"Points data type: {points.dtype}")
    # print(
    #     f"num_representatives type: {type(num_representatives)}, value: {num_representatives}"
    # )

    # Ensure num_representatives is an integer
    if isinstance(num_representatives, str):
        try:
            num_representatives = int(num_representatives)
            # print(f"Converted num_representatives to integer: {num_representatives}")
        except ValueError:
            raise TypeError(
                "num_representatives must be an integer or a string convertible to an integer"
            )

    # Check for non-numeric data
    if not np.issubdtype(points.dtype, np.number):
        raise ValueError("All points must be numeric values.")

    # Step 1: Randomly select initial representatives
    np.random.seed(0)
    initial_reps = points[
        np.random.choice(points.shape[0], num_representatives, replace=False)
    ]

    # Step 2: Compute the mean of the points
    mean_point = np.mean(points, axis=0)

    # Step 3: Shrink representatives towards the mean
    representatives = initial_reps + shrink_factor * (mean_point - initial_reps)

    while len(representatives) > num_representatives:
        # Compute pairwise distances between representatives
        distances = cdist(representatives, representatives)
        np.fill_diagonal(distances, np.inf)

        # Find the closest pair of representatives
        min_dist_idx = np.unravel_index(np.argmin(distances), distances.shape)

        # Merge the closest pair
        merged_rep = (
            representatives[min_dist_idx[0]] + representatives[min_dist_idx[1]]
        ) / 2

        # Remove the original pair and add the merged representative
        representatives = np.delete(representatives, min_dist_idx, axis=0)
        representatives = np.vstack([representatives, merged_rep])

    return representatives


def cureBeads(all_beads, representatives):
    cured_beads = []

    for beads, centers in all_beads:
        new_beads = []
        new_centers = []

        for bead in beads:
            # Ensure each point in bead is properly formatted and numeric
            bead_points = [np.array(point).flatten().astype(float) for point in bead]
            bead_points = np.array(bead_points)
            # print(f"Bead points: {bead_points}")  # Debugging statement
            # print(f"Shape of bead_points: {bead_points.shape}")  # Debugging statement
            # print(
            #     f"Type of bead_points elements: {type(bead_points[0])}"
            # )  # Debugging statement

            reduced_points = cure_algorithm(bead_points, representatives)
            new_beads.append([np.array(rep) for rep in reduced_points])

            # Calculate the new center of the bead
            new_center = np.mean(reduced_points, axis=0)
            new_centers.append(new_center)

        cured_beads.append((new_beads, np.array(new_centers)))

    return cured_beads


def calculate_and_find_best_p(cluster):
    """
    Calculate the tuples (p, radius, farthest_point) for a range of p values and find the best p value for a given cluster.
    """
    alpha_range = np.linspace(
        1.1, 1.2, 11
    )  # Create 11 evenly spaced alpha values between 1.1 and 1.2
    centroid = np.mean(cluster, axis=0)  # will be bead center if bead is passed
    p_values = [0.25, 0.5, 1.0, 2.0, 5.0]
    T = []
    for p in p_values:
        distances = []
        for point in cluster:
            distance = np.linalg.norm(point - centroid, ord=p)
            distances.append((distance, point))
        dis_max, point_max = max(distances, key=lambda x: x[0])
        # print(f"p:{p}, distance: {dis_max}")
        T.append((p, dis_max, point_max))
    T.sort(key=lambda x: x[0], reverse=True)

    # Initialize the best_p and best_t values
    best_p = None
    best_t = None
    # print("printing best norm")
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
        # print(f"p: {best_p}, lp: {best_t}")
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
            # print(best_p)
            # print(best_norm)
            cluster_results.append((best_p, best_norm))
        bead_analysis_results.append(cluster_results)
    return bead_analysis_results
