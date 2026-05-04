# RentIQ - AI-Powered Rental Price Estimator

RentIQ is a modern, data-driven web application designed to help users estimate house rental prices based on property features. Built with an attractive glassmorphism UI, it provides a seamless user experience for property owners and tenants alike.

## Features

- **Dynamic Data Loading**: Uses the `House_Rent_Dataset.csv.xls` to dynamically populate the "Area/Location" dropdown based on the user's selected City.
- **Smart Prediction Interface**: Simulates an AI-driven prediction model to calculate a fair rental value, including a price range and confidence score based on input parameters (City, Area, Size, BHK, Bathrooms, Furnishing).
- **Market Insights**: Visualizes local market trends using an interactive line chart.
- **Premium UI/UX**: Features a responsive, animated, and modern design utilizing glassmorphism and custom CSS.

## Technologies Used

- **HTML5 & CSS3**: For the structure and styling of the application.
- **Vanilla JavaScript**: Handles all the dynamic logic, event listeners, and simulated prediction algorithms.
- **[PapaParse](https://www.papaparse.com/)**: Used to parse the local CSV dataset directly in the browser to populate location data.
- **[Chart.js](https://www.chartjs.org/)**: Renders the Market Insights trend chart.
- **[Phosphor Icons](https://phosphoricons.com/)**: Provides clean, modern iconography used throughout the app.

## Project Structure

- `index.html`: The main entry point containing the layout and structure.
- `style.css`: Contains all custom styling, color tokens, and animations.
- `script.js`: The core logic handling form submission, dataset parsing, dynamic UI updates, and the Chart.js instance.
- `House_Rent_Dataset.csv.xls`: The raw dataset used for extracting City and Area mappings.

## How to Run

Because this project loads a local CSV file via JavaScript, it is best run using a local web server to avoid CORS (Cross-Origin Resource Sharing) restrictions in modern browsers.

1. Navigate to the project directory in your terminal.
2. Start a local server. If you have Python installed, you can run:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
   *Alternatively, if using VS Code, you can use the "Live Server" extension.*

## Future Scope

- Integrate a Python backend (e.g., Flask/FastAPI) to train and serve a real Machine Learning model (like Random Forest or Linear Regression) on the provided dataset.
- Expand data visualization to show average rent distributions for specific areas.
