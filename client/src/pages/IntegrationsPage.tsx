import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Github, Mail, Calendar, CloudSun, Sliders, GitPullRequest, GitBranch } from 'lucide-react';
import { IntegrationCard, IntegrationStatus } from '../components/ui/IntegrationCard';
import api from '../services/api';

export const IntegrationsPage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [searchParams] = useSearchParams();

  const connectedServices = user?.connectedServices || { github: false, google: false };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam.includes('google')) {
        setErrorMessage('Google authorization failed or was cancelled. Please try again.');
      } else if (errorParam.includes('github')) {
        setErrorMessage('GitHub authorization failed or was cancelled. Please try again.');
      } else {
        setErrorMessage('Connection failed. Please check your credentials and try again.');
      }
    }
  }, [searchParams]);

  const handleGitHubAuth = () => {
    window.location.href = `${API_URL}/integrations/github/auth`;
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_URL}/integrations/google/auth`;
  };

  const handleSyncProvider = async (provider: 'google' | 'github') => {
    await api.post('/sync', { provider });
    await checkAuth();
  };

  const handleDisconnectGitHub = async () => {
    await api.delete('/integrations/github/disconnect');
    await checkAuth();
  };

  const handleDisconnectGoogle = async () => {
    await api.delete('/integrations/google/disconnect');
    await checkAuth();
  };

  const googleStatus: IntegrationStatus = connectedServices.google ? 'connected' : searchParams.get('error')?.includes('google') ? 'failed' : 'disconnected';
  const githubStatus: IntegrationStatus = connectedServices.github ? 'connected' : searchParams.get('error')?.includes('github') ? 'failed' : 'disconnected';

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
          <p className="text-xs text-slate-500 dark:text-slate-400">Connect and manage external OAuth services and real-time data streams.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Integration Card */}
        <IntegrationCard
          name="Google"
          provider="google"
          icon={Mail}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          status={googleStatus}
          lastSynced={connectedServices.google ? 'Real-time API synced' : 'Not connected'}
          childrenServices={googleChildren}
          onConnect={handleGoogleAuth}
          onSync={() => handleSyncProvider('google')}
          onDisconnect={handleDisconnectGoogle}
        />

        {/* GitHub Integration Card */}
        <IntegrationCard
          name="GitHub"
          provider="github"
          icon={Github}
          iconBg="bg-slate-900 dark:bg-slate-800"
          iconColor="text-white"
          status={githubStatus}
          lastSynced={connectedServices.github ? 'Real-time API synced' : 'Not connected'}
          childrenServices={githubChildren}
          onConnect={handleGitHubAuth}
          onSync={() => handleSyncProvider('github')}
          onDisconnect={handleDisconnectGitHub}
        />

        {/* Weather Service Card */}
        <IntegrationCard
          name="OpenWeather Service"
          provider="weather"
          icon={CloudSun}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          status="connected"
          lastSynced="Reverse Geocoded Browser Location Proxy"
          onConnect={() => {}}
        />
      </div>
    </div>
  );
};
