import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { EventCard } from '../components/ui/EventCard.js';

export const TimelinePage: React.FC = () => {
  const events = [
    { title: 'Team Design & Architecture Sync', startTime: '10:00 AM', endTime: '11:00 AM', location: 'Google Meet' },
    { title: 'Product Deployment Checklist Review', startTime: '02:30 PM', endTime: '03:00 PM', location: 'Conference Room A' },
    { title: '1-on-1 Engineering Check-in', startTime: '04:15 PM', endTime: '04:45 PM', location: 'Virtual' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Timeline & Schedule</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming calendar events and schedule timeline.</p>
        </div>
      </div>

      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
        {events.map((evt, i) => (
          <EventCard key={i} {...evt} />
        ))}
      </div>
    </div>
  );
};
