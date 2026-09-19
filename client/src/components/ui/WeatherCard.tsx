import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.js';
import { CloudSun, MapPin, Search, X, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  source?: 'current' | 'manual';
}

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  condition: string;
  description: string;
  icon: string;
  windSpeed: number;
  sunrise: string;
  sunset: string;
  location: LocationData;
}

interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  description: string;
  url: string;
}

interface WeatherResponse {
  weather: WeatherData;
  news: NewsItem[] | null;
  newsError: boolean;
}

const LOCATION_KEY = 'digital_desk_user_location';

const formatTime = (value: string) => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--';

export const WeatherCard: React.FC = () => {
  const [savedLocation, setSavedLocation] = useState<LocationData | null>(() => {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as LocationData;
    } catch {
      localStorage.removeItem(LOCATION_KEY);
      return null;
    }
  });
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'ready' | 'unavailable'>(() => savedLocation ? 'ready' : 'requesting');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');

  useEffect(() => {
    if (savedLocation || !navigator.geolocation) {
      if (!savedLocation) setLocationStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSavedLocation({ city: '', region: '', country: '', latitude: position.coords.latitude, longitude: position.coords.longitude, source: 'current' });
        setLocationStatus('ready');
      },
      () => setLocationStatus('unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [savedLocation]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', savedLocation?.latitude, savedLocation?.longitude, savedLocation?.city],
    queryFn: async () => {
      if (!savedLocation) return null;
      const params = savedLocation.city ? { city: savedLocation.city } : { lat: savedLocation.latitude, lon: savedLocation.longitude };
      const res = await api.get<{ success: boolean; data: WeatherResponse }>('/integrations/weather', { params });
      const resolved = res.data.data.weather.location;
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ ...resolved, source: savedLocation.source || 'current' }));
      return res.data.data;
    },
    enabled: locationStatus === 'ready' && !!savedLocation,
    retry: false,
  });

  const handleSaveLocation = (event: React.FormEvent) => {
    event.preventDefault();
    const city = cityInput.trim();
    if (!city) return;
    setLocationStatus('ready');
    setSavedLocation({ city, region: '', country: '', latitude: 0, longitude: 0 });
    setIsModalOpen(false);
    setCityInput('');
  };

  const handleClearLocation = () => {
    setSavedLocation(null);
    setLocationStatus('unavailable');
    localStorage.removeItem(LOCATION_KEY);
  };

  const requestLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSavedLocation({ city: '', region: '', country: '', latitude: position.coords.latitude, longitude: position.coords.longitude, source: 'current' });
        setLocationStatus('ready');
      },
      () => setLocationStatus('unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const showUnavailable = locationStatus === 'unavailable' && !savedLocation;
  const displayLocation = data?.weather.location || savedLocation;

  return (
    <div className="desk-surface p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><CloudSun className="w-4 h-4" /></div>
          <div><h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Around You</h3><p className="text-[11px] text-slate-500 dark:text-slate-400">Local Weather & News</p></div>
        </div>
        {savedLocation && <button onClick={() => setIsModalOpen(true)} className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Change Location</button>}
      </div>

      {locationStatus === 'requesting' && !savedLocation ? (
        <div className="flex flex-col items-center justify-center py-6"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-1" /><p className="text-xs text-slate-400">Requesting your location...</p></div>
      ) : showUnavailable ? (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <MapPin className="w-5 h-5 text-slate-400" /><p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location unavailable</p>
          <div className="flex items-center gap-2"><button onClick={requestLocation} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">Refresh location</button><button onClick={() => setIsModalOpen(true)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">Set location manually</button></div>
        </div>
      ) : isLoading || !data ? (
        <div className="flex flex-col items-center justify-center py-6"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-1" /><p className="text-xs text-slate-400">Loading local weather...</p></div>
      ) : error ? (
        <div className="py-4 text-center space-y-2"><p className="text-xs text-rose-500 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />Unable to load local weather.</p><button onClick={handleClearLocation} className="text-[11px] text-indigo-500 font-medium hover:underline">Clear location</button></div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><div className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /><span className="text-sm font-bold text-slate-900 dark:text-white">{displayLocation?.city}, {displayLocation?.country}</span></div><p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">{data.weather.description}</p></div><div className="flex items-center space-x-2"><img src={`https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`} alt={data.weather.condition} className="w-10 h-10" /><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{data.weather.temp}°C</span></div></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2"><div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center"><p className="text-[10px] text-slate-400">Feels like</p><p className="text-xs font-bold mt-0.5">{data.weather.feels_like}°C</p></div><div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center"><p className="text-[10px] text-slate-400">Humidity</p><p className="text-xs font-bold mt-0.5">{data.weather.humidity}%</p></div><div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center"><p className="text-[10px] text-slate-400">Wind</p><p className="text-xs font-bold mt-0.5">{data.weather.windSpeed}m/s</p></div><div className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-center"><p className="text-[10px] text-slate-400">Sunrise / sunset</p><p className="text-xs font-bold mt-0.5">{formatTime(data.weather.sunrise)}</p><p className="text-[10px] text-slate-400">{formatTime(data.weather.sunset)}</p></div></div>
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3"><div className="flex items-center justify-between mb-2"><h4 className="text-xs font-bold uppercase tracking-wider">Local News</h4>{data.news && data.news.length > 0 && <span className="text-[10px] text-slate-400">Development preview</span>}</div>{data.newsError || !data.news ? <p className="text-xs text-slate-500 dark:text-slate-400">Local news temporarily unavailable.</p> : data.news.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-400">No local headlines found.</p> : <div className="space-y-2">{data.news.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="block group"><p className="text-xs font-semibold group-hover:text-indigo-500 line-clamp-2">{item.title}</p><p className="text-[10px] text-slate-400 mt-0.5">{item.source} · {new Date(item.publishedAt).toLocaleDateString()}</p>{item.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>}<ExternalLink className="inline w-3 h-3 ml-1 text-slate-400" /></a>)}</div>}</div>
        </div>
      )}

      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"><div className="desk-surface p-6 rounded-3xl max-w-sm w-full bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"><div className="flex items-center justify-between"><h4 className="text-sm font-bold">Set Your Location</h4><button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button></div><form onSubmit={handleSaveLocation} className="space-y-3"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="text" required placeholder="Search for a city" value={cityInput} onChange={(event) => setCityInput(event.target.value)} className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs" /></div><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-xl text-xs">Cancel</button><button type="submit" className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Search City</button></div></form></div></div>}
    </div>
  );
};
