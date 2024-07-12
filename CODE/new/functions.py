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
    return all_beads


def cure_algorithm(points, num_representatives, shrink_factor=0.5):
    # Ensure points is a numpy array of floats
    points = np.array(points, dtype=float)

    # Debugging statements
    print(f"Points type: {type(points)}, Points shape: {points.shape}")
    print(f"Points data type: {points.dtype}")
    print(
        f"num_representatives type: {type(num_representatives)}, value: {num_representatives}"
    )

    # Ensure num_representatives is an integer
    if isinstance(num_representatives, str):
        try:
            num_representatives = int(num_representatives)
            print(f"Converted num_representatives to integer: {num_representatives}")
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
            print(f"Bead points: {bead_points}")  # Debugging statement
            print(f"Shape of bead_points: {bead_points.shape}")  # Debugging statement
            print(
                f"Type of bead_points elements: {type(bead_points[0])}"
            )  # Debugging statement

            reduced_points = cure_algorithm(bead_points, representatives)
            new_beads.append([np.array(rep) for rep in reduced_points])

            # Calculate the new center of the bead
            new_center = np.mean(reduced_points, axis=0)
            new_centers.append(new_center)

        cured_beads.append((new_beads, np.array(new_centers)))

    return cured_beads
