import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { CloudSun, Wind, Droplets, Search, Loader2, MapPin } from 'lucide-react';

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

export const WeatherWidget: React.FC = () => {
  const [city, setCity] = useState('London');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: WeatherData }>(`/integrations/weather?city=${encodeURIComponent(city)}`);
      return res.data.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
      {/* Top Bar with City Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Weather Forecast</h3>
            <p className="text-xs text-slate-400">Backend Proxy API</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="glass-input text-xs rounded-xl pl-8 pr-3 py-1.5 w-36 focus:w-44 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Fetching weather data...</p>
        </div>
      ) : error || !data ? (
        <div className="text-center py-6 text-xs text-slate-400">
          <p className="text-red-400">Could not retrieve weather for "{city}".</p>
          <button
            onClick={() => { setCity('London'); refetch(); }}
            className="mt-2 text-indigo-400 hover:underline"
          >
            Reset to London
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-bold text-white">{data.city}, {data.country}</span>
              </div>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{data.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                alt={data.condition}
                className="w-14 h-14 filter drop-shadow-md"
              />
              <span className="text-4xl font-extrabold text-white">{data.temp}°C</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
              <p className="text-[11px] font-medium text-slate-400">Feels Like</p>
              <p className="text-sm font-bold text-white mt-0.5">{data.feels_like}°C</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-400">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium text-slate-400">Humidity</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{data.humidity}%</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="flex items-center justify-center space-x-1 text-teal-400">
                <Wind className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium text-slate-400">Wind</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{data.windSpeed} m/s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
