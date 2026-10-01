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
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="28" fill="var(--color-brand)" />
        {/* Layered D surface background curve */}
        <path
          d="M30 25 C30 25, 65 25, 72 45 C78 62, 60 75, 45 75 H30 V25 Z"
          fill="var(--color-brand-light)"
          opacity="0.4"
        />
        {/* Letter D Contour */}
        <path
          d="M30 25 H48 C65 25, 75 38, 75 52 C75 66, 62 75, 45 75 H30 V25 Z"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Organic Leaf Swoosh / Growth path */}
        <path
          d="M35 68 C45 42, 68 35, 72 32"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Focus & Growth Spark */}
        <path
          d="M78 20 L80 26 L86 28 L80 30 L78 36 L76 30 L70 28 L76 26 Z"
          fill="var(--color-accent)"
        />
      </svg>
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
            fontSize: `${size * 0.58}px`,
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
