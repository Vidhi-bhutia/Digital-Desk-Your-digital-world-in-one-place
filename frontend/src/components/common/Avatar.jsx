import React from 'react';

export const Avatar = ({ name = 'User', src = '', size = 36, className = '' }) => {
  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div
      className={`dd-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-brand)',
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${size * 0.4}px`,
        overflow: 'hidden',
        border: '2px solid var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
