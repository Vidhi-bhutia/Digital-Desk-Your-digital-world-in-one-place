import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helpText,
  icon: Icon = null,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  containerStyle = {},
  ...props
}, ref) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`input-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </span>
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: Icon ? '40px' : '14px',
            paddingRight: '14px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
          {...props}
        />
      </div>

      {error ? (
        <span
          id={`${inputId}-error`}
          style={{
            fontSize: '12px',
            color: 'var(--color-danger)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {error}
        </span>
      ) : helpText ? (
        <span
          id={`${inputId}-help`}
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          {helpText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
