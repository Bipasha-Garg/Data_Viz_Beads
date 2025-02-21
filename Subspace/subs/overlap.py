import pandas as pd
import os


def find_subspace_overlap(csv_file, output_folder):
    """
    Generate incremental subspaces (x, xy, xyz, ...) from an R^d dataset
    and compute overlaps between consecutive subspaces.

    Args:
    csv_file (str): Path to the input CSV file.
    output_folder (str): Path to the folder to save subspace files and overlaps.
    """
    # Read the dataset
    data = pd.read_csv(csv_file)
    dimensions = data.columns  # Column names representing dimensions

    # Ensure the output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Dictionary to store data for each subspace
    subspace_data = {}

    # Generate subspaces incrementally
    for r in range(1, len(dimensions) + 1):
        subspace = dimensions[:r]  # Select the first `r` dimensions
        subspace_name = "_".join(subspace)  # Create a subspace name
        subspace_data[subspace_name] = data[list(subspace)]

        # Save subspace data
        subspace_path = os.path.join(output_folder, f"{subspace_name}.csv")
        subspace_data[subspace_name].to_csv(subspace_path, index=False)
        print(f"Saved subspace {subspace_name} to {subspace_path}")

    # Calculate overlap between consecutive subspaces
    overlap_folder = os.path.join(output_folder, "overlaps")
    os.makedirs(overlap_folder, exist_ok=True)

    previous_subspace = None
    for subspace_name in subspace_data:
        if previous_subspace:
            # Find the overlap between the current and previous subspaces
            overlap = pd.merge(
                subspace_data[previous_subspace],
                subspace_data[subspace_name],
                how="inner",
            )
            overlap_name = f"{previous_subspace}_and_{subspace_name}_overlap"
            overlap_path = os.path.join(overlap_folder, f"{overlap_name}.csv")
            overlap.to_csv(overlap_path, index=False)
            print(f"Saved overlap {overlap_name} to {overlap_path}")
        previous_subspace = subspace_name


# Example usage
csv_file = "wine-clustering.csv"  # Replace with your CSV file path
output_folder = "incremental_subspaces_with_overlaps"  # Desired output folder
find_subspace_overlap(csv_file, output_folder)
