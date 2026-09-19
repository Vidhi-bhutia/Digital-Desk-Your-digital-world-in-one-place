import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Calendar as CalendarIcon, Github, Mail, Clock, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimelineEvent {
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

interface TimelineResponse {
  events: TimelineEvent[];
  range: string;
  source: string;
}

export const TimelinePage: React.FC = () => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github' | 'gmail' | 'calendar'>('all');
  const [rangeFilter, setRangeFilter] = useState<'today' | 'yesterday' | 'this_week' | 'all'>('today');

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-timeline', sourceFilter, rangeFilter, userTimezone],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: TimelineResponse }>('/timeline', {
        params: {
          source: sourceFilter,
          range: rangeFilter,
          timezone: userTimezone,
        },
      });
      return res.data.data;
    },
    retry: false,
  });

  const events = data?.events || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Unified Timeline
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological log of real events across GitHub, Gmail, and Google Calendar.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-1 p-1 desk-surface rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]">
            {(['today', 'yesterday', 'this_week', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRangeFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  rangeFilter === r
                    ? 'bg-indigo-600 text-white shadow-soft-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Source Selector */}
          <div className="flex items-center space-x-1 p-1 desk-surface rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]">
            {(['all', 'github', 'gmail', 'calendar'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  sourceFilter === s
                    ? 'bg-indigo-600 text-white shadow-soft-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Timeline Card Container */}
      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {rangeFilter.toUpperCase().replace('_', ' ')} TIMELINE ({events.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Timezone: {userTimezone}
          </span>
        </div>

        {/* Event List */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading normalized timeline...</p>
          </div>
        ) : error || events.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No timeline events found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No events recorded for target period ({rangeFilter}). Disconnected or inactive services show empty timeline entries.
              </p>
            </div>
            <Link
              to="/integrations"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Check Integrations
            </Link>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {events.map((evt) => {
              const Icon = evt.source === 'github' ? Github : evt.source === 'gmail' ? Mail : CalendarIcon;
              const nodeBg =
                evt.source === 'github'
                  ? 'bg-indigo-500 text-white'
                  : evt.source === 'gmail'
                  ? 'bg-rose-500 text-white'
                  : 'bg-blue-500 text-white';

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${nodeBg} flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-[#151c2e]`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {evt.source}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {evt.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {evt.description}
                      </p>
                    )}

                    {evt.metadata?.htmlLink && (
                      <div className="pt-1">
                        <a
                          href={evt.metadata.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Open on external provider</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
