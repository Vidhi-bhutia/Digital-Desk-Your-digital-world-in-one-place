import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Bell, CheckCircle2, Calendar, Mail, Github, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  source: 'calendar' | 'gmail' | 'github' | 'system';
  timestamp?: string;
  link?: string;
}

export const AttentionPage: React.FC = () => {
  const { data: attentionItems, isLoading, error } = useQuery({
    queryKey: ['attention-center'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AttentionItem[] }>('/attention');
      return res.data.data;
    },
    retry: false,
  });

  const items = attentionItems || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attention Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time alerts and items requiring user action.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-400">Checking attention items...</p>
          </div>
        ) : error || items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">You're all caught up!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No urgent calendar meetings, unread emails above threshold, or open PR reviews pending.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Return to Command Center
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = item.source === 'calendar' ? Calendar : item.source === 'gmail' ? Mail : item.source === 'github' ? Github : Sparkles;
              const typeColor =
                item.type === 'urgent'
                  ? 'border-rose-500/30 bg-rose-500/5 text-rose-500'
                  : item.type === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/5 text-amber-500'
                  : 'border-indigo-500/30 bg-indigo-500/5 text-indigo-500';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border ${typeColor} flex items-start justify-between gap-4 transition-all`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                          {item.type} • {item.source}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.link && (
                    item.link.startsWith('http') ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex-shrink-0"
                      >
                        Action
                      </a>
                    ) : (
                      <Link
                        to={item.link}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors flex-shrink-0"
                      >
                        Action
                      </Link>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
