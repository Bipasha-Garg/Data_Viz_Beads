# import numpy as np
# import pandas as pd

# # Set random seed for reproducibility
# np.random.seed(42)

# # Define dimensions and number of points
# num_features = 9
# num_points = 950

# # Generate random features between 0 and 1
# X = np.random.rand(num_points, num_features)

# # Generate random labels (0 or 1)
# y = np.random.randint(0, 5, size=(num_points, 1))

# # Combine features and labels
# data = np.hstack((X, y))

# # Create a DataFrame
# columns = [f"Feature_{i+1}" for i in range(num_features)] + ["Label"]
# df = pd.DataFrame(data, columns=columns)

# # Display the first few rows
# print(df.head())

# # Optionally, save to CSV
# df.to_csv("synthetic_dataset.csv", index=False)

import numpy as np
import pandas as pd

np.random.seed(42)

num_features = 20
num_points = 128

# Generate random features with normal distribution, clipped between 0 and 1
X = np.clip(0.5 + 0.15 * np.random.randn(num_points, num_features), 0, 1)

# Generate random labels between 0 and 4
y = np.random.randint(0, 4, size=(num_points, 1))

# Combine features and labels
data = np.hstack((X, y))

columns = [f"Feature_{i+1}" for i in range(num_features)] + ["Label"]
df = pd.DataFrame(data, columns=columns)

print(df.head())

df.to_csv("synthetic_dataset.csv", index=False)
