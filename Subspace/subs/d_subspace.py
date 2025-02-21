import pandas as pd


def generate_incremental_subspaces(csv_file, output_folder):
    """
    Generate points in incremental subspaces (x, xy, xyz, ...)
    from an R^d dimensional dataset in a CSV file.

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

    # Generate subspaces incrementally
    for r in range(1, len(dimensions) + 1):  # Incrementally include dimensions
        subspace = dimensions[:r]  # Select the first `r` dimensions
        subspace_data = data[list(subspace)]

        # Save subspace data to a new CSV file
        subspace_name = "_".join(subspace)  # Create a subspace name
        output_path = os.path.join(output_folder, f"{subspace_name}.csv")
        subspace_data.to_csv(output_path, index=False)

        print(f"Saved subspace {subspace_name} to {output_path}")


# Example usage
csv_file = "wine-clustering.csv"  # Replace with your CSV file path
output_folder = "incremental_subspaces"  # Replace with your desired output folder
generate_incremental_subspaces(csv_file, output_folder)
