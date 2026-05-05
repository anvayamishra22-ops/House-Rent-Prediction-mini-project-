document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const predictBtn = document.getElementById('predict-btn');
    const btnIcon = predictBtn.querySelector('i');
    
    // Result Elements
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultContent = document.getElementById('result-content');
    const predictedPriceEl = document.getElementById('predicted-price');
    const priceRangeEl = document.getElementById('price-range');
    const resLocationEl = document.getElementById('res-location');

    // Chart Instance
    let marketChart = null;

    // Initialize an empty chart
    initChart();

    // Dataset integration for areas
    const citySelect = document.getElementById('city');
    const areaSelect = document.getElementById('area');
    let cityToAreasMap = {};

    // Load CSV Data
    Papa.parse('House_Rent_Dataset.csv.xls', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;
            data.forEach(row => {
                const city = row['City'];
                const area = row['Area Locality'];
                if (city && area) {
                    const normalizedCity = city.toLowerCase();
                    if (!cityToAreasMap[normalizedCity]) {
                        cityToAreasMap[normalizedCity] = new Set();
                    }
                    cityToAreasMap[normalizedCity].add(area);
                }
            });
            console.log("Dataset loaded. Area mappings ready.");
        }
    });

    citySelect.addEventListener('change', (e) => {
        const selectedCity = e.target.value.toLowerCase();
        areaSelect.innerHTML = '<option value="" disabled selected>Select an area...</option>';
        
        if (cityToAreasMap[selectedCity]) {
            const areas = Array.from(cityToAreasMap[selectedCity]).sort();
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                areaSelect.appendChild(option);
            });
            areaSelect.disabled = false;
        } else {
            areaSelect.disabled = true;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Gather Data
        const formData = {
            city: document.getElementById('city').value,
            area: document.getElementById('area').value,
            size: parseInt(document.getElementById('size').value),
            bhk: parseInt(document.getElementById('bhk').value),
            bathrooms: parseInt(document.getElementById('bathrooms').value),
            furnishing: document.getElementById('furnishing').value
        };

        // 2. UI Loading State
        predictBtn.classList.add('loading');
        btnIcon.classList.remove('ph-arrow-right');
        btnIcon.classList.add('ph-spinner');
        
        // Hide previous results if any
        resultContent.classList.add('hidden');
        resultPlaceholder.classList.remove('hidden');

        // Make API call to our new Flask backend
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(prediction => {
            if (prediction.error) {
                console.error('Error from server:', prediction.error);
                alert('An error occurred during prediction: ' + prediction.error);
            } else {
                // 3. Update UI
                updateResultsUI(formData, prediction);
                updateChart(formData.city, prediction.exact);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            alert('Could not connect to the backend server. Is it running?');
        })
        .finally(() => {
            // Reset Button
            predictBtn.classList.remove('loading');
            btnIcon.classList.remove('ph-spinner');
            btnIcon.classList.add('ph-arrow-right');
        });
    });



    function updateResultsUI(data, prediction) {
        // Swap visibility
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');

        // Update Location Text
        const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);
        resLocationEl.textContent = `${data.area}, ${capitalize(data.city)}`;

        // Update Range
        priceRangeEl.textContent = `₹${prediction.minBound.toLocaleString('en-IN')} - ₹${prediction.maxBound.toLocaleString('en-IN')}`;

        // Number Counter Animation
        animateValue(predictedPriceEl, 0, prediction.exact, 1000);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function for smoother stop
            const easeOutV = progress * (2 - progress); 
            
            const currentVal = Math.floor(easeOutV * (end - start) + start);
            obj.innerHTML = currentVal.toLocaleString('en-IN');
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function initChart() {
        const ctx = document.getElementById('marketChart').getContext('2d');
        
        // Gradient for chart area
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        marketChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['6m ago', '5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Now'],
                datasets: [{
                    label: 'Avg Rent Trend (₹)',
                    data: [22000, 22500, 23000, 22800, 24000, 24500, 25000], // Mock initial data
                    borderColor: '#4f46e5',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
                    },
                    y: {
                        border: { display: false },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
                    }
                }
            }
        });
    }

    function updateChart(city, currentPrice) {
        // Generate mock historical data based on the calculated current price
        // Assuming a slightly increasing trend usually
        const dataPoints = [];
        let val = currentPrice * 0.85; // start 15% lower 6 months ago

        for (let i = 0; i < 6; i++) {
            // Random fluctuation upwards
            val += (currentPrice - val) * 0.2 + (Math.random() * 1000 - 500);
            dataPoints.push(Math.round(val));
        }
        dataPoints.push(Math.round(currentPrice)); // Last point is the current prediction

        marketChart.data.datasets[0].data = dataPoints;
        marketChart.data.datasets[0].label = `Avg Trend in ${city[0].toUpperCase() + city.slice(1)}`;
        marketChart.update();
    }
});
