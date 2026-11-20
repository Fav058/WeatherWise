const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const form = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const searchButton = document.querySelector('#search-button');
const statusMessage = document.querySelector('#status');
const locationResults = document.querySelector('#location-results');
const weatherSelection = document.querySelector('#weather-section');
const filterSelect = document.querySelector('#day-filter');
const sortSelect = document.querySelector('#sort-order');

let forecastDays = [];
const weatherDescriptions = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Heavy freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow shower', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm'
};

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('error', isError);
}

function safeNumber(value, digits = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : '-';
}

function describeWeather(code) {
    return weatherDescriptions[code] || 'Conditions unavailable';
}

function placeName(place) {
    return [place.name, place.admin1, place.country].filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(', ');
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = cityInput.value.trim();
    if (query.length < 2) {
        setStatus('Type at least two characters to search.', true);
        return;
    }
    await searchLocations(query);
});

async function searchLocations(query) {
    setBusy(true);
    weatherSelection.hidden = true; 
    locationResults.replaceChildren();
    setStatus('Searching for locations...');

    try{
        const url = new URL(GEOCODING_URL);
        url.search = new URLSearchParams({ name: query, count: '6', language: 'en', format: 'json' }) .toString();
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Location search failed (HTTP ${response.status}). `);
        const data = await response.json();
        const places = Array.isArray(data.results) ? data.results : []; 

        if (!places.length) {
            setStatus('No matching places found. Try a different spelling or add a country.', true);
            return;
        }
        setStatus(`Found ${places.length} location${places.length === 1 ? '' : 's'}. choose one:`);
        places.forEach((place) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'location-option';
            const label = document.createElement('span');
            label.textContent = placeName(place);
            const choose = document.createElement('span');
            choose.textContent = 'View forecast ->';
            button.append(label, choose);
            button.addEventListener('click', () => loadWeather(place));
            locationResults.append(button);
        })
    } catch (error) {
        setStatus(`${error.message} Check your internet connection and try again.`, true);
    } finally {
        setBusy(false);
    }
}


async function loadWeather(place) {
    locationResults.replaceChildren();
    setStatus(`Loading weather for ${place.name}...`);
    setBusy(true);

    try {
        const url = new URL(FORECAST_URL);
        url.search = new URLSearchParams({
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
            forecast_days: '5',
            timezone: 'auto'
        }).toString();

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather request failed (HTTP ${response.status}).`);
        const data = await response.json();
        if (!data.current || !data.daily || !Array.isArray(data.daily.time)) {
            throw new Error('The weather service returned an incomplete response');
        }

        renderWeather(place, data);
        setStatus('Weather loaded. Search again whenever you want to compare another city.');
        weatherSelection.hidden = false;
    } catch (error) {
        setStatus(`${error.message} Please choose the location again or try later.`, true);
    } finally {
        setBusy(false);
    }
}


function renderWeather(place, data) {
    const current = data.current;
    const locationTitle = document.querySelector('#location-title');
    locationTitle.textContent = placeName(place);
    document.querySelector('#current-temp').textContent = safeNumber(current.temperature_2m);
    document.querySelector('#current-description').textContent = describeWeather(current.weather_code);
    document.querySelector('#feels-like').textContent = `${safeNumber(current.apparent_temperature)}°C`;
    document.querySelector('#wind-speed').textContent = `${safeNumber(current.wind_speed_10m)} km/h`;
    document.querySelector('#current-rain').textContent = `${safeNumber(current.precipitation)} mm`;
    document.querySelector('#weather-badge').textContent = describeWeather(current.weather_code);
    document.querySelector('#updated-at').textContent = `Current conditions at ${current.time || 'the latest available time'} (${data.timezone || 'local time'})`;
    forecastDays = data.daily.time.map((date, index) => ({
        date,
        code: data.daily.weather_code?.[index],
        high: data.daily.temperature_2m_max?.[index],
        low: data.daily.temperature_2m_min?.[index],
        rain: data.daily.precipitation_probability_max?.[index],
        wind: data.daily.wind_speed_10m_max?.[index]
    }));
    renderForecast();
}

function renderForecast() {
    const list = document.querySelector('#forecast-list');
    list.replaceChildren();
    const filter = filterSelect.value;
    const sort = sortSelect.value;
    let visibleDays = [...forecastDays];

    if (filter === 'dry') {
        visibleDays = visibleDays.filter((day) => Number.isFinite(Number(day.rain)) && Number(day.rain) < 30);
    }
    if (sort === 'warmest') visibleDays.sort((a, b) => Number(b.high) - Number(a.high));
    if (sort === 'coolest') visibleDays.sort((a, b) => Number(a.low) - Number(b.low));

    document.querySelector('#forecast-count').textContent = `${visibleDays.length} of ${forecastDays.length} forecast days shown.`;
    if (!visibleDays.length) {
        const message = document.createElement('p');
        message.className = 'muted';
        message.textContent = 'No days match this filter. Try "All days".';
        list.append(message);
        return;
    }

    visibleDays.forEach((day) => {
        const card = document.createElement('article');
        card.className = 'forecast-card';
        const date = new Date(`${day.date}T12:00:00`);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
        const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        card.append(
            forecastCell(dayName, dateLabel, 'forecast-day'),
            forecastCell('CONDITION', describeWeather(day.code)),
            forecastCell('HIGH / LOW', `${safeNumber(day.high)}° / ${safeNumber(day.low)}°`),
            forecastCell('RAIN CHANCE', `${safeNumber(day.rain)}%`),
            forecastCell('MAX WIND', `${safeNumber(day.wind)} km/h`)
        );
        list.append(card);
    });
}

function forecastCell(label, value, className = 'forecast-item') {
    const element = document.createElement('div');
    element.className = className;

    if (className === 'forecast-day') {
        element.textContent = label;
        const date = document.createElement('span');
        date.className = 'forecast-date';
        date.textContent = value;
        element.append(date);
    } else {
        const heading = document.createElement('span');
        heading.className = 'forecast-label';
        heading.textContent = label;
        const content = document.createElement('strong');
        content.textContent = value;
        element.append(heading, content);
    }

    return element;
}

function setBusy(isBusy) {
    searchButton.disabled = isBusy;
    searchButton.textContent = isBusy ? 'Loading...' : 'Search';
}

filterSelect.addEventListener('change', renderForecast);
sortSelect.addEventListener('change', renderForecast);