import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Github, Mail, Calendar, CloudSun, Sliders, GitPullRequest, GitBranch } from 'lucide-react';
import { IntegrationCard } from '../components/ui/IntegrationCard.js';
import api from '../services/api.js';

export const IntegrationsPage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const connectedServices = user?.connectedServices || { github: false, google: false };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleGitHubAuth = () => {
    window.location.href = `${API_URL}/integrations/github/auth`;
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_URL}/integrations/google/auth`;
  };

  const handleDisconnectGitHub = async () => {
    try {
      await api.delete('/integrations/github/disconnect');
      await checkAuth();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await api.delete('/integrations/google/disconnect');
      await checkAuth();
    } catch (e) {
      console.error(e);
    }
  };

  const googleChildren = [
    { name: 'Gmail', icon: Mail, status: connectedServices.google ? ('active' as const) : ('inactive' as const) },
    { name: 'Calendar', icon: Calendar, status: connectedServices.google ? ('active' as const) : ('inactive' as const) },
  ];

  const githubChildren = [
    { name: 'Repositories', icon: GitBranch, status: connectedServices.github ? ('active' as const) : ('inactive' as const) },
    { name: 'Pull Requests', icon: GitPullRequest, status: connectedServices.github ? ('active' as const) : ('inactive' as const) },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Integrations Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Connect and manage external OAuth services and data streams.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Google Integration Card with Tree */}
        <IntegrationCard
          name="Google"
          provider="google"
          icon={Mail}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          isConnected={connectedServices.google}
          childrenServices={googleChildren}
          onConnect={handleGoogleAuth}
          onDisconnect={handleDisconnectGoogle}
        />

        {/* GitHub Integration Card with Tree */}
        <IntegrationCard
          name="GitHub"
          provider="github"
          icon={Github}
          iconBg="bg-slate-900 dark:bg-slate-800"
          iconColor="text-white"
          isConnected={connectedServices.github}
          childrenServices={githubChildren}
          onConnect={handleGitHubAuth}
          onDisconnect={handleDisconnectGitHub}
        />

        {/* Weather Service Proxy Card */}
        <IntegrationCard
          name="OpenWeather Service"
          provider="weather"
          icon={CloudSun}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          isConnected={true}
          lastSynced="Real-time proxy active"
          onConnect={() => {}}
        />
      </div>
    </div>
  );
};
