
# import pandas as pd
# import json
# import os
# import logging
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.neighbors import KNeighborsClassifier
# from collections import defaultdict
# import numpy as np


# # Custom JSON encoder to handle NumPy types
# class NpEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, np.integer):
#             return int(obj)
#         if isinstance(obj, np.floating):
#             return float(obj)
#         if isinstance(obj, np.ndarray):
#             return obj.tolist()
#         return super(NpEncoder, self).default(obj)


# def preprocess_csv(file_path, output_file):
#     try:
#         df = pd.read_csv(file_path)
#         id_columns = [col for col in df.columns if col.lower() in ["id", "identifier"]]
#         df = df.drop(columns=id_columns, errors="ignore")
#         df = df.dropna()

#         label_column = df.columns[-1]
#         feature_columns = df.columns[:-1]
#         numeric_columns = (
#             df[feature_columns]
#             .select_dtypes(include=["float64", "int64"])
#             .columns.tolist()
#         )

#         if len(numeric_columns) < 1:
#             raise ValueError("The dataset must have at least one numerical column.")

#         variances = df[numeric_columns].var().sort_values().index.tolist()

#         scaler = MinMaxScaler(feature_range=(-1, 1))
#         df[numeric_columns] = scaler.fit_transform(df[numeric_columns])

#         # Handle categorical labels
#         if df[label_column].dtype == "object":
#             label_mapping = {
#                 label: idx for idx, label in enumerate(df[label_column].unique())
#             }
#             df["original_label"] = df[label_column]
#             df[label_column] = df[label_column].map(label_mapping)
#         else:
#             df["original_label"] = df[label_column]

#         df["Point_ID"] = range(len(df))

#         df.to_csv(output_file, index=False)
#         logging.debug(f"Preprocessed data saved to {output_file}")

#         return output_file, variances, df

#     except Exception as e:
#         logging.error(f"Error during preprocessing: {e}")
#         raise


# def process_file(file_path, json_folder, json_filename, cluster_file, parallel_file):
#     try:
#         preprocessed_file, sorted_columns, df = preprocess_csv(
#             file_path, "preprocessed.csv"
#         )
#         label_column = df.columns[-3]  # Adjusted for original_label and Point_ID

#         # Prepare data for KNN
#         X = df[sorted_columns].values
#         y = df[label_column].values

#         # Apply KNN
#         knn = KNeighborsClassifier(n_neighbors=5)
#         knn.fit(X, y)
#         knn_predictions = knn.predict(X)

#         # Create classification data file
#         classification_data = {
#             "points": [],
#             "predictions": knn_predictions.tolist(),  # Convert NumPy array to list
#             "actual_labels": y.tolist(),  # Convert NumPy array to list
#             "label_mapping": {},
#         }

#         # Store label mapping if categorical
#         if "original_label" in df.columns and df["original_label"].dtype == "object":
#             classification_data["label_mapping"] = {
#                 str(idx): label
#                 for label, idx in dict(
#                     zip(
#                         df["original_label"].unique(),
#                         range(len(df["original_label"].unique())),
#                     )
#                 ).items()
#             }

#         # Populate classification data
#         for idx, row in df.iterrows():
#             predicted_label = (
#                 knn_predictions[idx]
#                 if df[label_column].dtype != "object"
#                 else classification_data["label_mapping"][str(knn_predictions[idx])]
#             )
#             point_data = {
#                 "Point_ID": int(row["Point_ID"]),  # Ensure native int
#                 "features": {
#                     col: float(row[col]) for col in sorted_columns
#                 },  # Ensure native float
#                 "actual_label": row["original_label"],
#                 "predicted_label": predicted_label,
#             }
#             classification_data["points"].append(point_data)

#         # Create parallel coordinates data
#         parallel_data = {"dimensions": sorted_columns, "data": []}
#         for idx, row in df.iterrows():
#             predicted_label = (
#                 knn_predictions[idx]
#                 if df[label_column].dtype != "object"
#                 else classification_data["label_mapping"][str(knn_predictions[idx])]
#             )
#             point_data = {
#                 "Point_ID": int(row["Point_ID"]),  # Ensure native int
#                 "values": {
#                     col: float(row[col]) for col in sorted_columns
#                 },  # Ensure native float
#                 "label": row["original_label"],
#                 "prediction": predicted_label,
#             }
#             parallel_data["data"].append(point_data)

