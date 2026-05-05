import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

def train_model():
    print("Loading dataset...")
    # Load the dataset
    df = pd.read_csv('House_Rent_Dataset.csv.xls')
    
    # We will use these features to predict Rent
    # Note: Using Area Locality with OneHotEncoding would create too many features for a quick model,
    # so we focus on City, BHK, Size, Bathroom, and Furnishing Status.
    features = ['City', 'BHK', 'Size', 'Bathroom', 'Furnishing Status']
    target = 'Rent'
    
    # Preprocess the dataframe to match frontend inputs
    # City: lowercase
    df['City'] = df['City'].str.lower()
    
    # Furnishing Status: map to frontend values
    furnishing_map = {
        'Unfurnished': 'unfurnished',
        'Semi-Furnished': 'semi',
        'Furnished': 'fully'
    }
    df['Furnishing Status'] = df['Furnishing Status'].map(furnishing_map)
    
    # Drop rows with missing values in our features
    df = df.dropna(subset=features + [target])
    
    X = df[features]
    y = df[target]
    
    print("Building model pipeline...")
    # Identify categorical columns that need encoding
    categorical_cols = ['City', 'Furnishing Status']
    
    # Create a preprocessor using OneHotEncoder
    # handle_unknown='ignore' allows the model to handle unseen categories gracefully
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ],
        remainder='passthrough' # Leave numerical columns (BHK, Size, Bathroom) as is
    )
    
    # Create the complete pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    print("Training model (this might take a few seconds)...")
    pipeline.fit(X, y)
    
    # Evaluate briefly on training data just to show it works
    score = pipeline.score(X, y)
    print(f"Model R^2 score on training data: {score:.4f}")
    
    # Save the pipeline
    model_filename = 'rent_model.pkl'
    with open(model_filename, 'wb') as f:
        pickle.dump(pipeline, f)
        
    print(f"Model successfully trained and saved to {model_filename}")

if __name__ == '__main__':
    train_model()
