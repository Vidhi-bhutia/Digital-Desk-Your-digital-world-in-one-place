import React from 'react';
import { MapPin, Sun, Droplets, Wind, Sparkles } from 'lucide-react';

export const WeatherWidget = ({ weatherData }) => {
  const data = weatherData || {
    location: 'Indore, India',
    temperature: 28,
    condition: 'Clear sky',
    feelsLike: 29,
    humidity: '32%',
    windSpeed: '12 km/h',
    airQuality: 'Good',
  };

  return (
    <div
      style={{
        backgroundColor: '#EAF5F0',
        backgroundImage: 'linear-gradient(135deg, #F0F9F5 0%, #D8ECE2 100%)',
        border: '1px solid var(--color-brand-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 24px',
        boxShadow: 'var(--shadow-sm)',
        color: '#0B3B24',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Location */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F5132' }}>
          <MapPin size={16} />
          <span>{data.location}</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>•••</span>
      </div>

      {/* Main Temperature & Weather Sun Graphic */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-heading)', color: '#0B3B24' }}>
            {data.temperature}°<span style={{ fontSize: '28px', fontWeight: 600 }}>C</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#145A32', marginTop: '4px' }}>
            {data.condition}
          </div>
        </div>

        {/* Sun Illustration Graphic */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
          }}
        >
          <Sun size={38} />
        </div>
      </div>

      {/* Weather Stats Grid */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#145A32', marginBottom: '14px' }}>
        Feels like {data.feelsLike}°C
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px 10px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Droplets size={14} color="#3B82F6" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Humidity</div>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>{data.humidity}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px 10px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wind size={14} color="#10B981" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Wind</div>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>{data.windSpeed}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px 10px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#F59E0B" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Air quality</div>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>{data.airQuality}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
