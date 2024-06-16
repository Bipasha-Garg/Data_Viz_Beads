import numpy as np
import os
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle, Rectangle
from math import pi, cos, sin


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

    plt.figure(figsize=(12, 8))

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

        # Step 4: Determine the position of the bead in axes-division of space
        num_vars = len(center)
        bit_vector = [(1 if B_ic[dim] > center[dim] else 0) for dim in range(num_vars)]
        i = int("".join(map(str, bit_vector)), 2)
        theta = 2 * pi * i / (2**num_vars)

        # Step 5: Place the bead in the corresponding sector in the 2-D plot
        bx = center[0] + d_Ci_Bic * cos(theta)
        by = center[1] + d_Ci_Bic * sin(theta)

        print(
            f"Cluster center: {center}, Bead center: {B_ic}, Calculated position: ({bx}, {by})"
        )

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
            shape = Circle((bx, by), r_ic, facecolor="none", edgecolor="green")
            plt.plot(bx, by, "ro")  # Plot the center of the boundary
            all_x.extend([bx - r_ic, bx + r_ic])
            all_y.extend([by - r_ic, by + r_ic])
        else:
            shape = shape_class(
                (bx - r_ic / 2, by - r_ic / 2),
                r_ic,
                r_ic,
                facecolor="none",
                edgecolor="yellow",
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


    plot_name = plotname + ".png"
    plot_filename = os.path.join(save_dir, plot_name)
    plt.savefig(plot_filename)
    plt.close()  

    print(f"Plot saved as {plot_filename}")