#         # Original label mapping
#         label_map = defaultdict(list)
#         for _, row in df.iterrows():
#             label_map[row["original_label"]].append(int(row["Point_ID"]))

#         # Original subspace data
#         subspace_data = {}
#         for i in range(1, len(sorted_columns) + 1):
#             subspace = sorted_columns[:i]
#             subspace_name = "_".join(subspace)

#             coordinate_map = defaultdict(list)
#             for _, row in df.iterrows():
#                 coordinate = tuple(
#                     float(row[dim]) for dim in subspace
#                 )  # Ensure native float
#                 coordinate_map[coordinate].append(
#                     int(row["Point_ID"])
#                 )  # Ensure native int

#             subspace_data[subspace_name] = [
#                 {**dict(zip(subspace, coord)), "Point_ID": point_ids}
#                 for coord, point_ids in coordinate_map.items()
#             ]

#         # Create output directory if it doesn't exist
#         if not os.path.exists(json_folder):
#             os.makedirs(json_folder)

#         # Save all JSON files with custom encoder
#         json_file_path = os.path.join(json_folder, json_filename)
#         with open(json_file_path, "w") as json_file:
#             json.dump(subspace_data, json_file, indent=4, cls=NpEncoder)

#         labels_file_path = os.path.join(json_folder, "labels_file.json")
#         with open(labels_file_path, "w") as labels_file:
#             json.dump({"labels": dict(label_map)}, labels_file, indent=4, cls=NpEncoder)

#         classification_file_path = os.path.join(json_folder, "classification.json")
#         with open(classification_file_path, "w") as class_file:
#             json.dump(classification_data, class_file, indent=4, cls=NpEncoder)

#         parallel_file_path = os.path.join(json_folder, "parallel.json")
#         with open(parallel_file_path, "w") as parallel_file:
#             json.dump(parallel_data, parallel_file, indent=4, cls=NpEncoder)

#         logging.debug(
#             f"JSON files successfully saved at: {json_file_path}, "
#             f"{labels_file_path}, {classification_file_path}, {parallel_file_path}"
#         )
#         return (
#             json_folder,
#             json_filename,
#             labels_file_path,
#             classification_file_path,
#             parallel_file_path,
#         )

#     except Exception as e:
#         logging.error(f"Error processing file: {e}")
#         raise


import pandas as pd
import json
import os
import logging
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import KNeighborsClassifier
from collections import defaultdict
import numpy as np


# Custom JSON encoder to handle NumPy types
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)


# Gini index computation
def compute_gini_index(feature, labels, bins=10):
    """Compute Gini index of a feature relative to labels."""
    df = pd.DataFrame({"feature": feature, "label": labels})
    df["feature_bin"] = pd.qcut(df["feature"], q=bins, duplicates="drop")

    gini_total = 0.0
    for bin_value, group in df.groupby("feature_bin"):
        size = len(group)
        if size == 0:
            continue
        label_counts = group["label"].value_counts()
        gini = 1.0 - sum((count / size) ** 2 for count in label_counts)
        gini_total += (size / len(df)) * gini

    return gini_total


# Preprocessing function
def preprocess_csv(file_path, output_file):
    try:
        df = pd.read_csv(file_path)
        id_columns = [col for col in df.columns if col.lower() in ["id", "identifier"]]
        df = df.drop(columns=id_columns, errors="ignore")
        df = df.dropna()

        label_column = df.columns[-1]
        feature_columns = df.columns[:-1]
        numeric_columns = (
            df[feature_columns]
            .select_dtypes(include=["float64", "int64"])
            .columns.tolist()
        )

        if len(numeric_columns) < 1:
            raise ValueError("The dataset must have at least one numerical column.")

        scaler = MinMaxScaler(feature_range=(-1, 1))
        df[numeric_columns] = scaler.fit_transform(df[numeric_columns])

        # Handle categorical labels
        if df[label_column].dtype == "object":
            label_mapping = {
                label: idx for idx, label in enumerate(df[label_column].unique())
            }
            df["original_label"] = df[label_column]
            df[label_column] = df[label_column].map(label_mapping)
        else:
            df["original_label"] = df[label_column]

        # Compute Gini Index for feature ordering
        gini_scores = {
            col: compute_gini_index(df[col], df[label_column])
            for col in numeric_columns
        }
        sorted_columns = sorted(gini_scores, key=lambda x: gini_scores[x])

        df["Point_ID"] = range(len(df))

        df.to_csv(output_file, index=False)
        logging.debug(f"Preprocessed data saved to {output_file}")

        return output_file, sorted_columns, df

    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise


