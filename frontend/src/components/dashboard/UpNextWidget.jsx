import React from 'react';
import { Calendar, CheckSquare, ArrowRight, Video } from 'lucide-react';

export const UpNextWidget = ({ events = [], onNavigate }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
          Up Next
        </h3>
        <button
          onClick={() => onNavigate && onNavigate('/calendar')}
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-brand)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View calendar <ArrowRight size={14} />
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        Your upcoming events and tasks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {events.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', minWidth: '60px', marginTop: '2px' }}>
              {item.time}
            </span>

            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.type === 'meeting' ? '#EF4444' : '#10B981',
                marginTop: '6px',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.type === 'meeting' ? (
                  <Video size={16} color="#3B82F6" />
                ) : (
                  <CheckSquare size={16} color="#10B981" />
                )}
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {item.title}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', marginLeft: '24px' }}>
                {item.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpNextWidget;
