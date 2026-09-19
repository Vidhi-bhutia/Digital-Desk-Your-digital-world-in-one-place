import axios from 'axios';

export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

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
  sunrise: string;
  sunset: string;
  location: LocationData;
}

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const weatherCache = new Map<string, CacheEntry<WeatherData>>();
const locationCache = new Map<string, CacheEntry<LocationData>>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const LOCATION_CACHE_TTL_MS = 60 * 60 * 1000;

const getApiKey = (): string => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key is not configured');
  }
  return apiKey;
};

const getCached = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
};

const setCached = <T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl: number): T => {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
  return data;
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<LocationData> => {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = getCached(locationCache, cacheKey);
  if (cached) return cached;

  const res = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
    params: { lat: latitude, lon: longitude, limit: 1, appid: getApiKey() },
  });
  const place = res.data?.[0];
  if (!place) throw new Error('Could not determine a location for these coordinates');

  return setCached(locationCache, cacheKey, {
    city: place.name,
    region: place.state || '',
    country: place.country || '',
    latitude,
    longitude,
  }, LOCATION_CACHE_TTL_MS);
};

export const geocodeCity = async (city: string): Promise<LocationData> => {
  const normalizedCity = city.trim();
  if (!normalizedCity) throw new Error('A city is required');

  const cacheKey = normalizedCity.toLowerCase();
  const cached = getCached(locationCache, cacheKey);
  if (cached) return cached;

  const res = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
    params: { q: normalizedCity, limit: 1, appid: getApiKey() },
  });
  const place = res.data?.[0];
  if (place?.lat == null || place?.lon == null) throw new Error(`City "${normalizedCity}" could not be found`);

  return setCached(locationCache, cacheKey, {
    city: place.name,
    region: place.state || '',
    country: place.country || '',
    latitude: place.lat,
    longitude: place.lon,
  }, LOCATION_CACHE_TTL_MS);
};

export const fetchWeatherData = async (location: LocationData): Promise<WeatherData> => {
  const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
  const cached = getCached(weatherCache, cacheKey);
  if (cached) return cached;

  const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat: location.latitude, lon: location.longitude, units: 'metric', appid: getApiKey() },
  });
  const data = res.data;

  return setCached(weatherCache, cacheKey, {
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
    sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : '',
    sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : '',
    location,
  }, CACHE_TTL_MS);
};
