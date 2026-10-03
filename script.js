const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");

const cityNameEl = document.getElementById("cityName");
const dateEl = document.getElementById("date");
const weatherIconEl = document.getElementById("weatherIcon");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");

const windSpeedEl = document.getElementById("windSpeed");
const humidityEl = document.getElementById("humidity");
const feelsLikeEl = document.getElementById("feelsLike");
const visibilityEl = document.getElementById("visibility");

function getWeatherDetails(code, isDay) {
  const timeChar = isDay ? "d" : "n";
  if (code === 0) return { desc: isDay ? "পরিষ্কার ও রৌদ্রোজ্জ্বল" : "পরিষ্কার রাত", icon: `01${timeChar}` };
  if (code >= 1 && code <= 2) return { desc: "আংশিক মেঘলা আকাশ", icon: `02${timeChar}` };
  if (code === 3) return { desc: "ঘন মেঘলা আকাশ", icon: `04${timeChar}` };
  if (code === 45 || code === 48) return { desc: "কুয়াশাচ্ছন্ন আবহাওয়া", icon: `50${timeChar}` };
  if (code >= 51 && code <= 55) return { desc: "হালকা গুঁড়ি গুঁড়ি বৃষ্টি", icon: `09${timeChar}` };
  if (code >= 61 && code <= 65) return { desc: "বৃষ্টিপাত হচ্ছে", icon: `10${timeChar}` };
  if (code >= 80 && code <= 82) return { desc: "ভারী বৃষ্টি ও বর্ষণ", icon: `10${timeChar}` };
  if (code >= 95) return { desc: "বজ্রসহ তীব্র ঝড়-বৃষ্টি", icon: `11${timeChar}` };
  return { desc: "স্বাভাবিক আবহাওয়া", icon: `03${timeChar}` };
}

function getBanglaDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return new Date().toLocaleDateString('bn-BD', options);
}

async function fetchWeather(city) {
  if (!city) return;
  errorMsg.style.display = "none";
  searchBtn.innerText = "খোঁজা হচ্ছে...";

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.style.display = "block";
      searchBtn.innerText = "অনুসন্ধান";
      return;
    }

    const { latitude, longitude, name, country_code } = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    const weatherInfo = getWeatherDetails(current.weather_code, current.is_day);

    cityNameEl.innerText = `${name}, ${country_code ? country_code.toUpperCase() : 'BD'}`;
    dateEl.innerText = getBanglaDate();
    tempEl.innerText = Math.round(current.temperature_2m);
    conditionEl.innerText = weatherInfo.desc;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${weatherInfo.icon}@4x.png`;

    windSpeedEl.innerText = `${current.wind_speed_10m} km/h`;
    humidityEl.innerText = `${current.relative_humidity_2m}%`;
    feelsLikeEl.innerText = `${Math.round(current.apparent_temperature)}°C`;
    visibilityEl.innerText = `${Math.round(current.surface_pressure)} hPa`;
  } catch (error) {
    errorMsg.innerText = "⚠️ সংযোগ পরীক্ষা করে আবার চেষ্টা করুন!";
    errorMsg.style.display = "block";
  } finally {
    searchBtn.innerText = "অনুসন্ধান";
  }
}

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value.trim()));
cityInput.addEventListener("keypress", (e) => { if (e.key === "Enter") fetchWeather(cityInput.value.trim()); });
window.addEventListener("DOMContentLoaded", () => fetchWeather("Kurigram"));
