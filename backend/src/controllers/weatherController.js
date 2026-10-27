const config = require('../config/env');

const getWeather = async (req, res) => {
  const { lat, lon, city } = req.query;
  if (!config.openWeatherApiKey) return res.status(503).json({ success: false, message: 'OpenWeather is not configured. Set OPENWEATHER_API_KEY on the backend.' });
  if ((!lat || !lon) && !city) return res.status(400).json({ success: false, message: 'Provide device coordinates or a manually selected city.' });
  if ((lat && !Number.isFinite(Number(lat))) || (lon && !Number.isFinite(Number(lon)))) return res.status(400).json({ success: false, message: 'Coordinates are invalid.' });
  try {
    const query = lat && lon ? `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}` : `q=${encodeURIComponent(city)}`;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${encodeURIComponent(config.openWeatherApiKey)}`, { signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status === 401 ? 503 : response.status === 404 ? 404 : 502).json({ success: false, message: response.status === 401 ? 'OpenWeather rejected the configured API key.' : data.message || `OpenWeather request failed (${response.status}).` });
    return res.json({ success: true, location: `${data.name}, ${data.sys.country}`, locationSource: lat && lon ? 'device' : 'manual', temperature: Math.round(data.main.temp), unit: '°C', condition: data.weather?.[0]?.description || '', feelsLike: Math.round(data.main.feels_like), humidity: `${data.main.humidity}%`, windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`, updatedAt: new Date().toISOString(), isLive: true });
  } catch (error) { return res.status(502).json({ success: false, message: error.name === 'TimeoutError' ? 'Weather request timed out.' : 'Unable to reach OpenWeather.' }); }
};

module.exports = { getWeather };
