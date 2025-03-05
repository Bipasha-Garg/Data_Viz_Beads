import pandas as pd
import json
import os
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder
from collections import defaultdict


def preprocess_csv(file_path, output_file):
    try:
        df = pd.read_csv(file_path)
        id_columns = [
            col for col in df.columns if col.lower() in ["id", "identifier", "ID", "Id"]
        ]
        df = df.drop(columns=id_columns, errors="ignore")

        df = df.dropna()

        label_encoders = {}
        for col in df.select_dtypes(include=["object"]).columns:
            label_encoders[col] = LabelEncoder()
            df[col] = label_encoders[col].fit_transform(df[col])

        numeric_columns = df.select_dtypes(include=["float64", "int64"]).columns
        if len(numeric_columns) < 1:
            raise ValueError("The dataset must have at least one numerical column.")

        scaler = StandardScaler()
        df[numeric_columns] = scaler.fit_transform(df[numeric_columns])

        df["Point_ID"] = range(len(df))

        df.to_csv(output_file, index=False)
        logging.debug(f"Preprocessed data saved to {output_file}")
        return output_file, numeric_columns

    except Exception as e:
        logging.error(f"Error during preprocessing: {e}")
        raise


def process_file(file_path, json_folder, json_filename):
    try:

        preprocessed_file, numeric_columns = preprocess_csv(
            file_path, "preprocessed.csv"
        )
        df = pd.read_csv(preprocessed_file)

        subspace_data = {}
        for i in range(1, len(numeric_columns) + 1):
            subspace = numeric_columns[:i]
            subspace_name = "".join(subspace)

            coordinate_map = defaultdict(list)
            for _, row in df.iterrows():
                coordinate = tuple(row[dim] for dim in subspace)
                coordinate_map[coordinate].append(row["Point_ID"])

            subspace_data[subspace_name] = [
                {**dict(zip(subspace, coord)), "Point_ID": point_ids}
                for coord, point_ids in coordinate_map.items()
            ]

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
