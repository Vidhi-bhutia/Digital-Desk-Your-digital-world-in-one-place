import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Github, Star, GitBranch, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GitHubData {
  profile: {
    login: string;
    name: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
    html_url: string;
  };
  repos: Array<{
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    updated_at: string;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
  }>;
}

export const GitHubWidget: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['github-overview'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: GitHubData }>('/integrations/github/overview');
      return res.data.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading GitHub Activity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <Github className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">GitHub Integration</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Connect your GitHub account to view repositories and commit activity.
          </p>
        </div>
        <Link
          to="/settings"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          Connect GitHub Account
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <img
            src={data.profile.avatar_url}
            alt={data.profile.login}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">{data.profile.name}</h3>
              <a
                href={data.profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-400">@{data.profile.login} • {data.profile.public_repos} Repositories</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          <span>GitHub Sync</span>
        </div>
      </div>

      {/* Repositories List */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Recent Repositories
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.repos.slice(0, 4).map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group block"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                  {repo.name}
                </p>
                <div className="flex items-center space-x-1 text-[11px] text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{repo.stargazers_count}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                {repo.description || 'No description provided'}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
