import React from 'react';

export const LogoMark = ({ size = 36, className = '' }) => {
  return (
    <div
      className={`logo-mark ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <img
        src="/logo.png"
        alt="Digital Desk Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export const LogoFull = ({ size = 36, showTagline = true, className = '' }) => {
  return (
    <div
      className={`logo-full ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
      }}
    >
      <LogoMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: `${Math.max(16, size * 0.58)}px`,
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Digital<span style={{ color: 'var(--color-brand)' }}>Desk</span>
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Your digital world, in one place.
          </span>
        )}
      </div>
    </div>
  );
};

export default LogoFull;
