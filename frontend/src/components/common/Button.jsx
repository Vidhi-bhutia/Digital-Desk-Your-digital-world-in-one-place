import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon: Icon = null,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  const getStyles = () => {
    let bg = 'var(--color-brand)';
    let color = '#FFFFFF';
    let border = '1px solid transparent';
    let hoverBg = 'var(--color-brand-hover)';

    if (variant === 'secondary') {
      bg = 'var(--color-brand-subtle)';
      color = 'var(--color-brand)';
      border = '1px solid var(--color-brand-light)';
      hoverBg = 'var(--color-brand-light)';
    } else if (variant === 'outline') {
      bg = 'transparent';
      color = 'var(--color-text)';
      border = '1px solid var(--color-border)';
      hoverBg = 'var(--color-surface-hover)';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      color = 'var(--color-text)';
      border = '1px solid transparent';
      hoverBg = 'var(--color-surface-hover)';
    } else if (variant === 'danger') {
      bg = 'var(--color-danger)';
      color = '#FFFFFF';
      border = '1px solid transparent';
      hoverBg = '#DC2626';
    }

    let padding = '10px 20px';
    let fontSize = '14px';
    let height = '42px';

    if (size === 'sm') {
      padding = '6px 12px';
      fontSize = '13px';
      height = '34px';
    } else if (size === 'lg') {
      padding = '14px 28px';
      fontSize = '16px';
      height = '50px';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding,
      fontSize,
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: bg,
      color,
      border,
      height,
      width: fullWidth ? '100%' : 'auto',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.65 : 1,
      transition: 'all var(--transition-fast)',
      boxShadow: variant === 'primary' ? 'var(--shadow-sm)' : 'none',
      outline: 'none',
      ...style,
    };
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={getStyles()}
      className={`dd-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
