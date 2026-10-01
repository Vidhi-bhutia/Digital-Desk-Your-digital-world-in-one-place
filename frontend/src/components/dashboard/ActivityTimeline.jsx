import React from 'react';
import { Github, Mail, Calendar, CheckSquare, ArrowRight } from 'lucide-react';

export const ActivityTimeline = ({ activities = [], onNavigate }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'github': return <Github size={16} color="#0F172A" />;
      case 'gmail': return <Mail size={16} color="#EA4335" />;
      case 'calendar': return <Calendar size={16} color="#3B82F6" />;
      case 'task': return <CheckSquare size={16} color="#10B981" />;
      default: return <Github size={16} />;
    }
  };

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
          Today's Activity
        </h3>
        <button
          onClick={() => onNavigate && onNavigate('/activity')}
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
          View all <ArrowRight size={14} />
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        What's been happening across your digital world.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, position: 'relative' }}>
        {activities.map((item, idx) => (
          <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', minWidth: '45px' }}>
              {item.time}
            </span>

            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getIcon(item.type)}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.detail}
              </div>
            </div>

            <span style={{ color: 'var(--color-text-subtle)', fontSize: '14px' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
