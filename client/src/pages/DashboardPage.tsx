import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Calendar,
  Mail,
  Github,
  GitPullRequest,
  Clock,
  Sparkles,
  AlertTriangle,
  GitCommit,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { ActivityCard } from '../components/ui/ActivityCard';
import { EventCard } from '../components/ui/EventCard';
import { AttentionCard } from '../components/ui/AttentionCard';
import { WeatherCard } from '../components/ui/WeatherCard';
import { Link } from 'react-router-dom';

interface GitHubData {
  profile: { name: string; login: string };
  repos: Array<{ id: number; name: string; html_url: string; stargazers_count: number; language?: string | null }>;
  recentEvents: Array<{ id: string; type: string; repo: { name: string }; created_at: string }>;
  openPRsCount?: number;
}

interface GoogleData {
  gmail: { unreadCount: number; messages: Array<{ id: string; snippet: string; sender: string; timestamp: string }> };
  calendar: { events: Array<{ id: string; summary: string; start: string; htmlLink: string }> };
}

interface TimelineEvent {
  id: string;
  source: 'github' | 'gmail' | 'calendar';
  eventType: string;
  timestamp: string;
  title: string;
  description?: string;
  metadata?: any;
}

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  source: 'calendar' | 'gmail' | 'github' | 'system';
  link?: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const connectedServices = user?.connectedServices || { github: false, google: false };

  // Query GitHub Data
  const { data: githubData } = useQuery({
    queryKey: ['github-overview'],
    queryFn: async () => {
      if (!connectedServices.github) return null;
      try {
        const res = await api.get<{ success: boolean; data: GitHubData }>('/integrations/github/overview');
        return res.data.data;
      } catch {
        return null;
      }
    },
    enabled: connectedServices.github,
    retry: false,
  });

  // Query Google Data
  const { data: googleData } = useQuery({
    queryKey: ['google-overview'],
    queryFn: async () => {
      if (!connectedServices.google) return null;
      try {
        const res = await api.get<{ success: boolean; data: GoogleData }>('/integrations/google/overview');
        return res.data.data;
      } catch {
        return null;
      }
    },
    enabled: connectedServices.google,
    retry: false,
  });

  // Query Unified Today's Activity from backend
  const { data: timelineData } = useQuery({
    queryKey: ['today-timeline'],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: { events: TimelineEvent[] } }>('/timeline', {
          params: { range: 'today', source: 'all' },
        });
        return res.data.data.events;
      } catch {
        return [];
      }
    },
    retry: false,
  });

  // Query Real Attention Items
  const { data: attentionItemsData } = useQuery({
    queryKey: ['attention-items'],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: AttentionItem[] }>('/attention');
        return res.data.data;
      } catch {
        return [];
      }
    },
    retry: false,
  });

  const todayActivities = timelineData || [];
  const attentionItems = attentionItemsData || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome to your personal digital workspace.
          </p>
        </div>

        <div className="desk-surface px-4 py-2 rounded-2xl flex items-center space-x-2.5 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] self-start sm:self-auto shadow-soft-sm">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentDate}</span>
        </div>
      </div>

      {/* 2. Real Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Meetings Today"
          value={connectedServices.google ? googleData?.calendar.events?.length ?? 0 : 'Not Connected'}
          subtitle={connectedServices.google ? 'Calendar events' : 'Connect Google'}
          icon={Calendar}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Unread Emails"
          value={connectedServices.google ? googleData?.gmail.unreadCount ?? 0 : 'Not Connected'}
          subtitle={connectedServices.google ? 'Inbox unread' : 'Connect Gmail'}
          icon={Mail}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatCard
          title="GitHub Activity"
          value={connectedServices.github ? githubData?.recentEvents?.length ?? 0 : 'Not Connected'}
          subtitle={connectedServices.github ? 'Recent events' : 'Connect GitHub'}
          icon={Github}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Open PRs"
          value={connectedServices.github ? githubData?.openPRsCount ?? 0 : 'Not Connected'}
          subtitle={connectedServices.github ? 'Active pull requests' : 'Connect GitHub'}
          icon={GitPullRequest}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* 3. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Today's Activity & GitHub Repos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Activity */}
          <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Activity
                </h3>
              </div>
              <Link to="/activity" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayActivities.length > 0 ? (
              <div className="space-y-1">
                {todayActivities.slice(0, 5).map((act) => (
                  <ActivityCard
                    key={act.id}
                    time={new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    source={act.source === 'github' ? 'GitHub' : act.source === 'gmail' ? 'Gmail' : 'Calendar'}
                    icon={act.source === 'github' ? GitCommit : act.source === 'gmail' ? Mail : Calendar}
                    iconBg={act.source === 'github' ? 'bg-indigo-500/10' : act.source === 'gmail' ? 'bg-rose-500/10' : 'bg-blue-500/10'}
                    iconColor={act.source === 'github' ? 'text-indigo-500' : act.source === 'gmail' ? 'text-rose-500' : 'text-blue-500'}
                    title={act.title}
                    description={act.description || ''}
                    link={act.metadata?.htmlLink}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No activity recorded for today yet.
                </p>
                {(!connectedServices.github || !connectedServices.google) && (
                  <Link
                    to="/integrations"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect Services</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* GitHub Repositories */}
          <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    GitHub Repositories
                  </h3>
                  <p className="text-[11px] text-slate-400">Authenticated user repos</p>
                </div>
              </div>
              <Link to="/integrations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Manage
              </Link>
            </div>

            {connectedServices.github && githubData?.repos ? (
              githubData.repos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {githubData.repos.slice(0, 4).map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-500/10 border border-slate-200/60 dark:border-slate-800 transition-colors block group"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {repo.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>⭐ {repo.stargazers_count} stars</span>
                        {repo.language && <span className="font-mono text-[10px]">{repo.language}</span>}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">No public repositories found in connected GitHub account.</p>
                </div>
              )
            ) : (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-400">GitHub isn't connected yet.</p>
                <Link
                  to="/integrations"
                  className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Connect GitHub Account →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Calendar, Attention, Weather */}
        <div className="space-y-6">
          
          {/* Upcoming Calendar */}
          <div className="desk-surface p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Calendar
                </h3>
              </div>
              <Link to="/timeline" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View Timeline
              </Link>
            </div>

            <div className="space-y-2.5">
              {connectedServices.google && googleData?.calendar.events && googleData.calendar.events.length > 0 ? (
                googleData.calendar.events.slice(0, 4).map((evt) => (
                  <EventCard
                    key={evt.id}
                    title={evt.summary}
                    startTime={new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    link={evt.htmlLink}
                  />
                ))
              ) : connectedServices.google ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">No upcoming calendar events found.</p>
                </div>
              ) : (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-400">Google Calendar isn't connected yet.</p>
                  <Link
                    to="/integrations"
                    className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Connect Google Account →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Attention Items Card */}
          <div className="desk-surface p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Attention Needed
                </h3>
              </div>
              <Link to="/attention" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {attentionItems.length > 0 ? (
                attentionItems.slice(0, 3).map((att, i) => (
                  <AttentionCard
                    key={att.id || i}
                    title={att.title}
                    description={att.description}
                    type={att.type}
                    icon={att.source === 'calendar' ? Calendar : att.source === 'gmail' ? Mail : att.source === 'github' ? Github : Sparkles}
                    link={att.link || '/attention'}
                  />
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Around You Weather Card */}
          <WeatherCard />
        </div>

      </div>
    </div>
  );
};
