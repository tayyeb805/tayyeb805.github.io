
const FALLBACK_DATA = {
    current: {
        name: "Islamabad",
        sys: { country: "PK" },
        weather: [{ description: "Partly cloudy", icon: "03d" }],
        main: {
            temp: 18,
            feels_like: 16,
            humidity: 65,
            pressure: 1012
        },
        wind: { speed: 3.6 }
    },
    forecast: {
        list: [
            // 5 days of sample data
            { dt: Date.now()/1000 + 86400, weather: [{icon: "01d"}], main: {temp: 20} },
            { dt: Date.now()/1000 + 172800, weather: [{icon: "02d"}], main: {temp: 19} },
            { dt: Date.now()/1000 + 259200, weather: [{icon: "03d"}], main: {temp: 17} },
            { dt: Date.now()/1000 + 345600, weather: [{icon: "09d"}], main: {temp: 16} },
            { dt: Date.now()/1000 + 432000, weather: [{icon: "13d"}], main: {temp: 12} }
        ]
    }
};


function init() {
    updateCurrentDate();
    
    // Event listeners
    searchBtn.addEventListener('click', searchWeather);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchWeather();
    });
    
    locationBtn.addEventListener('click', getLocationWeather);
    celsiusBtn.addEventListener('click', () => switchUnit('metric'));
    fahrenheitBtn.addEventListener('click', () => switchUnit('imperial'));
    
    // Use fallback data if API fails
    try {
        getLocationWeather();
    } catch (e) {
        console.log("Using fallback data due to:", e);
        updateCurrentWeather(FALLBACK_DATA.current);
        updateForecast(FALLBACK_DATA.forecast);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // DOM Elements
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const celsiusBtn = document.getElementById('celsius-btn');
    const fahrenheitBtn = document.getElementById('fahrenheit-btn');
    
    const cityName = document.getElementById('city-name');
    const currentDate = document.getElementById('current-date');
    const weatherIcon = document.getElementById('weather-icon');
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-description');
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const pressure = document.getElementById('pressure');
    const forecastItems = document.getElementById('forecast-items');
    
    // Weather Icons Mapping
    const weatherIcons = {
        '01d': 'fas fa-sun',           // clear sky (day)
        '01n': 'fas fa-moon',          // clear sky (night)
        '02d': 'fas fa-cloud-sun',     // few clouds (day)
        '02n': 'fas fa-cloud-moon',    // few clouds (night)
        '03d': 'fas fa-cloud',         // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',         // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',    // shower rain
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',// rain (day)
        '10n': 'fas fa-cloud-moon-rain',// rain (night)
        '11d': 'fas fa-bolt',          // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',     // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',         // mist
        '50n': 'fas fa-smog'
    };
    
 
    const API_KEY = '22d317f328cce3355f7b49f2a2a976aa'; 
    let currentUnit = 'metric'; // Default to Celsius
    
    // Initialize the app
    function init() {
        updateCurrentDate();
        
        // Event listeners
        searchBtn.addEventListener('click', searchWeather);
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchWeather();
        });
        
        locationBtn.addEventListener('click', getLocationWeather);
        celsiusBtn.addEventListener('click', () => switchUnit('metric'));
        fahrenheitBtn.addEventListener('click', () => switchUnit('imperial'));
        
        // Try to get weather for user's location by default
        try {
            getLocationWeather();
        } catch (e) {
            console.log("Using fallback data due to:", e);
            updateCurrentWeather(FALLBACK_DATA.current);
            updateForecast(FALLBACK_DATA.forecast);
        }
    }
    
    // Update current date display
    function updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = new Date().toLocaleDateString('en-US', options);
    }
    
    // Search weather by location name
    function searchWeather() {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeatherByLocation(location);
        } else {
            showError('Please enter a location');
        }
    }
    
    // Get weather for user's current location
    function getLocationWeather() {
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                error => {
                    hideLoading();
                    console.error('Geolocation error:', error);
                    showError('Unable to retrieve your location. Showing default weather.');
                    updateCurrentWeather(FALLBACK_DATA.current);
                    updateForecast(FALLBACK_DATA.forecast);
                },
                { timeout: 10000 } // 10 second timeout
            );
        } else {
            showError('Geolocation not supported. Showing default weather.');
            updateCurrentWeather(FALLBACK_DATA.current);
            updateForecast(FALLBACK_DATA.forecast);
        }
    }
    
    // Fetch weather by location name
    function fetchWeatherByLocation(location) {
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            showError('API key not configured. Using sample data.');
            updateCurrentWeather(FALLBACK_DATA.current);
            updateForecast(FALLBACK_DATA.forecast);
            return;
        }
        
        showLoading();
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${currentUnit}&appid=${API_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status === 404 ? 'Location not found' : 'Weather service unavailable');
                }
                return response.json();
            })
            .then(data => {
                if (data.cod && data.cod !== 200) {
                    throw new Error(data.message || 'Failed to get weather data');
                }
                updateCurrentWeather(data);
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${currentUnit}&appid=${API_KEY}`);
            })
            .then(response => {
                if (!response.ok) throw new Error('Forecast data unavailable');
                return response.json();
            })
            .then(data => {
                updateForecast(data);
                hideLoading();
            })
            .catch(error => {
                hideLoading();
                console.error('Error:', error);
                showError(error.message || 'Unable to retrieve weather data. Using sample data.');
                updateCurrentWeather(FALLBACK_DATA.current);
                updateForecast(FALLBACK_DATA.forecast);
            });
    }
    
    // Fetch weather by coordinates
    function fetchWeatherByCoords(lat, lon) {
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            showError('API key not configured. Using sample data.');
            updateCurrentWeather(FALLBACK_DATA.current);
            updateForecast(FALLBACK_DATA.forecast);
            return;
        }
        
        showLoading();
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`)
            .then(response => {
                if (!response.ok) throw new Error('Weather service unavailable');
                return response.json();
            })
            .then(data => {
                if (data.cod && data.cod !== 200) {
                    throw new Error(data.message || 'Failed to get weather data');
                }
                updateCurrentWeather(data);
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`);
            })
            .then(response => {
                if (!response.ok) throw new Error('Forecast data unavailable');
                return response.json();
            })
            .then(data => {
                updateForecast(data);
                hideLoading();
            })
            .catch(error => {
                hideLoading();
                console.error('Error:', error);
                showError(error.message || 'Unable to retrieve weather data. Using sample data.');
                updateCurrentWeather(FALLBACK_DATA.current);
                updateForecast(FALLBACK_DATA.forecast);
            });
    }
    
    // Update current weather display
    function updateCurrentWeather(data) {
        cityName.textContent = `${data.name}, ${data.sys?.country || ''}`.trim();
        
        const weather = data.weather[0];
        const temp = Math.round(data.main.temp);
        const feelsLikeTemp = Math.round(data.main.feels_like);
        
        weatherIcon.className = weatherIcons[weather.icon] || 'fas fa-question';
        currentTemp.textContent = temp;
        weatherDesc.textContent = weather.description;
        feelsLike.textContent = `${feelsLikeTemp}°`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = currentUnit === 'metric' 
            ? `${Math.round(data.wind.speed * 3.6)} km/h`
            : `${Math.round(data.wind.speed)} mph`;
        pressure.textContent = `${data.main.pressure} hPa`;
    }
    
    // Update forecast display
    function updateForecast(data) {
        forecastItems.innerHTML = '';
        
        // Get daily forecasts
        const dailyForecasts = [];
        const days = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!days[day]) {
                days[day] = true;
                dailyForecasts.push({
                    day,
                    icon: item.weather[0].icon,
                    temp: Math.round(item.main.temp)
                });
                
                if (dailyForecasts.length >= 5) return;
            }
        });
        
        dailyForecasts.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-icon">
                    <i class="${weatherIcons[day.icon] || 'fas fa-question'}"></i>
                </div>
                <div class="forecast-temp">
                    <span>${day.temp}°</span>
                </div>
            `;
            
            forecastItems.appendChild(forecastItem);
        });
    }
    
    // Switch between Celsius and Fahrenheit
    function switchUnit(unit) {
        if (currentUnit === unit) return;
        
        currentUnit = unit;
        
        if (unit === 'metric') {
            celsiusBtn.classList.add('active');
            fahrenheitBtn.classList.remove('active');
        } else {
            fahrenheitBtn.classList.add('active');
            celsiusBtn.classList.remove('active');
        }
        
        // Refresh weather data with new unit
        if (cityName.textContent !== '--') {
            const location = cityName.textContent.split(',')[0].trim();
            if (location) fetchWeatherByLocation(location);
        }
    }
    
   

    
    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        let userMessage = message;
        if (message.includes("404")) userMessage = "Location not found. Please try another city.";
        if (message.includes("401")) userMessage = "Invalid API key. Please contact support.";
        if (message.includes("429")) userMessage = "Too many requests. Please wait a minute.";
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${userMessage}</span>
        `;
        
        const weatherContent = document.querySelector('.weather-content');
        if (weatherContent) {
            const existingError = weatherContent.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            weatherContent.prepend(errorDiv);
            errorDiv.style.display = 'flex';
            
            setTimeout(() => {
                errorDiv.style.opacity = '0';
                setTimeout(() => errorDiv.remove(), 500);
            }, 5000);
        }
    }
    
    // Initialize the app
    init();
});