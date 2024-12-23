import pandas as pd
import json
from sklearn.cluster import KMeans
import os
import logging
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder

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

        # Rename columns for consistency
        numeric_columns = list(numeric_columns)
        df = df[numeric_columns]
        column_names = ["x1", "x2"] + list(df.columns[2:])
        df.columns = column_names

        # Normalize numerical columns
        scaler = StandardScaler()
        df.iloc[:, :] = scaler.fit_transform(df.iloc[:, :])

        # Save the preprocessed data to a new CSV file
        df.to_csv(output_file, index=False)
        print(f"Preprocessed data saved to {output_file}")
        return output_file

    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise


def process_file(file_path, json_folder, json_filename):
    K = 3
    N = 2
    try:
        preprocess_csv(file_path, "preprocessed.csv")
        new_file_path = "preprocessed.csv"
        # Load the CSV file into a pandas DataFrame
        df = pd.read_csv(new_file_path)

        # Perform KMeans clustering
        kmeans = KMeans(n_clusters=K, random_state=42)
        df["Cluster"] = kmeans.fit_predict(df[["x1", "x2"]].values)

        # Further divide clusters into sub-clusters (beads)
        bead_clusters = []
        for cluster_id in range(K):
            cluster_data = df[df["Cluster"] == cluster_id].copy()

            if cluster_data.shape[0] < N:
                cluster_data["Bead"] = 0
            else:
                bead_kmeans = KMeans(n_clusters=N, random_state=42)
                cluster_data["Bead"] = bead_kmeans.fit_predict(
                    cluster_data[["x1", "x2"]].values
                )
            bead_clusters.append(cluster_data)

        final_df = pd.concat(bead_clusters)

        # Create JSON data
        json_data = final_df.to_dict(orient="records")

        # Save JSON file
        if not os.path.exists(json_folder):
            os.makedirs(json_folder)
        json_file_path = os.path.join(json_folder, json_filename)
        with open(json_file_path, "w") as json_file:
            json.dump(json_data, json_file, indent=4)

        logging.debug(f"JSON file successfully saved at: {json_file_path}")
        return json_folder, json_filename

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise
