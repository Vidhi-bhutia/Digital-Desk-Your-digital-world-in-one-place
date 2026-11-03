import React, { useState } from 'react';
import { MapPin, Sun, Droplets, Wind } from 'lucide-react';

export const WeatherWidget = ({ weatherData, onLocate, loading = false, error = '', onSearchCity }) => {
  const [city, setCity] = useState('');
  const data = weatherData;
  return <section style={{ background: 'linear-gradient(135deg,#F0F9F5,#D8ECE2)', border: '1px solid var(--color-brand-light)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)', color: '#0B3B24' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, color: '#0F5132', fontWeight: 700, fontSize: 13 }}><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={16}/>{data?.location || (loading ? 'Loading weather…' : 'Weather')}</span><Sun size={20}/></div>
    <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{loading ? '…' : data ? `${data.temperature}${data.unit || '°C'}` : '—'}</div>
    <div style={{ fontSize: 14, fontWeight: 600, margin: '5px 0 12px' }}>{data?.condition || (error ? 'Weather could not be loaded' : loading ? 'Fetching current conditions' : 'Choose a location to load weather')}</div>
    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{data ? `Feels like ${data.feelsLike}${data.unit || '°C'} · ${data.locationSource === 'manual' ? 'Selected city' : 'Device location'}` : <button onClick={onLocate} disabled={loading} style={{ color: '#145A32', border: 0, background: 'transparent', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Loading…' : 'Use my location'}</button>}</div>
    {error && <div role="status" style={{ fontSize: 12, color: '#9B1C1C', marginBottom: 10 }}>{error}</div>}
    <form onSubmit={e => { e.preventDefault(); if (city.trim()) onSearchCity?.(city.trim()); }} style={{ display: 'flex', gap: 8, marginBottom: 14 }}><input aria-label="Search weather by city" value={city} onChange={e => setCity(e.target.value)} placeholder="Search a city" style={{ minWidth: 0, flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #b7d6c5', background: 'rgba(255,255,255,.65)', color: '#0B3B24' }}/><button disabled={loading || !city.trim()} style={{ padding: '8px 12px', border: 0, borderRadius: 8, color: 'white', background: '#0F5132', cursor: loading || !city.trim() ? 'not-allowed' : 'pointer' }}>Search</button></form>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}><div style={{ background: 'rgba(255,255,255,.6)', padding: 9, borderRadius: 8, display: 'flex', gap: 7, alignItems: 'center' }}><Droplets size={14} color="#3B82F6"/><span style={{ fontSize: 12 }}>Humidity <b>{data?.humidity || '—'}</b></span></div><div style={{ background: 'rgba(255,255,255,.6)', padding: 9, borderRadius: 8, display: 'flex', gap: 7, alignItems: 'center' }}><Wind size={14} color="#10B981"/><span style={{ fontSize: 12 }}>Wind <b>{data?.windSpeed || '—'}</b></span></div></div>
  </section>;
};
export default WeatherWidget;
