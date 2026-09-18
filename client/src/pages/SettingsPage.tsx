import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Github, Mail, CloudSun, Shield, User as UserIcon, CheckCircle2, ExternalLink } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const connectedServices = user?.connectedServices || { github: false, google: false };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleGitHubAuth = () => {
    window.location.href = `${API_URL}/integrations/github/auth`;
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_URL}/integrations/google/auth`;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Integrations & Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your connected accounts, OAuth permissions, and command center preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center space-x-3 text-indigo-400">
          <UserIcon className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">User Profile</h2>
        </div>

        <div className="flex items-center space-x-5 p-4 rounded-2xl bg-white/5 border border-white/5">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="text-[11px] text-indigo-300 mt-1 font-mono">ID: {user?.id}</p>
          </div>
        </div>
      </div>

      {/* Integrations Management Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center space-x-3 text-purple-400">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">OAuth & External Service Connections</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          OAuth authentication tokens are managed exclusively by the backend API and saved securely using HTTP-only cookies and database token management. Frontend never exposes OAuth secrets.
        </p>

        <div className="space-y-4">
          {/* GitHub OAuth Connection */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">GitHub Integration</h3>
                  {connectedServices.github && (
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fetch repositories, stars, activity, and commit history.
                </p>
              </div>
            </div>

            <button
              onClick={handleGitHubAuth}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-600 shadow-md"
            >
              <span>{connectedServices.github ? 'Reconnect GitHub' : 'Connect GitHub'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Google OAuth (Gmail + Calendar) */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Google Suite (Gmail & Calendar)</h3>
                  {connectedServices.google && (
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unified unread Gmail counter and upcoming Google Calendar events.
                </p>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-red-600/20"
            >
              <span>{connectedServices.google ? 'Reconnect Google' : 'Connect Google'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>

          {/* OpenWeather Service */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">OpenWeather Service</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Backend API proxy key configured in server environment variables.
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              Proxy Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
