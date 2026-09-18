import { Request, Response, NextFunction } from 'express';
import { fetchWeatherData } from '../services/weatherService';

export const getWeather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const city = typeof req.query.city === 'string' ? req.query.city : 'London';
    const data = await fetchWeatherData(city);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch weather data',
    });
  }
};
