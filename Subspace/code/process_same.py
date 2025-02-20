import pandas as pd
import json
import os
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder
from collections import defaultdict


def preprocess_csv(file_path, output_file):
    try:
        # Load the CSV file
        df = pd.read_csv(file_path)
        id_columns = [
            col for col in df.columns if col.lower() in ["id", "identifier", "ID", "Id"]
        ]
        df = df.drop(columns=id_columns, errors="ignore")

        # Handle missing values (drop rows with NaN or use imputation)
        df = df.dropna()

        # Encode string columns with LabelEncoder
        label_encoders = {}
        for col in df.select_dtypes(include=["object"]).columns:
            label_encoders[col] = LabelEncoder()
            df[col] = label_encoders[col].fit_transform(df[col])

        # Ensure there are at least one numerical column for processing
        numeric_columns = df.select_dtypes(include=["float64", "int64"]).columns
        if len(numeric_columns) < 1:
            raise ValueError("The dataset must have at least one numerical column.")

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


def process_file(file_path, json_folder, json_filename):
    try:
        # Preprocess the CSV file and get numeric columns
        preprocessed_file, numeric_columns = preprocess_csv(
            file_path, "preprocessed.csv"
        )
        df = pd.read_csv(preprocessed_file)

        # Generate incremental subspaces with merged Point_IDs
        subspace_data = {}
        for i in range(1, len(numeric_columns) + 1):  # Incrementally add dimensions
            subspace = numeric_columns[:i]  # Take the first 'i' columns
            subspace_name = "".join(subspace)  # Subspace name (e.g., 'x', 'xy', 'xyz')

            coordinate_map = defaultdict(list)  # Dictionary to group by coordinates
            for _, row in df.iterrows():
                coordinate = tuple(row[dim] for dim in subspace)  # Unique coordinate
                coordinate_map[coordinate].append(row["Point_ID"])  # Collect Point_IDs

            # Construct final subspace data structure
            subspace_data[subspace_name] = [
                {**dict(zip(subspace, coord)), "Point_ID": point_ids}
                for coord, point_ids in coordinate_map.items()
            ]

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
