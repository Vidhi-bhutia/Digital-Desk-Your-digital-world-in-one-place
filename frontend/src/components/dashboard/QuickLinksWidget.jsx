import React from 'react';
import { Mail, Github, Calendar, Link2, ArrowUpRight } from 'lucide-react';

export const QuickLinksWidget = ({ onNavigate }) => {
  const links = [
    {
      name: 'Gmail',
      actionText: 'Open →',
      icon: Mail,
      isGmail: true,
      path: 'https://mail.google.com',
      external: true,
    },
    {
      name: 'GitHub',
      actionText: 'Open →',
      icon: Github,
      path: 'https://github.com',
      external: true,
    },
    {
      name: 'Google Calendar',
      actionText: 'Open →',
      icon: Calendar,
      path: 'https://calendar.google.com',
      external: true,
    },
    {
      name: 'Integrations',
      actionText: 'Manage →',
      icon: Link2,
      path: '/integrations',
      external: false,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>
        Quick Links
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <div
              key={idx}
              onClick={() => {
                if (link.external) {
                  window.open(link.path, '_blank');
                } else if (onNavigate) {
                  onNavigate(link.path);
                }
              }}
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {link.isGmail ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1.5 18.5V5.5C1.5 4.39543 2.39543 3.5 3.5 3.5H20.5C21.6046 3.5 22.5 4.39543 22.5 5.5V18.5C22.5 19.6046 21.6046 20.5 20.5 20.5H3.5C2.39543 20.5 1.5 19.6046 1.5 18.5Z" stroke="#EF4444" strokeWidth="2" />
                    <path d="M1.5 5.5L12 13L22.5 5.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <Icon size={18} color="var(--color-brand)" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {link.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-brand)', marginTop: '2px' }}>
                  {link.actionText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLinksWidget;
