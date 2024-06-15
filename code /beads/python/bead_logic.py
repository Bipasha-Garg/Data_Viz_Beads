import numpy as np
import matplotlib.pyplot as plt
import os
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from matplotlib.patches import Polygon, Rectangle, Circle
from cluster_logic import calculate_and_find_best_p
from matplotlib.patches import Patch
from math import pi

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


def shape_of_boundary(p):
    """Return the shape class based on the value of p."""
    if p <= 1:
        return Diamond
    elif p <= 2.5:
        return Circle
    else:
        return Rectangle


class Diamond(Polygon):
    """Class to create a diamond-shaped boundary."""

    def __init__(self, xy, width, height, **kwargs):
        points = np.array(
            [
                [xy[0], xy[1] + height / 2],
                [xy[0] + width / 2, xy[1]],
                [xy[0], xy[1] - height / 2],
                [xy[0] - width / 2, xy[1]],
                [xy[0], xy[1] + height / 2],
            ]
        )
        super().__init__(points, **kwargs)


def plot_bead_boundaries(beads, bead_analysis_results, cluster_centers, plotname):
    """Plot the boundaries of beads based on their lp norm values and save the plots."""
    # Create directory for saving plots if it doesn't exist
    save_dir = "plots"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    plt.figure(figsize=(8, 6))

    # Ensure beads and bead_centers are numpy arrays
    bead_positions = np.array(beads[0], dtype=object)
    bead_centers = np.array(beads[1])
    centroids = np.array(cluster_centers)

    # Collect all boundary coordinates to determine plot limits
    all_x = []
    all_y = []

    for center, b_cen, (best_p, best_norm) in zip(
        centroids, bead_centers, bead_analysis_results
    ):
        # Step 1: Identify the closest bead center to the centroid of the cluster
        distances = np.linalg.norm(bead_centers - center, axis=1)
        closest_bead_index = np.argmin(distances)
        B_ic = bead_centers[closest_bead_index]

        # Step 2: Compute distance of bead to cluster centroid
        d_Ci_Bic = distances[closest_bead_index]

        # Step 3: Obtain radius of the bead
        r_ic = best_norm

        # Step 4: Obtain the position of the bead in sectors
        bit_vector = [
            (1 if B_ic[dim] > center[dim] else 0) for dim in range(len(center))
        ]
        i = int("".join(map(str, bit_vector)), 2)
        sector_angle = 2 * np.pi / (2 ** len(center))
        start_angle = i * sector_angle
        end_angle = (i + 1) * sector_angle

        # Plot the sector boundaries
        sector_shape = Polygon(
            np.array(
                [
                    [center[0], center[1]],
                    [
                        center[0] + d_Ci_Bic * np.cos(start_angle),
                        center[1] + d_Ci_Bic * np.sin(start_angle),
                    ],
                    [
                        center[0] + d_Ci_Bic * np.cos(end_angle),
                        center[1] + d_Ci_Bic * np.sin(end_angle),
                    ],
                ]
            ),
            fill=None,
            edgecolor="black",
        )
        plt.gca().add_patch(sector_shape)

        # Plot the 2-D shape of the bead
        bx = center[0] + d_Ci_Bic * np.cos((start_angle + end_angle) / 2)
        by = center[1] + d_Ci_Bic * np.sin((start_angle + end_angle) / 2)

        shape_class = shape_of_boundary(best_p)
        if shape_class == Diamond:
            diamond_points = np.array(
                [
                    [bx - r_ic, by],
                    [bx, by + r_ic],
                    [bx + r_ic, by],
                    [bx, by - r_ic],
                    [bx - r_ic, by],
                ]
            )
            shape = Polygon(
                diamond_points, closed=True, facecolor="none", edgecolor="blue"
            )
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
            all_x.extend(diamond_points[:, 0])
            all_y.extend(diamond_points[:, 1])
        elif shape_class == Circle:
            shape = Circle(
                (bx, by),
                r_ic,
                facecolor="none",
                edgecolor="blue",
            )
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
            all_x.extend([bx - r_ic, bx + r_ic])
            all_y.extend([by - r_ic, by + r_ic])
        else:
            shape = shape_class(
                (bx - r_ic / 2, by - r_ic / 2),
                r_ic,
                r_ic,
                facecolor="none",
                edgecolor="blue",
            )
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
            all_x.extend([bx - r_ic / 2, bx + r_ic / 2])
            all_y.extend([by - r_ic / 2, by + r_ic / 2])

        plt.gca().add_patch(shape)

    # Set plot limits dynamically
    plt.xlim(min(all_x) - 1, max(all_x) + 1)
    plt.ylim(min(all_y) - 1, max(all_y) + 1)

    plt.xlabel("X-axis")
    plt.ylabel("Y-axis")
    plt.title("Bead Boundaries Plot")
    plt.grid(True)

    # Save the plot to the specified directory with a default name
    plot_name = plotname + ".png"
    plot_filename = os.path.join(save_dir, plot_name)
    plt.savefig(plot_filename)
    plt.close()  # Close the figure after saving to avoid display in interactive environments

    print(f"Plot saved as {plot_filename}")
