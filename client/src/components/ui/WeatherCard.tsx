import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.js';
import { CloudSun, MapPin, Search, X, Loader2, AlertCircle } from 'lucide-react';

interface WeatherData {
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

export const WeatherCard: React.FC = () => {
  const [userLocation, setUserLocation] = useState<string | null>(() => {
    return localStorage.getItem('digital_desk_user_location') || null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', userLocation],
    queryFn: async () => {
      if (!userLocation) return null;
      const res = await api.get<{ success: boolean; data: WeatherData }>(
        `/integrations/weather?city=${encodeURIComponent(userLocation)}`
      );
      return res.data.data;
    },
    enabled: !!userLocation,
    retry: false,
  });

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      const formatted = cityInput.trim();
      setUserLocation(formatted);
      localStorage.setItem('digital_desk_user_location', formatted);
      setIsModalOpen(false);
      setCityInput('');
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    localStorage.removeItem('digital_desk_user_location');
  };

  return (
    <div className="desk-surface p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Around You</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Local Weather & Condition</p>
          </div>
        </div>

        {userLocation && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Change Location
          </button>
        )}
      </div>

      {/* Case 1: Location Unavailable */}
      {!userLocation ? (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location unavailable</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
              Set your city to view live local weather and conditions.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Set location
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-1" />
          <p className="text-xs text-slate-400">Loading weather for {userLocation}...</p>
        </div>
      ) : error || !data ? (
        <div className="py-4 text-center space-y-2">
          <p className="text-xs text-rose-500 flex items-center justify-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Could not fetch weather for "{userLocation}".</span>
          </p>
          <button
            onClick={handleClearLocation}
            className="text-[11px] text-indigo-500 font-medium hover:underline"
          >
            Reset location
          </button>
        </div>
      ) : (
        /* Case 2: Weather Loaded Successfully */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {data.city}, {data.country}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {data.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <img
                src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                alt={data.condition}
                className="w-10 h-10 filter drop-shadow-xs"
              />
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {data.temp}°C
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Feels like</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.feels_like}°C</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Humidity</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.humidity}%</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Wind</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.windSpeed}m/s</p>
            </div>
          </div>
        </div>
      )}

      {/* Set Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="desk-surface p-6 rounded-3xl max-w-sm w-full bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Set Your Location</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  City Name
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, Tokyo, Berlin"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
