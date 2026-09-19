import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Activity, Github, Mail, Calendar, Loader2, Sliders, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  source: 'github' | 'gmail' | 'calendar';
  provider: string;
  eventType: string;
  externalId: string;
  timestamp: string;
  title: string;
  description?: string;
  metadata?: any;
}

export const ActivityPage: React.FC = () => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github' | 'gmail' | 'calendar'>('all');

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activity-feed', sourceFilter],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: ActivityItem[] }>('/activity', {
        params: { source: sourceFilter },
      });
      return res.data.data;
    },
    retry: false,
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Activity Stream
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Source-specific activity feed from connected services.
            </p>
          </div>
        </div>

        {/* Source Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 desk-surface rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]">
          {(['all', 'github', 'gmail', 'calendar'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSourceFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                sourceFilter === filter
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Activity Card List */}
      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading activity feed...</p>
          </div>
        ) : error || !activities || activities.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No activity found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No recent activity recorded for this filter. Connect GitHub or Google in Integrations to sync real event streams.
              </p>
            </div>
            <Link
              to="/integrations"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Manage Integrations
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => {
              const Icon = act.source === 'github' ? Github : act.source === 'gmail' ? Mail : Calendar;
              const iconBg =
                act.source === 'github'
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : act.source === 'gmail'
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-blue-500/10 text-blue-500';

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 flex items-start justify-between gap-4 transition-all hover:border-indigo-500/30"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {act.source}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(act.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {act.metadata?.htmlLink && (
                    <a
                      href={act.metadata.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300 transition-colors flex-shrink-0"
                      title="Open External Resource"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
