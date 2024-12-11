import numpy as np
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


class Cure:
    def __init__(self, n_clusters, n_representatives, shrink_factor, random_state=21):
        self.n_clusters = n_clusters
        self.n_representatives = n_representatives
        self.shrink_factor = shrink_factor
        self.random_state = random_state
        self.clusters = []

    def fit(self, X):
        np.random.seed(self.random_state)
        self.clusters = [[i] for i in range(X.shape[0])]

        while len(self.clusters) > self.n_clusters:
            min_distance = float("inf")
            to_merge = (None, None)

            for i in range(len(self.clusters)):
                for j in range(i + 1, len(self.clusters)):
                    dist = self.cluster_distance(X, self.clusters[i], self.clusters[j])
                    if dist < min_distance:
                        min_distance = dist
                        to_merge = (i, j)

            new_cluster = self.clusters[to_merge[0]] + self.clusters[to_merge[1]]
            del self.clusters[to_merge[1]]
            del self.clusters[to_merge[0]]
            self.clusters.append(new_cluster)

        self.representatives = [
            self.get_representatives(X, cluster) for cluster in self.clusters
        ]

    def cluster_distance(self, X, cluster1, cluster2):
        min_distance = float("inf")
        for i in cluster1:
            for j in cluster2:
                dist = euclidean(X[i], X[j])
                if dist < min_distance:
                    min_distance = dist
        return min_distance

    def get_representatives(self, X, cluster):
        representatives = random.sample(
            cluster, min(len(cluster), self.n_representatives)
        )
        centroid = np.mean(X[cluster], axis=0)
        for i in range(len(representatives)):
            representatives[i] = self.shrink(X[representatives[i]], centroid)
        return representatives

    def shrink(self, point, centroid):
        return centroid + self.shrink_factor * (point - centroid)

    def predict(self, X):
        labels = np.zeros(X.shape[0])
        for i, cluster in enumerate(self.clusters):
            for idx in cluster:
                labels[idx] = i
        return labels


def applying_cure_on_beads(cluster_points, num_beads):
    n_representatives = 5
    shrink_factor = 0.5
    all_beads = []
    for points in cluster_points:
        points_array = np.array(points)  # Convert the list of points to a NumPy array
        cure = Cure(
            n_clusters=num_beads,
            n_representatives=n_representatives,
            shrink_factor=shrink_factor,
        )
        cure.fit(points_array)
        beads = cure.clusters
        bead_centers = [np.mean(points_array[bead], axis=0) for bead in beads]
        # Store beads in the same way as KMeans
        bead_points = [[] for _ in range(num_beads)]
        for bead_idx, bead in enumerate(beads):
            for point_idx in bead:
                bead_points[bead_idx].append(points_array[point_idx].tolist())
        all_beads.append((bead_points, bead_centers))
    return all_beads
