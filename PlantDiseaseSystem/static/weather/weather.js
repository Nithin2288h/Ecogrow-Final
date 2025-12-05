// Weather API Configuration
const apiKey = 'e58c3c5c39ebeba6515b7043ebe15635'; // Replace this with your actual API key
const defaultCity = 'Madurai';

// Weather icons mapping
const weatherIcons = {
    'Clear': 'fa-sun',
    'Clouds': 'fa-cloud',
    'Rain': 'fa-cloud-rain',
    'Drizzle': 'fa-cloud-rain',
    'Thunderstorm': 'fa-bolt',
    'Snow': 'fa-snowflake',
    'Mist': 'fa-smog',
    'Smoke': 'fa-smog',
    'Haze': 'fa-smog',
    'Dust': 'fa-smog',
    'Fog': 'fa-smog',
    'Sand': 'fa-smog',
    'Ash': 'fa-smog',
    'Squall': 'fa-wind',
    'Tornado': 'fa-wind'
};

// Get weather icon class
function getWeatherIcon(condition) {
    return weatherIcons[condition] || 'fa-cloud';
}

// Initialize DOM Elements after the document has loaded
let searchInput, searchButton, locationElement, tempElement, conditionsElement, weatherDetails, forecastContainer, dateElement;

document.addEventListener('DOMContentLoaded', () => {
    // Use header search bar
    searchInput = document.querySelector('.header-search-bar input');
    searchButton = document.querySelector('.header-search-bar button');
    locationElement = document.querySelector('.location');
    tempElement = document.querySelector('.temperature');
    conditionsElement = document.querySelector('.condition');
    weatherDetails = document.querySelectorAll('.weather-details .card span');
    forecastContainer = document.querySelector('.forecast-grid');
    dateElement = document.querySelector('.date span');

    // Debug logging function
    function log(message) {
        console.log(`Weather App: ${message}`);
    }

    // Fetch weather data
    async function getWeatherData(cityName = defaultCity) {
        try {
            log(`Fetching weather data for ${cityName}`);
            
            // Current weather API call
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;
            const response = await fetch(weatherUrl);
            if (!response.ok) {
                throw new Error(`Weather API Error: ${response.status}`);
            }
            
            const data = await response.json();
            updateCurrentWeather(data);
            
            // Fetch 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error(`Forecast API Error: ${forecastResponse.status}`);
            }
            
            const forecastData = await forecastResponse.json();
            updateForecast(forecastData);
            
        } catch (error) {
            log(`Error: ${error.message}`);
            alert('Error fetching weather data. Please try again.');
        }
    }

    // Update current weather display
    function updateCurrentWeather(data) {
        locationElement.textContent = `${data.name}, ${data.sys.country}`;
        tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        conditionsElement.textContent = data.weather[0].main;
        
        // Update date
        const now = new Date();
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
        
        // Update weather details
        const details = [
            `${data.main.pressure} hPa`,
            `${data.main.humidity}%`,
            `${(data.wind.speed * 3.6).toFixed(2)} km/h`,
            `${Math.round(data.main.feels_like)}°C`
        ];
        
        weatherDetails.forEach((element, index) => {
            if (details[index]) {
                element.textContent = details[index];
            }
        });
    }

    // Update 5-day forecast
    function updateForecast(data) {
        // Clear existing forecast
        forecastContainer.innerHTML = '';
        
        // Process the forecast data to get daily forecasts
        const dailyForecasts = new Map();
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString();
            
            if (!dailyForecasts.has(day)) {
                dailyForecasts.set(day, item);
            }
        });
        
        // Convert Map to Array and take first 5 days
        const forecasts = Array.from(dailyForecasts.values()).slice(0, 5);
        
        forecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const weatherCondition = day.weather[0].main;
            const iconClass = getWeatherIcon(weatherCondition);
            
            const forecastDay = document.createElement('div');
            forecastDay.className = 'day';
            forecastDay.innerHTML = `
                <p class="weekday">${dayName}</p>
                <i class="fas ${iconClass}"></i>
                <p class="temp">${Math.round(day.main.temp)}°C</p>
                <p class="condition">${weatherCondition}</p>
            `;
            
            forecastContainer.appendChild(forecastDay);
        });
    }

    // Search functionality
    function searchLocation() {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }

    // Event listeners for header search bar
    searchButton.addEventListener('click', searchLocation);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });

    // Initialize weather data
    log('Weather app initialized');
    getWeatherData(defaultCity);
});