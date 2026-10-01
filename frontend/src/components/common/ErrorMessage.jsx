import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      className={`dd-error-message ${className}`}
      style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-danger-bg)',
        border: '1px solid var(--color-danger-border)',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        margin: '12px 0',
      }}
    >
      <div style={{ color: 'var(--color-danger)', marginTop: '2px' }}>
        <AlertTriangle size={24} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--color-danger)' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          {message}
        </p>

        {onRetry && (
          <div style={{ marginTop: '12px' }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
