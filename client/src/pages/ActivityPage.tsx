import React from 'react';
import { Activity, GitCommit, Mail, Calendar } from 'lucide-react';
import { ActivityCard } from '../components/ui/ActivityCard.js';

export const ActivityPage: React.FC = () => {
  const activities = [
    {
      time: '09:02',
      source: 'GitHub' as const,
      icon: GitCommit,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      title: 'Commit pushed to main branch',
      description: 'Refactored component hierarchy and design tokens',
    },
    {
      time: '09:31',
      source: 'Gmail' as const,
      icon: Mail,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
      title: 'Email received from Engineering Lead',
      description: 'Weekly sprint goals and milestone review',
    },
    {
      time: '10:00',
      source: 'Calendar' as const,
      icon: Calendar,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      title: 'Team Product & Architecture Sync',
      description: 'Discussing command center layout updates',
    },
    {
      time: '10:47',
      source: 'GitHub' as const,
      icon: GitCommit,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      title: 'Pull Request #42 opened',
      description: 'Feature/ui-redesign-command-center',
    },
    {
      time: '11:15',
      source: 'Gmail' as const,
      icon: Mail,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
      title: 'Notification: OAuth Callback Verified',
      description: 'Secure token stored in HTTP-only session cookie',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Activity Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Chronological feed of your unified digital actions.</p>
        </div>
      </div>

      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-2">
        {activities.map((act, i) => (
          <ActivityCard key={i} {...act} />
        ))}
      </div>
    </div>
  );
};
