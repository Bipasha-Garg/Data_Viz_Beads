import numpy as np
import pandas as pd

# Set fixed x-coordinate
x_fixed = 10

# Generate 100 random y and z coordinates
y_values = np.random.uniform(-20, 50, 100)  # Range for y values
z_values = np.random.uniform(-20, 50, 100)  # Range for z values

# Create DataFrame
df = pd.DataFrame({"X": x_fixed, "Y": y_values, "Z": z_values})

# Save to CSV
df.to_csv("3d_dataset.csv", index=False)

print(df.head())  # Preview first few rows
