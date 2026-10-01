import React from 'react';
import { Layers } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Layers,
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div
      className={`dd-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-brand-subtle)',
          color: 'var(--color-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
