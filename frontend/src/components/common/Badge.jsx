import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const getBadgeStyle = () => {
    let bg = 'var(--color-surface-hover)';
    let color = 'var(--color-text)';
    let border = '1px solid var(--color-border)';

    if (variant === 'brand') {
      bg = 'var(--color-brand-subtle)';
      color = 'var(--color-brand)';
      border = '1px solid var(--color-brand-light)';
    } else if (variant === 'success') {
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      border = '1px solid var(--color-success-border)';
    } else if (variant === 'warning') {
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      border = '1px solid var(--color-warning-border)';
    } else if (variant === 'danger') {
      bg = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      border = '1px solid var(--color-danger-border)';
    } else if (variant === 'info') {
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      border = '1px solid #BFDBFE';
    }

    const padding = size === 'sm' ? '2px 8px' : '4px 12px';
    const fontSize = size === 'sm' ? '11px' : '12px';

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding,
      fontSize,
      fontWeight: 600,
      borderRadius: 'var(--radius-full)',
      backgroundColor: bg,
      color,
      border,
      whiteSpace: 'nowrap',
    };
  };

  return <span style={getBadgeStyle()} className={`dd-badge ${className}`}>{children}</span>;
};

export default Badge;
