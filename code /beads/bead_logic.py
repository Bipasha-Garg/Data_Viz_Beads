# bead_logic.py

import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from matplotlib.patches import Circle, Rectangle, Polygon
from cluster_logic import calculate_and_find_best_p, get_shape


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


def plot_bead_boundaries(beads, bead_analysis_results, cluster_centers):
    """Plot the boundaries of beads based on their lp norm values."""
    plt.figure(figsize=(8, 6))

    # Ensure beads and bead_centers are numpy arrays
    bead_positions = np.array(beads[1])
    centroids = np.array(cluster_centers)  # Directly using the passed cluster_centers

    for center, (best_p, best_norm) in zip(centroids, bead_analysis_results):
        # Ensure center is a 1D array
        center = np.asarray(center)

        # Determine the shape based on best_p value
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
            print(f"Diamond vertices: {diamond}")  # Debug statement
            boundary = Polygon(diamond, edgecolor="blue", facecolor="none")
        elif shape == "o":
            print(
                f"Circle center: {center}, radius: {adjusted_norm}"
            )  # Debug statement
            boundary = Circle(
                center, radius=adjusted_norm, edgecolor="green", facecolor="none"
            )
        else:
            print(
                f"Rectangle bottom left: {(center[0] - adjusted_norm, center[1] - adjusted_norm)}, width and height: {2 * adjusted_norm}"
            )  # Debug statement
            boundary = Rectangle(
                (center[0] - adjusted_norm, center[1] - adjusted_norm),
                2 * adjusted_norm,
                2 * adjusted_norm,
                edgecolor="purple",
                facecolor="none",
            )
        plt.gca().add_patch(boundary)

        # Step 1: Identify the closest bead to the centroid
        distances = np.linalg.norm(bead_positions - center, axis=1)
        closest_bead_index = np.argmin(distances)
        closest_bead = bead_positions[closest_bead_index]

        # Step 2: Compute distance to cluster centroid
        distance_to_closest_bead = distances[closest_bead_index]

        # Step 3: Obtain radius of the closest bead
        ric = adjusted_norm

        # Step 4: Obtain the position of the bead in axes-division of space
        dim_values = (closest_bead > center).astype(int)
        bit_vector = int("".join(map(str, dim_values)), 2)

        # Step 5: Calculate the sector angle
        num_dimensions = len(center)
        sector_angle = 2 * np.pi * bit_vector / (2**num_dimensions)

        # Step 6: Place the bead in the corresponding sector in the 2D plot
        bx = distance_to_closest_bead * np.cos(sector_angle)
        by = distance_to_closest_bead * np.sin(sector_angle)

        # Plot the 2-D shape of the bead at (bx, by)
        shape_marker = get_shape_marker(best_p)
        plt.scatter(
            center[0] + bx, center[1] + by, marker=shape_marker, s=50, c="black"
        )

    # Plot all bead positions in red
    plt.scatter(
        bead_positions[:, 0],
        bead_positions[:, 1],
        c="red",
        s=200,
        alpha=0.75,
        marker=".",
    )
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title("Bead Boundaries based on lp norm")
    plt.show()


def get_shape(p):
    """Return shape identifier based on p value."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square


def get_shape_marker(p):
    """Return marker for plot based on p value."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square
