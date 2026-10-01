const config = require('../config/env');
const logger = require('../utils/logger');

const getWeather = async (req, res) => {
  const city = req.query.city || 'Indore, India';
  const apiKey = config.openWeatherApiKey;

  // Check if real OpenWeather API key is configured
  if (apiKey && !apiKey.includes('placeholder') && !apiKey.includes('your_')) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.split(',')[0])}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          location: `${data.name}, ${data.sys.country}`,
          temperature: Math.round(data.main.temp),
          unit: '°C',
          condition: data.weather[0]?.main || 'Clear sky',
          feelsLike: Math.round(data.main.feels_like),
          humidity: `${data.main.humidity}%`,
          windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
          airQuality: 'Good',
          updatedAt: new Date().toISOString(),
          isLive: true,
        });
      }
    } catch (err) {
      logger.warn('OpenWeather API request failed, serving default weather data:', err.message);
    }
  }

  // Graceful formatted fallback weather data
  return res.status(200).json({
    success: true,
    location: city,
    temperature: 28,
    unit: '°C',
    condition: 'Clear sky',
    feelsLike: 29,
    humidity: '32%',
    windSpeed: '12 km/h',
    airQuality: 'Good',
    updatedAt: new Date().toISOString(),
    isLive: false,
  });
};

module.exports = { getWeather };
