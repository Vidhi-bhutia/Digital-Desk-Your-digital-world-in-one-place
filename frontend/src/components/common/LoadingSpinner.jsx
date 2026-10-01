import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = '', fullScreen = false }) => {
  const pixelSize = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          border: '3px solid var(--color-brand-light)',
          borderTopColor: 'var(--color-brand)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {message && (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
