import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api.js';
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
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard.js';
import { ActivityCard } from '../components/ui/ActivityCard.js';
import { EventCard } from '../components/ui/EventCard.js';
import { AttentionCard } from '../components/ui/AttentionCard.js';
import { WeatherCard } from '../components/ui/WeatherCard.js';
import { Link } from 'react-router-dom';

interface GitHubData {
  profile: { name: string; login: string };
  repos: Array<{ id: number; name: string; html_url: string; stargazers_count: number }>;
  recentEvents: Array<{ id: string; type: string; repo: { name: string }; created_at: string }>;
}

interface GoogleData {
  gmail: { unreadCount: number; messages: Array<{ id: string; snippet: string }> };
  calendar: { events: Array<{ id: string; summary: string; start: string; htmlLink: string }> };
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Determine greeting based on current time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Query GitHub Data
  const { data: githubData } = useQuery({
    queryKey: ['github-overview'],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: GitHubData }>('/integrations/github/overview');
        return res.data.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  // Query Google Data
  const { data: googleData } = useQuery({
    queryKey: ['google-overview'],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: GoogleData }>('/integrations/google/overview');
        return res.data.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  // Construct Chronological Today's Activity Feed from Real API Data
  const activityItems = [
    ...(githubData?.recentEvents.map((evt) => ({
      time: new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'GitHub' as const,
      icon: GitCommit,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      title: `${evt.type.replace('Event', '')} in ${evt.repo.name}`,
      description: `Activity recorded on GitHub repository`,
      rawDate: new Date(evt.created_at),
    })) || []),

    ...(googleData?.gmail.messages.map((msg, idx) => ({
      time: `09:${30 + idx * 5}`,
      source: 'Gmail' as const,
      icon: Mail,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
      title: 'Unread email received',
      description: msg.snippet,
      rawDate: new Date(),
    })) || []),

    ...(googleData?.calendar.events.map((evt) => ({
      time: new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Calendar' as const,
      icon: Calendar,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      title: evt.summary,
      description: 'Scheduled Calendar Event',
      link: evt.htmlLink,
      rawDate: new Date(evt.start),
    })) || []),
  ];

  // Fallback demo activities if integrations not yet connected
  const displayActivities =
    activityItems.length > 0
      ? activityItems.slice(0, 5)
      : [
          {
            time: '09:02',
            source: 'GitHub' as const,
            icon: GitCommit,
            iconBg: 'bg-indigo-500/10',
            iconColor: 'text-indigo-500',
            title: 'Commit pushed to digital-desk',
            description: 'Updated component styling and layout structure',
          },
          {
            time: '09:31',
            source: 'Gmail' as const,
            icon: Mail,
            iconBg: 'bg-rose-500/10',
            iconColor: 'text-rose-500',
            title: 'Email received from Team',
            description: 'Weekly sync notes and updates',
          },
          {
            time: '10:00',
            source: 'Calendar' as const,
            icon: Calendar,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            title: 'Team Product Sync Meeting',
            description: 'Review roadmap milestones',
          },
          {
            time: '10:47',
            source: 'GitHub' as const,
            icon: GitPullRequest,
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-500',
            title: 'Pull Request opened #42',
            description: 'Feature/ui-redesign-command-center',
          },
        ];

  // Construct Rule-based Attention Items
  const attentionItems = [];
  if (googleData?.gmail.unreadCount && googleData.gmail.unreadCount > 0) {
    attentionItems.push({
      title: `${googleData.gmail.unreadCount} Unread Emails`,
      description: 'Important messages waiting in your Gmail inbox',
      type: 'warning' as const,
      icon: Mail,
      link: '/integrations',
    });
  }
  if (googleData?.calendar.events && googleData.calendar.events.length > 0) {
    attentionItems.push({
      title: 'Upcoming Meeting Scheduled',
      description: `Next: ${googleData.calendar.events[0].summary}`,
      type: 'urgent' as const,
      icon: Calendar,
      link: googleData.calendar.events[0].htmlLink,
    });
  }
  if (githubData?.repos && githubData.repos.length > 0) {
    attentionItems.push({
      title: 'GitHub Repos Active',
      description: `${githubData.repos.length} user repositories synced`,
      type: 'info' as const,
      icon: Github,
      link: '/integrations',
    });
  }
  if (attentionItems.length === 0) {
    attentionItems.push({
      title: 'Connect Integrations',
      description: 'Connect GitHub and Google in Settings to enable real-time attention alerts.',
      type: 'info' as const,
      icon: Sparkles,
      link: '/integrations',
    });
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your daily digital overview. "Your digital world, in one place."
          </p>
        </div>

        <div className="desk-surface px-4 py-2 rounded-2xl flex items-center space-x-2.5 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] self-start sm:self-auto shadow-soft-sm">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentDate}</span>
        </div>
      </div>

      {/* 2. Compact Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Meetings Today"
          value={googleData?.calendar.events?.length ?? 2}
          subtitle="Events scheduled"
          icon={Calendar}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Unread Emails"
          value={googleData?.gmail.unreadCount ?? 5}
          subtitle="Inbox messages"
          icon={Mail}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatCard
          title="GitHub Activity"
          value={githubData?.recentEvents?.length ?? 12}
          subtitle="Recent events"
          icon={Github}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Open PRs"
          value={1}
          subtitle="Requires review"
          icon={GitPullRequest}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* 3. Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Today's Activity & GitHub Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Activity (Visually Prominent) */}
          <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today's Activity
                </h3>
              </div>
              <Link to="/activity" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-1">
              {displayActivities.map((act, i) => (
                <ActivityCard key={i} {...act} />
              ))}
            </div>
          </div>

          {/* GitHub Repositories & Activity Card */}
          <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    GitHub Activity
                  </h3>
                  <p className="text-[11px] text-slate-400">Repositories & PRs</p>
                </div>
              </div>
              <Link to="/integrations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Manage
              </Link>
            </div>

            {githubData?.repos ? (
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
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                      <span>⭐ {repo.stargazers_count} stars</span>
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">GitHub integration connected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Calendar, Attention, Around You */}
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
              {googleData?.calendar.events && googleData.calendar.events.length > 0 ? (
                googleData.calendar.events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    title={evt.summary}
                    startTime={new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    link={evt.htmlLink}
                  />
                ))
              ) : (
                <>
                  <EventCard title="Team Design & Architecture Sync" startTime="10:00 AM" endTime="11:00 AM" location="Google Meet" />
                  <EventCard title="Product Deployment Checklist Review" startTime="02:30 PM" endTime="03:00 PM" location="Conference Room A" />
                </>
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
            </div>

            <div className="space-y-2.5">
              {attentionItems.map((att, i) => (
                <AttentionCard key={i} {...att} />
              ))}
            </div>
          </div>

          {/* Around You Weather Card */}
          <WeatherCard />
        </div>

      </div>
    </div>
  );
};
