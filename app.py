from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes so the frontend can make requests

# Load the trained model pipeline
try:
    with open('rent_model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Model file 'rent_model.pkl' not found. Please run model_trainer.py first.")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Please train the model first.'}), 500

    try:
        data = request.json
        
        # Extract features from frontend JSON
        # The frontend JS sends: city, area, size, bhk, bathrooms, furnishing
        city = data.get('city', '').lower()
        bhk = int(data.get('bhk', 0))
        size = int(data.get('size', 0))
        bathroom = int(data.get('bathrooms', 0))
        furnishing = data.get('furnishing', '')
        
        # The model expects ['City', 'BHK', 'Size', 'Bathroom', 'Furnishing Status']
        input_df = pd.DataFrame([{
            'City': city,
            'BHK': bhk,
            'Size': size,
            'Bathroom': bathroom,
            'Furnishing Status': furnishing
        }])
        
        # Predict using the loaded pipeline
        predicted_rent = model.predict(input_df)[0]
        
        # Return exact value and bounds for the UI
        return jsonify({
            'exact': float(predicted_rent),
            'minBound': float(predicted_rent * 0.9),
            'maxBound': float(predicted_rent * 1.1)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
