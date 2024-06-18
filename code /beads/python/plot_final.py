import numpy as np
import matplotlib.pyplot as plt
from math import pi, cos, sin


def plot_bead_boundaries(
    bead_points, bead_analysis_results, cluster_centers, plot_name
):
    bead_positions = np.array(bead_points[0], dtype=object)
    bead_centers = np.array(bead_points[1])

    # Extract p_norm and lp_norm from bead_analysis_results
    p_norm = bead_analysis_results[:, 0]
    lp_norm = bead_analysis_results[:, 1]

    # Initialize the plot
    plt.figure(figsize=(8, 8))

    # Iterate over each bead center
    for idx, B_ic in enumerate(bead_centers):
        # Find the closest cluster center to B_ic
        distances_Bi_C = np.linalg.norm(B_ic - cluster_centers, ord=2, axis=1)
        closest_cluster_idx = np.argmin(distances_Bi_C)
        r_ic = lp_norm[idx]

        # Calculate the angle theta
        num_vars = len(cluster_centers[closest_cluster_idx])
        bit_vector = [
            (1 if B_ic[dim] > cluster_centers[closest_cluster_idx][dim] else 0)
            for dim in range(num_vars)
        ]
        i = int("".join(map(str, bit_vector)), 2)
        theta = 2 * pi * i / (2**num_vars)

        # Calculate bx and by
        bx = distances_Bi_C[closest_cluster_idx] * cos(theta)
        by = distances_Bi_C[closest_cluster_idx] * sin(theta)

        # Determine the shape based on p_norm and plot
        shape = get_shape_boundary(p_norm[idx], bx, by, r_ic)
        plt.gca().add_patch(shape)

    plt.xlim(-10, 10)  # Adjust xlim and ylim as needed
    plt.ylim(-10, 10)
    plt.title(plot_name)
    plt.gca().set_aspect("equal", adjustable="box")
    plt.show()


def get_shape_boundary(p_norm, bx, by, r_ic):
    if p_norm <= 2 and p_norm > 1:
        shape = plt.Circle((bx, by), r_ic, color="b", fill=False)
    elif p_norm <= 1:
        shape = plt.Polygon(
            [(bx - r_ic, by), (bx, by + r_ic), (bx + r_ic, by), (bx, by - r_ic)],
            color="g",
            fill=False,
        )
    else:
        shape = plt.Rectangle(
            (bx - r_ic, by - r_ic), 2 * r_ic, 2 * r_ic, color="r", fill=False
        )
    return shape
