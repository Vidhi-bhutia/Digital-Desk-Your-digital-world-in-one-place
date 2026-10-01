import React from 'react';

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  action,
  hoverable = false,
  className = '',
  style = {},
  padding = '24px',
}) => {
  return (
    <div
      className={`dd-card ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        transition: hoverable ? 'all var(--transition-normal)' : 'none',
        cursor: hoverable ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style,
      }}
    >
      {(title || subtitle || action) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            {title && (
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div style={{ flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border-subtle)',
            marginTop: 'auto',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
