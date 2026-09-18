import React from 'react';
import { Bell, Mail, Calendar, GitPullRequest } from 'lucide-react';
import { AttentionCard } from '../components/ui/AttentionCard.js';

export const AttentionPage: React.FC = () => {
  const items = [
    {
      title: 'Upcoming Meeting Starting Soon',
      description: 'Team Product & Architecture Sync starts in 15 minutes.',
      type: 'urgent' as const,
      icon: Calendar,
      actionText: 'Join Call',
    },
    {
      title: '5 Unread Inbox Emails',
      description: 'Important messages requiring review in your Gmail inbox.',
      type: 'warning' as const,
      icon: Mail,
      actionText: 'Open Inbox',
    },
    {
      title: 'Pull Request Review Requested',
      description: 'PR #42 requires code review approval before merge.',
      type: 'info' as const,
      icon: GitPullRequest,
      actionText: 'Review PR',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attention Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rule-based action items requiring your prompt attention.</p>
        </div>
      </div>

      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-3">
        {items.map((item, i) => (
          <AttentionCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
};
