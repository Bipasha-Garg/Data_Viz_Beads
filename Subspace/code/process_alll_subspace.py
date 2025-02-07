import pandas as pd
import json
from sklearn.cluster import KMeans
import os
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder
from itertools import combinations


def preprocess_csv(file_path, output_file):
    try:
        # Load the CSV file
        df = pd.read_csv(file_path)

        # Handle missing values (drop rows with NaN or use imputation)
        df = df.dropna()

        # Encode string columns with LabelEncoder
        label_encoders = {}
        for col in df.select_dtypes(include=["object"]).columns:
            label_encoders[col] = LabelEncoder()
            df[col] = label_encoders[col].fit_transform(df[col])

        # Ensure there are at least two numerical columns for clustering
        numeric_columns = df.select_dtypes(include=["float64", "int64"]).columns
        if len(numeric_columns) < 2:
            raise ValueError(
                "The dataset must have at least two numerical columns for clustering."
            )

        # Normalize numerical columns
        scaler = StandardScaler()
        df[numeric_columns] = scaler.fit_transform(df[numeric_columns])

        # Add a unique ID for each point
        df["Point_ID"] = range(len(df))

        # Save the preprocessed data to a new CSV file
        df.to_csv(output_file, index=False)
        logging.debug(f"Preprocessed data saved to {output_file}")
        return output_file, numeric_columns

    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise


def process_file(file_path, json_folder, json_filename, K=5, N=3):
    try:
        # Preprocess the CSV file and get numeric columns
        preprocessed_file, numeric_columns = preprocess_csv(
            file_path, "preprocessed.csv"
        )

        # Load the preprocessed data
        df = pd.read_csv(preprocessed_file)

        # Perform KMeans clustering on all numerical dimensions
        kmeans = KMeans(n_clusters=K, random_state=42)
        df["Cluster"] = kmeans.fit_predict(df[numeric_columns].values)

        # Generate subspaces and their corresponding data
        subspace_data = {}
        for dim_count in range(1, len(numeric_columns) + 1):
            for subspace in combinations(numeric_columns, dim_count):
                subspace_name = "".join(subspace)  # Create subspace name (e.g., "xy")
                subspace_data[subspace_name] = []

                # Collect points for the subspace
                for _, row in df.iterrows():
                    point = {dim: row[dim] for dim in subspace}
                    point["Point_ID"] = row["Point_ID"]
                    subspace_data[subspace_name].append(point)

        # Save subspace data as JSON
        if not os.path.exists(json_folder):
            os.makedirs(json_folder)
        json_file_path = os.path.join(json_folder, json_filename)
        with open(json_file_path, "w") as json_file:
            json.dump(subspace_data, json_file, indent=4)

        logging.debug(f"JSON file successfully saved at: {json_file_path}")
        return json_folder, json_filename

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise
