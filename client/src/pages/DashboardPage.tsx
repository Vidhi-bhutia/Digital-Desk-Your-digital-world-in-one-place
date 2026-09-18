import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Github,
  Mail,
  Calendar,
  CloudSun,
  ShieldCheck,
  ArrowRight,
  Radio,
  Layers,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const connectedServices = user?.connectedServices || { github: false, google: false };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Command Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{user?.name}</span>
            </h1>

            <p className="text-slate-300 text-sm max-w-xl">
              "Your digital world, in one place." Monitor your connected services, stay on top of your schedule, and control your workflow from one interface.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="glass-card px-4 py-3 rounded-2xl flex items-center space-x-3 border border-white/5">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Today</p>
                <p className="text-xs font-medium text-slate-200">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Connected Services</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {(connectedServices.github ? 1 : 0) + (connectedServices.google ? 1 : 0)} / 2
            </p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Security & Session</p>
            <p className="text-sm font-semibold text-emerald-300 mt-0.5 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>HTTP-Only Cookie Protected</span>
            </p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Backend API Status</p>
            <p className="text-sm font-semibold text-purple-300 mt-0.5 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Express + MongoDB Ready</span>
            </p>
          </div>
        </div>
      </div>

      {/* Digital Desk Services Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Service Overview & Integrations</span>
          </h2>
          <Link
            to="/settings"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
          >
            <span>Manage Integrations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GitHub Integration Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <Github className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    connectedServices.github
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {connectedServices.github ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">GitHub API</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Repositories, commits, issues, and star metrics.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              {connectedServices.github ? 'View Repository Feed' : 'Connect GitHub'}
            </Link>
          </div>

          {/* Gmail Integration Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Mail className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    connectedServices.google
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {connectedServices.google ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Gmail API</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Unread email counter and important message updates.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              {connectedServices.google ? 'View Gmail Inbox' : 'Connect Google'}
            </Link>
          </div>

          {/* Google Calendar Integration Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    connectedServices.google
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {connectedServices.google ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Google Calendar</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upcoming schedule events and calendar timeline.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              {connectedServices.google ? 'View Schedule' : 'Connect Google'}
            </Link>
          </div>

          {/* Weather Service Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CloudSun className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Active Proxy
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Weather Service</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Live OpenWeatherMap backend integration proxy.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              Configure Weather City
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
