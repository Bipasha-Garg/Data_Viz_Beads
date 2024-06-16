import numpy as np
import matplotlib.pyplot as plt
import os
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from matplotlib.patches import Polygon, Rectangle, Circle
from cluster_logic import calculate_and_find_best_p
from matplotlib.patches import Patch
from math import pi, cos, sin
from plot import *

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
            print(best_p)
            print(best_norm)
            cluster_results.append((best_p, best_norm))
        bead_analysis_results.append(cluster_results)
    return bead_analysis_results


def get_shape(best_p):
    """Define the shape based on the p value."""
    if best_p <= 1:
        return "d"  # Circle for p < 0.5
    elif 1 < best_p < 2.5:
        return "o"  # circle for 1 <= p < 2
    else:
        return "s"  # square for p >= 2.5


def plot_beads(beads, p_value, cluster_num):
    """Plot the beads with different shapes based on their p and l_p norm values and save the plots."""
    # Create directory for saving plots if it doesn't exist
    save_dir = "Bead_plots"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Convert beads and bead centers to NumPy arrays
    cluster_points = np.array(beads[0], dtype=object)
    bead_centers = np.array(beads[1])

    plt.figure(figsize=(12, 8))

    # Define the number of variables we're plotting.
    num_vars = len(cluster_points[0][0])

    # Compute angle for each axis
    angles = [n / float(num_vars) * 2 * pi for n in range(num_vars)]
    angles += angles[:1]  # Complete the loop

    # Plot each bead's data
    ax = plt.subplot(111, polar=True)

    # Keep track of legend handles and labels
    handles = []
    labels = []

    for i, (cluster, result) in enumerate(zip(cluster_points, p_value)):
        best_p, best_norm = result
        shape = get_shape(best_p)
        color = plt.cm.get_cmap("hsv", len(cluster_points))(
            i
        )  # Get a unique color for each cluster

        for point in cluster:
            values = point.tolist()
            values += values[:1]  # Repeat the first value to close the loop
            scatter = ax.scatter(
                angles[:-1], values[:-1], marker=shape, s=30, color=color
            )
        # Add a handle and label for the legend
        handles.append(scatter)
        labels.append(f"Cluster {i} (p={best_p:.2f})")

    # Plot bead centers
    center_scatter = None
    for center in bead_centers:
        center_values = center.tolist()
        center_values += center_values[:1]
        center_scatter = ax.scatter(
            angles[:-1], center_values[:-1], c="red", s=200, alpha=0.75, marker="."
        )

    # Add bead center handle and label to the legend
    if center_scatter:
        handles.append(center_scatter)
        labels.append("Cluster Centers")

    # Add labels for each variable
    plt.xticks(
        angles[:-1], [f"Dim {i+1}" for i in range(num_vars)], color="grey", size=8
    )

    plt.title(
        f"Cluster {cluster_num} Beads Shapes based on p and l_p norm (Radar Chart)"
    )

    # Add a legend
    plt.legend(handles, labels, loc="upper right", bbox_to_anchor=(0.1, 0.1))

    plt.tight_layout()

    # Save the plot to the specified directory with a unique name
    plot_name = f"cluster_{cluster_num}_beads_radar.png"
    plot_filename = os.path.join(save_dir, plot_name)
    plt.savefig(plot_filename)
    plt.close()  # Close the figure after saving to avoid display in interactive environments

    print(f"Plot for Cluster {cluster_num} saved as {plot_filename}")

