// OpenWeatherMap API Key (Free tier)
const API_KEY = 'b6fd43953d13a92a9bed7c32b88ff024';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const detailsGrid = document.getElementById('detailsGrid');

// Event Listeners
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather(cityInput.value);
});
locationBtn.addEventListener('click', getLocationWeather);

// Initialize with default city
window.addEventListener('load', () => searchWeather('London'));

// Get weather by city name
async function searchWeather(city) {
    if (!city.trim()) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();
        const response = await fetch(
            `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        showError(error.message);
    }
}

// Get weather by geolocation
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                showError('Unable to access your location');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(lat, lon);
    } catch (error) {
        showError('Unable to fetch weather data');
    }
}

// Get 5-day forecast
async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const { name, main, weather, wind, clouds, sys, visibility } = data;

    const weatherIcon = getWeatherIcon(weather[0].main);
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    currentWeatherDiv.innerHTML = `
        <div class="weather-header">
            <div class="weather-icon">${weatherIcon}</div>
            <div class="weather-info">
                <h2>${name}</h2>
                <p class="weather-description">${weather[0].description}</p>
            </div>
        </div>
        <div class="temperature">${Math.round(main.temp)}°C</div>
        <div class="weather-details">
            <div class="weather-detail-item">
                <span>🌡️ Feels Like: ${Math.round(main.feels_like)}°C</span>
            </div>
            <div class="weather-detail-item">
                <span>💨 Wind: ${(wind.speed * 3.6).toFixed(1)} km/h</span>
            </div>
            <div class="weather-detail-item">
                <span>☁️ Clouds: ${clouds.all}%</span>
            </div>
            <div class="weather-detail-item">
                <span>👁️ Visibility: ${(visibility / 1000).toFixed(1)} km</span>
            </div>
            <div class="weather-detail-item">
                <span>🌅 Sunrise: ${sunrise}</span>
            </div>
            <div class="weather-detail-item">
                <span>🌇 Sunset: ${sunset}</span>
            </div>
        </div>
    `;

    // Update details grid
    document.getElementById('feelsLike').textContent = Math.round(main.feels_like) + '°C';
    document.getElementById('humidity').textContent = main.humidity + '%';
    document.getElementById('windSpeed').textContent = (wind.speed * 3.6).toFixed(1) + ' km/h';
    document.getElementById('pressure').textContent = main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1) + ' km';

    // Update city input
    cityInput.value = name;
}

// Display 5-day forecast
function displayForecast(forecastList) {
    const dailyForecasts = {};

    // Group forecasts by day
    forecastList.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = [];
        }
        dailyForecasts[day].push(item);
    });

    // Display next 5 days
    forecastContainer.innerHTML = '';
    let count = 0;

    for (const [day, forecasts] of Object.entries(dailyForecasts)) {
        if (count >= 5) break;

        // Get average values for the day
        const temps = forecasts.map(f => f.main.temp);
        const avgTemp = Math.round(temps.reduce((a, b) => a + b) / temps.length);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        // Get most common weather
        const weathers = forecasts.map(f => f.weather[0].main);
        const mainWeather = weathers.sort((a, b) =>
            weathers.filter(x => x === a).length - weathers.filter(x => x === b).length
        ).pop();

        const forecast = forecasts[0];
        const icon = getWeatherIcon(mainWeather);

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${avgTemp}°C</div>
            <div class="forecast-temp-range">${minTemp}° - ${maxTemp}°</div>
            <div class="forecast-description">${mainWeather.toLowerCase()}</div>
        `;

        forecastContainer.appendChild(forecastCard);
        count++;
    }
}

// Get weather emoji based on condition
function getWeatherIcon(weatherMain) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🏜️',
        'Ash': '🌋',
        'Squall': '💨',
        'Tornado': '🌪️'
    };

    return icons[weatherMain] || '🌤️';
}

// Show loading state
function showLoading() {
    currentWeatherDiv.innerHTML = '<div class="loading">Loading weather data...</div>';
    forecastContainer.innerHTML = '<div class="loading">Loading forecast data...</div>';
}

// Show error message
function showError(message) {
    currentWeatherDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
    forecastContainer.innerHTML = '';
}