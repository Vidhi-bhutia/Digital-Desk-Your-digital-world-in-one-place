import React from 'react';
import { Calendar, Mail, Github, CheckSquare, ChevronRight } from 'lucide-react';

export const QuickSummaryCards = ({
  meetingsCount = 0,
  emailsCount = 0,
  githubCount = 0,
  tasksCount = 0,
  onNavigate,
}) => {
  const cards = [
    {
      id: 'meetings',
      label: 'Meetings Today',
      count: meetingsCount ?? '—',
      subtext: 'Today',
      icon: Calendar,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      barColor: '#10B981',
      path: '/calendar',
    },
    {
      id: 'emails',
      label: 'Unread Emails',
      count: emailsCount ?? '—',
      subtext: 'Gmail status in Integrations',
      icon: Mail,
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      barColor: '#EF4444',
      isGmail: true,
      path: '/integrations',
    },
    {
      id: 'github',
      label: 'GitHub Activity',
      count: githubCount ?? '—',
      subtext: 'Recent',
      icon: Github,
      iconBg: '#F1F5F9',
      iconColor: '#0F172A',
      barColor: '#10B981',
      path: '/integrations',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      count: tasksCount ?? 0,
      subtext: 'Due today',
      icon: CheckSquare,
      iconBg: '#ECFDF5',
      iconColor: '#0F5132',
      barColor: '#F59E0B',
      path: '/tasks',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onNavigate && onNavigate(card.path)}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '110px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: card.iconBg,
                    color: card.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.isGmail ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1.5 18.5V5.5C1.5 4.39543 2.39543 3.5 3.5 3.5H20.5C21.6046 3.5 22.5 4.39543 22.5 5.5V18.5C22.5 19.6046 21.6046 20.5 20.5 20.5H3.5C2.39543 20.5 1.5 19.6046 1.5 18.5Z" stroke="#EF4444" strokeWidth="2" />
                      <path d="M1.5 5.5L12 13L22.5 5.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {card.label}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
                  {card.count}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '6px',
                  }}
                >
                  <span>{card.subtext}</span>
                  <ChevronRight size={14} />
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickSummaryCards;
