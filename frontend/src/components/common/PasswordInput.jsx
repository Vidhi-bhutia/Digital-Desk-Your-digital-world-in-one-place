import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export const PasswordInput = forwardRef(({
  label = 'Password',
  error,
  helpText,
  id,
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  showStrength = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;

  // Calculate password strength indicator if enabled
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score, label: 'Good', color: '#3B82F6' };
    return { score, label: 'Strong', color: '#10B981' };
  };

  const strength = showStrength ? getStrength(value) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
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
          {showStrength && value && (
            <span style={{ fontSize: '11px', color: strength.color, fontWeight: 700 }}>
              {strength.label}
            </span>
          )}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
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
          <Lock size={18} />
        </div>

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '40px',
            paddingRight: '44px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              style={{
                height: '4px',
                flex: 1,
                borderRadius: '2px',
                backgroundColor: step <= strength.score ? strength.color : 'var(--color-border)',
                transition: 'background-color 200ms ease',
              }}
            />
          ))}
        </div>
      )}

      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </span>
      ) : helpText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{helpText}</span>
      ) : null}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