# Main processing function
def process_file(file_path, json_folder, json_filename, cluster_file, parallel_file):
    try:
        preprocessed_file, sorted_columns, df = preprocess_csv(
            file_path, "preprocessed.csv"
        )
        label_column = df.columns[-3]  # Adjusted for original_label and Point_ID

        # Prepare data for KNN
        X = df[sorted_columns].values
        y = df[label_column].values

        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(X, y)
        knn_predictions = knn.predict(X)

        # Create classification data
        classification_data = {
            "points": [],
            "predictions": knn_predictions.tolist(),
            "actual_labels": y.tolist(),
            "label_mapping": {},
        }

        if "original_label" in df.columns and df["original_label"].dtype == "object":
            classification_data["label_mapping"] = {
                str(idx): label
                for label, idx in dict(
                    zip(
                        df["original_label"].unique(),
                        range(len(df["original_label"].unique())),
                    )
                ).items()
            }

        for idx, row in df.iterrows():
            predicted_label = (
                knn_predictions[idx]
                if df[label_column].dtype != "object"
                else classification_data["label_mapping"].get(
                    str(knn_predictions[idx]), knn_predictions[idx]
                )
            )
            point_data = {
                "Point_ID": int(row["Point_ID"]),
                "features": {col: float(row[col]) for col in sorted_columns},
                "actual_label": row["original_label"],
                "predicted_label": predicted_label,
            }
            classification_data["points"].append(point_data)

        # Create parallel coordinates data
        parallel_data = {"dimensions": sorted_columns, "data": []}
        for idx, row in df.iterrows():
            predicted_label = (
                knn_predictions[idx]
                if df[label_column].dtype != "object"
                else classification_data["label_mapping"].get(
                    str(knn_predictions[idx]), knn_predictions[idx]
                )
            )
            point_data = {
                "Point_ID": int(row["Point_ID"]),
                "values": {col: float(row[col]) for col in sorted_columns},
                "label": row["original_label"],
                "prediction": predicted_label,
            }
            parallel_data["data"].append(point_data)

        # Original label mapping
        label_map = defaultdict(list)
        for _, row in df.iterrows():
            label_map[row["original_label"]].append(int(row["Point_ID"]))

        # Subspace data
        subspace_data = {}
        for i in range(1, len(sorted_columns) + 1):
            subspace = sorted_columns[:i]
            subspace_name = "_".join(subspace)

            coordinate_map = defaultdict(list)
            for _, row in df.iterrows():
                coordinate = tuple(float(row[dim]) for dim in subspace)
                coordinate_map[coordinate].append(int(row["Point_ID"]))

            subspace_data[subspace_name] = [
                {**dict(zip(subspace, coord)), "Point_ID": point_ids}
                for coord, point_ids in coordinate_map.items()
            ]

        # Create output directory if not exists
        if not os.path.exists(json_folder):
            os.makedirs(json_folder)

        # Save JSON files
        json_file_path = os.path.join(json_folder, json_filename)
        with open(json_file_path, "w") as json_file:
            json.dump(subspace_data, json_file, indent=4, cls=NpEncoder)

        labels_file_path = os.path.join(json_folder, "labels_file.json")
        with open(labels_file_path, "w") as labels_file:
            json.dump({"labels": dict(label_map)}, labels_file, indent=4, cls=NpEncoder)

        classification_file_path = os.path.join(json_folder, "classification.json")
        with open(classification_file_path, "w") as class_file:
            json.dump(classification_data, class_file, indent=4, cls=NpEncoder)

        parallel_file_path = os.path.join(json_folder, "parallel.json")
        with open(parallel_file_path, "w") as parallel_file:
            json.dump(parallel_data, parallel_file, indent=4, cls=NpEncoder)

        logging.debug(
            f"JSON files successfully saved at: {json_file_path}, "
            f"{labels_file_path}, {classification_file_path}, {parallel_file_path}"
        )
        return (
            json_folder,
            json_filename,
            labels_file_path,
            classification_file_path,
            parallel_file_path,
        )

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise
