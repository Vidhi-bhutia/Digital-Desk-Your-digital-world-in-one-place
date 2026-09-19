import { Request, Response, NextFunction } from 'express';
import { fetchWeatherData, geocodeCity, reverseGeocode } from '../services/weatherService';
import { fetchLocalNews } from '../services/newsService';

export const getWeather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lon);
    let location;

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates');
      }
      location = await reverseGeocode(latitude, longitude);
    } else if (typeof req.query.city === 'string' && req.query.city.trim()) {
      location = await geocodeCity(req.query.city);
    } else {
      res.status(400).json({ success: false, message: 'Coordinates or a city is required' });
      return;
    }

    const weather = await fetchWeatherData(location);
    let news = null;
    let newsError = false;
    try {
      news = await fetchLocalNews(location.city);
    } catch {
      newsError = true;
    }

    res.status(200).json({ success: true, data: { weather, news, newsError } });
  } catch (error: any) {
    const status = error.response?.status === 429 ? 429 : 400;
    res.status(status).json({ success: false, message: error.response?.data?.message || error.message || 'Failed to fetch location weather' });
  }
};
