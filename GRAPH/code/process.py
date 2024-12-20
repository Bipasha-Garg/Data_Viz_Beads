import pandas as pd
import json
from sklearn.cluster import KMeans
import os
import logging
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder


# # def preprocess_csv(file_path, output_file):
# #     try:
# #         # Load the CSV file
# #         df = pd.read_csv(file_path)

# #         # Handle missing values (drop rows with NaN or use imputation)
# #         df = df.dropna()  # Drop rows with missing values

# #         # Drop unnecessary columns (e.g., identifiers, text columns)
# #         columns_to_drop = []  # Specify columns to drop if any
# #         df = df.drop(columns=columns_to_drop, errors="ignore")

# #         # Ensure there are at least two columns for clustering
# #         if df.shape[1] < 2:
# #             raise ValueError(
# #                 "The dataset must have at least two numerical columns for clustering."
# #             )

# #         # Rename columns for consistency (if needed)
# #         column_names = ["x1", "x2"] + list(df.columns[2:])
# #         df.columns = column_names

# #         # Normalize the data for clustering
# #         scaler = StandardScaler()
# #         df.iloc[:, :-1] = scaler.fit_transform(df.iloc[:, :-1])

# #         # Save the preprocessed data to a new CSV file
# #         df.to_csv(output_file, index=False)
# #         print(f"Preprocessed data saved to {output_file}")
# #         return output_file

# #     except Exception as e:
# #         print(f"Error during preprocessing: {e}")
# #         raise


# def preprocess_csv(file_path, output_file):
#     try:
#         # Load the CSV file
#         df = pd.read_csv(file_path)

#         # Handle missing values (impute or drop rows)
#         df = df.fillna("Unknown")  # Replace missing values in categorical columns

#         # Separate numerical and non-numerical columns
#         num_cols = df.select_dtypes(include=["number"]).columns.tolist()
#         cat_cols = df.select_dtypes(include=["object"]).columns.tolist()

#         # Encode categorical columns using Label Encoding (or One-Hot Encoding if preferred)
#         label_encoders = {}
#         for col in cat_cols:
#             le = LabelEncoder()
#             df[col] = le.fit_transform(df[col])
#             label_encoders[col] = (
#                 le  # Store encoder for possible inverse transform later
#             )

#         # Ensure there are at least two numerical columns for clustering
#         if len(num_cols) < 2:
#             raise ValueError(
#                 "The dataset must have at least two numerical columns for clustering."
#             )

#         # Normalize the numerical data
#         scaler = StandardScaler()
#         df[num_cols] = scaler.fit_transform(df[num_cols])

#         # Save the preprocessed data to a new CSV file
#         df.to_csv(output_file, index=False)
#         print(f"Preprocessed data saved to {output_file}")
#         return output_file, label_encoders

#     except Exception as e:
#         print(f"Error during preprocessing: {e}")
#         raise


# def process_file(file_path, json_folder, json_filename):
#     K = 3
#     N = 2
#     try:
#         preprocess_csv(file_path, "preprocessed.csv")
#         new_file_path = "preprocessed.csv"
#         # Load the CSV file into a pandas DataFrame
#         df = pd.read_csv(new_file_path)

#         # Check if the CSV contains enough columns for clustering
#         if df.shape[1] < 2:
#             raise ValueError(
#                 "CSV file must contain at least two columns for clustering."
#             )

#         # Assume all columns except the last one are features for clustering
#         features = df.iloc[:, :-1].values  # Modify as needed based on dataset

#         # Step 1: Perform KMeans clustering to create K main clusters
#         kmeans = KMeans(n_clusters=K, random_state=42)
#         df["Cluster"] = kmeans.fit_predict(features)

#         # Step 2: Further divide each cluster into N beads (sub-clusters)
#         bead_clusters = []
#         for cluster_id in range(K):
#             # Extract data belonging to the current cluster
#             cluster_data = df[df["Cluster"] == cluster_id].copy()

#             # Check if there's enough data for sub-clustering
#             if cluster_data.shape[0] < N:
#                 logging.warning(
#                     f"Cluster {cluster_id} has fewer points than sub-clusters (N={N}). Skipping bead clustering."
#                 )
#                 cluster_data["Bead"] = 0  # Assign all points to bead 0
#             else:
#                 # Perform KMeans to create N sub-clusters (beads)
#                 bead_kmeans = KMeans(n_clusters=N, random_state=42)
#                 cluster_data["Bead"] = bead_kmeans.fit_predict(
#                     cluster_data.iloc[:, :-2].values
#                 )
#             # Append to bead clusters list
#             bead_clusters.append(cluster_data)
#             print("bead df")
#             print(bead_clusters)
#         # Combine all bead clusters into a single DataFrame
#         final_df = pd.concat(bead_clusters)
#         print("final df")
#         print(final_df)
#         # Step 3: Create JSON data with Cluster and Bead number explicitly included
#         json_data = []
#         for _, row in final_df.iterrows():
#             data_point = {
#                 "x1": row["x1"],  # Assuming 'x1' is a feature column in your CSV
#                 "x2": row["x2"],  # Assuming 'x2' is a feature column in your CSV
#                 "Cluster": row["Cluster"],  # Include cluster number
#                 "Bead": row["Bead"],  # Include bead number
#             }
#             json_data.append(data_point)

#         # Create the output folder if it doesn't exist
#         if not os.path.exists(json_folder):
#             os.makedirs(json_folder)

#         # Save the JSON data
#         json_file_path = os.path.join(json_folder, json_filename)
#         print(json_file_path)
#         with open(json_file_path, "w") as json_file:
#             json.dump(json_data, json_file, indent=4)

#         logging.debug(f"JSON file successfully saved at: {json_file_path}")

#         return json_folder, json_filename

#     except Exception as e:
#         logging.error(f"Error processing file: {e}")
#         raise


import pandas as pd
import json
import os
import logging
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
