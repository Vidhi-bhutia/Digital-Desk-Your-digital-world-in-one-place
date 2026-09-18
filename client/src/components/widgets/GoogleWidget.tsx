import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Mail, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoogleData {
  gmail: {
    unreadCount: number;
    messages: Array<{
      id: string;
      snippet: string;
    }>;
  };
  calendar: {
    events: Array<{
      id: string;
      summary: string;
      start: string;
      end: string;
      location?: string;
      htmlLink: string;
    }>;
  };
}

export const GoogleWidget: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['google-overview'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: GoogleData }>('/integrations/google/overview');
      return res.data.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading Google Suite Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Google Suite Integration</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Connect Google to view unread Gmail counts and Google Calendar events.
          </p>
        </div>
        <Link
          to="/settings"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          Connect Google Account
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gmail Overview Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gmail Inbox</h3>
              <p className="text-xs text-slate-400">Unread Counter</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-extrabold">
            {data.gmail.unreadCount} Unread
          </div>
        </div>

        <div className="space-y-2">
          {data.gmail.messages.length > 0 ? (
            data.gmail.messages.map((msg) => (
              <div key={msg.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-slate-300 line-clamp-2">{msg.snippet}</p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-xs text-slate-400">All caught up! No unread messages.</p>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar Overview Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upcoming Events</h3>
              <p className="text-xs text-slate-400">Google Calendar</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {data.calendar.events.length > 0 ? (
            data.calendar.events.map((evt) => (
              <a
                key={evt.id}
                href={evt.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors block group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                    {evt.summary}
                  </p>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {new Date(evt.start).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </a>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-xs text-slate-400">No upcoming calendar events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
