import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

def apply_kmeans(X, clusters):
    """Apply KMeans clustering to the dataset."""
    kmeans = KMeans(n_clusters=clusters, random_state=0)
    kmeans.fit(X)
    sample_labels = kmeans.predict(X)
    centers = kmeans.cluster_centers_
    return sample_labels, centers


def store_cluster(X, y_kmeans, k):
    """Store the clusters in an array of arrays and print them."""
    cluster_points = [[] for _ in range(k)]
    for i, label in enumerate(y_kmeans):
        cluster_points[label].append(X[i])
    return cluster_points


def calculate_and_find_best_p(cluster):
    """
    Calculate the tuples (p, radius, farthest_point) for a range of p values and find the best p value for a given cluster.
    """
    alpha = 1.15
    centroid = np.mean(cluster, axis=0) # will be bead center if bead is passed
    p_values = [0.25, 0.5, 1.0, 2.0, 5.0]
    T = []
    for p in p_values:
        distances = []
        for point in cluster:
            distance = np.linalg.norm(point - centroid, ord=p)
            distances.append((distance, point))
        dis_max, point_max = max(distances, key=lambda x: x[0])
        T.append((p, dis_max, point_max))
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



