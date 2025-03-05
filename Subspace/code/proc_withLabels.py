import pandas as pd
import json
import os
import logging
from sklearn.preprocessing import MinMaxScaler
from collections import defaultdict

def preprocess_csv(file_path, output_file):
    try:
        df = pd.read_csv(file_path)

        # Remove ID column(s) - case insensitive check
        id_columns = [col for col in df.columns if col.lower() in ["id", "identifier"]]
        df = df.drop(columns=id_columns, errors="ignore")

        # Drop rows with missing values
        df = df.dropna()

        # Ensure last column is the label (assuming categorical)
        label_column = df.columns[-1]  # The last column
        feature_columns = df.columns[:-1]  # All columns except the last one

        # Filter only numeric feature columns
        numeric_columns = (
            df[feature_columns]
            .select_dtypes(include=["float64", "int64"])
            .columns.tolist()
        )

        # Ensure all 4 dimensions are included (SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm)
        if len(numeric_columns) < 1:
            raise ValueError("The dataset must have at least one numerical column.")

        # Sort features by variance
        variances = df[numeric_columns].var().sort_values().index.tolist()

        # Normalize numeric values
        scaler = MinMaxScaler(feature_range=(-1, 1))
        df[numeric_columns] = scaler.fit_transform(df[numeric_columns])

        # Add a unique identifier for points
        df["Point_ID"] = range(len(df))

        # Save processed CSV
        df.to_csv(output_file, index=False)
        logging.debug(f"Preprocessed data saved to {output_file}")

        return output_file, variances, df

    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise

def process_file(file_path, json_folder, json_filename):
    try:
        preprocessed_file, sorted_columns, df = preprocess_csv(
            file_path, "preprocessed.csv"
        )
        label_column = df.columns[-2]

        label_map = defaultdict(list)
        for _, row in df.iterrows():
            label_map[row[label_column]].append(int(row["Point_ID"]))

        subspace_data = {}
        for i in range(1, len(sorted_columns) + 1):
            subspace = sorted_columns[:i]
            subspace_name = "_".join(subspace)

            coordinate_map = defaultdict(list)
            for _, row in df.iterrows():
                coordinate = tuple(row[dim] for dim in subspace)
                coordinate_map[coordinate].append(int(row["Point_ID"]))

            subspace_data[subspace_name] = [
                {**dict(zip(subspace, coord)), "Point_ID": point_ids}
                for coord, point_ids in coordinate_map.items()
            ]

        if not os.path.exists(json_folder):
            os.makedirs(json_folder)

        json_file_path = os.path.join(json_folder, json_filename)
        with open(json_file_path, "w") as json_file:
            json.dump(subspace_data, json_file, indent=4)

        labels_file_path = os.path.join(json_folder, "labels_file.json")
        with open(labels_file_path, "w") as labels_file:
            json.dump({"labels": dict(label_map)}, labels_file, indent=4)

        logging.debug(
            f"JSON files successfully saved at: {json_file_path} and {labels_file_path}"
        )
        return json_folder, json_filename, labels_file_path

    except Exception as e:
        logging.error(f"Error processing file: {e}")
        raise
