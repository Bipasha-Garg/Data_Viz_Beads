import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from matplotlib.patches import Circle, Rectangle, Polygon
from cluster_logic import calculate_and_find_best_p


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


def plot_beads(beads, p_value, cluster_num):
    """Plot the beads with different shapes based on their p and l_p norm values."""
    plt.figure(figsize=(8, 6))
    num_beads = len(beads[0])
    colors = plt.cm.viridis(np.linspace(0, 1, num_beads))

    for i, (bead, result) in enumerate(zip(beads[0], p_value)):
        best_p, best_norm = result
        shape = get_shape(best_p)
        color = colors[i]
        for point in bead:
            plt.scatter(
                point[0],
                point[1],
                marker=shape,
                s=30,
                edgecolors=[color],
                facecolors="none",
            )

    plt.scatter(beads[1][:, 0], beads[1][:, 1], c="red", s=200, alpha=0.75, marker=".")
    plt.xlabel("Feature 1")
    plt.ylabel("Feature 2")
    plt.title(f"Cluster {cluster_num} Beads Shapes based on p and l_p norm")
    plt.draw()
    plt.pause(0.1)  # Pause to allow time for rendering


def shape_of_boundary(p):
    """Returns a matplotlib shape based on the lp norm."""
    if p <= 1:
        return "Diamond"
    elif p <= 2.5:
        return plt.Circle
    else:
        return plt.Rectangle


def plot_bead_boundaries(beads, bead_analysis_results, cluster_centers):
    """Plot the boundaries of beads based on their lp norm values."""
    plt.figure(figsize=(8, 6))

    # Ensure beads and bead_centers are numpy arrays
    bead_positions = np.array(beads[0], dtype=object)
    bead_centers = np.array(beads[1])
    centroids = np.array(cluster_centers)

    for center,b_cen, (best_p, best_norm) in zip(centroids, bead_centers,bead_analysis_results):
        # Check if the data is 2-D
        if bead_centers.shape[1] == 2:
            # Use actual bead positions for 2-D datasets
            bx, by = b_cen
            r_ic = best_norm

        else:
            # For higher-dimensional datasets, follow the current approach
            # Step 1: Identify the closest bead center to the centroid of the cluster
            distances = np.linalg.norm(bead_centers - center, axis=1)
            closest_bead_index = np.argmin(distances)
            B_ic = bead_centers[closest_bead_index]

            # Step 2: Compute distance of bead to cluster centroid
            d_Ci_Bic = distances[closest_bead_index]

            # Step 3: Obtain radius of the bead
            r_ic = best_norm

            # Step 4: Obtain the position of the bead
            bit_vector = [
                (1 if B_ic[dim] > center[dim] else 0) for dim in range(len(center))
            ]
            i = int("".join(map(str, bit_vector)), 2)
            theta = 2 * np.pi * i / (2 ** len(center))

            bx = center[0] + d_Ci_Bic * np.cos(theta)
            by = center[1] + d_Ci_Bic * np.sin(theta)

        # Plot the 2-D shape of the bead
        shape_class = shape_of_boundary(best_p)
        if shape_class == plt.Circle:
            shape = shape_class((bx, by), r_ic, facecolor="none", edgecolor="blue")
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
        elif shape_class == "Diamond":
            diamond_points = np.array(
                [
                    [bx - r_ic, by],
                    [bx, by + r_ic],
                    [bx + r_ic, by],
                    [bx, by - r_ic],
                    [bx - r_ic, by],
                ]
            )
            shape = plt.Polygon(
                diamond_points, closed=True, facecolor="none", edgecolor="blue"
            )
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
        else:
            shape = shape_class(
                (bx - r_ic / 2, by - r_ic / 2),
                r_ic,
                r_ic,
                facecolor="none",
                edgecolor="blue",
            )
            plt.plot(bx, by, "ro")  # Plot the center of the boundary

        plt.gca().add_patch(shape)

    plt.xlim(-10, 10)
    plt.ylim(-10, 10)
    plt.xlabel("X-axis")
    plt.ylabel("Y-axis")
    plt.title("Bead Boundaries Plot")
    plt.grid(True)
    plt.show()


def get_shape(p):
    """Return shape identifier based on p value."""
    if p <= 1:
        return "D"  # Diamond
    elif p < 2.5:
        return "o"  # Circle
    else:
        return "s"  # Square
