import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MiniCalendarWidget = () => {
  const [selectedDay, setSelectedDay] = useState(26);

  const days = [
    { num: 22, active: false },
    { num: 23, active: false },
    { num: 24, active: false },
    { num: 25, active: false },
    { num: 26, active: true },
    { num: 27, active: false },
    { num: 28, active: false },
  ];

  const events = [
    { time: '2:00 PM', title: 'Product Meeting', duration: '1 hour', color: '#10B981' },
    { time: '4:00 PM', title: 'Team sync', duration: '30 min', color: '#10B981' },
    { time: '7:00 PM', title: 'Gym', duration: '1 hour', color: '#F59E0B' },
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
      {/* Month Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)' }}>
          September 2024
        </h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }}>
            <ChevronLeft size={18} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
        {days.map((d) => {
          const isSelected = selectedDay === d.num;
          return (
            <div
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px',
                margin: '0 auto',
                borderRadius: '50%',
                backgroundColor: isSelected ? 'var(--color-brand)' : 'transparent',
                color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {d.num}
            </div>
          );
        })}
      </div>

      {/* Schedule Items */}
      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '55px' }}>{ev.time}</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ev.color }} />
              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{ev.title}</span>
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{ev.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendarWidget;
