import axios from 'axios';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  condition: string;
  description: string;
  icon: string;
  windSpeed: number;
}

export const fetchWeatherData = async (city: string = 'London'): Promise<WeatherData> => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key is not configured');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${apiKey}`;

  const res = await axios.get(url);
  const data = res.data;

  return {
    city: data.name,
    country: data.sys?.country || '',
    temp: Math.round(data.main?.temp ?? 0),
    feels_like: Math.round(data.main?.feels_like ?? 0),
    temp_min: Math.round(data.main?.temp_min ?? 0),
    temp_max: Math.round(data.main?.temp_max ?? 0),
    humidity: data.main?.humidity ?? 0,
    condition: data.weather?.[0]?.main || 'Clear',
    description: data.weather?.[0]?.description || 'Clear sky',
    icon: data.weather?.[0]?.icon || '01d',
    windSpeed: data.wind?.speed ?? 0,
  };
};
