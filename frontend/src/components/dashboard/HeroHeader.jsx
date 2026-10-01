import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const HeroHeader = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div
      className="dd-hero-header"
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        backgroundColor: '#EBF4EC',
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                          linear-gradient(180deg, #F3F8F4 0%, #E2EFE5 100%)`,
        border: '1px solid var(--color-brand-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '130px',
      }}
    >
      {/* Mountain Landscape Decorative Illustration SVG Background */}
      <svg
        viewBox="0 0 800 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          height: '100%',
          width: 'auto',
          maxHeight: '180px',
          opacity: 0.28,
          pointerEvents: 'none',
        }}
      >
        {/* Soft Sun */}
        <circle cx="700" cy="50" r="30" fill="#F59E0B" opacity="0.6" />
        {/* Far Mountains */}
        <path d="M400 200 L550 80 L680 180 L800 100 L800 200 Z" fill="#0F5132" opacity="0.4" />
        {/* Near Pine Hills */}
        <path d="M300 200 L420 120 L520 200 Z" fill="#145A32" opacity="0.6" />
        <path d="M500 200 L620 110 L740 200 Z" fill="#0B3B24" opacity="0.7" />
      </svg>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 800,
            color: '#0B3B24',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          {getGreeting()},{' '}
          <span style={{ color: 'var(--color-brand)', fontWeight: 800 }}>
            {userName}
          </span>
        </h1>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-brand-hover)', marginBottom: '4px' }}>
          {getFormattedDate()}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Here's what's happening across your digital world.
        </p>
      </div>
    </div>
  );
};

export default HeroHeader;
