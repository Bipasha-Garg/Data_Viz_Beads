import pandas as pd
import itertools

def generate_subspaces(csv_file, output_folder):
    """
    Generate points in subspaces from an R^d dimensional dataset in a CSV file.

    Args:
    csv_file (str): Path to the input CSV file.
    output_folder (str): Path to the folder to save subspace files.
    """
    # Read the dataset
    data = pd.read_csv(csv_file)
    dimensions = data.columns  # Column names representing dimensions

    # Ensure the output folder exists
    import os
    os.makedirs(output_folder, exist_ok=True)

    # Iterate through all possible subspaces (combinations of dimensions)
    for r in range(1, len(dimensions) + 1):  # From 1D to dD subspaces
        for subspace in itertools.combinations(dimensions, r):
            # Extract points in the current subspace
            subspace_data = data[list(subspace)]

            # Save subspace data to a new CSV file
            subspace_name = "_".join(subspace)  # Create a subspace name
            output_path = os.path.join(output_folder, f"{subspace_name}.csv")
            subspace_data.to_csv(output_path, index=False)

            print(f"Saved subspace {subspace_name} to {output_path}")

# Example usage
csv_file = "wine-clustering.csv"  # Replace with your CSV file path
output_folder = "subspaces"    # Replace with your desired output folder
generate_subspaces(csv_file, output_folder)
