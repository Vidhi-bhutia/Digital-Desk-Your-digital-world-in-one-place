import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ id, message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="var(--color-success)" />;
      case 'error': return <AlertCircle size={18} color="var(--color-danger)" />;
      case 'warning': return <AlertTriangle size={18} color="var(--color-warning)" />;
      default: return <Info size={18} color="var(--color-info)" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      default: return 'var(--color-brand)';
    }
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
        borderLeft: `4px solid ${getBorderColor()}`,
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 500,
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <div>{getIcon()}</div>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
