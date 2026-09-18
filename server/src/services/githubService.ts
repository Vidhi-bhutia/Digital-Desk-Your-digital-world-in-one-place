import axios from 'axios';
import { OAuthToken } from '../models/OAuthToken';

export interface GitHubOverview {
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

export const fetchGitHubData = async (userId: string): Promise<GitHubOverview> => {
  const tokenDoc = await OAuthToken.findOne({ user: userId, provider: 'github' });
  if (!tokenDoc) {
    throw new Error('GitHub integration is not connected');
  }

  const token = tokenDoc.accessToken;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Digital-Desk-App',
  };

  // Fetch User Profile
  const profileRes = await axios.get('https://api.github.com/user', { headers });

  // Fetch Repositories
  const reposRes = await axios.get(
    'https://api.github.com/user/repos?sort=updated&per_page=6&type=owner',
    { headers }
  );

  // Fetch Recent Events
  const eventsRes = await axios.get(
    `https://api.github.com/users/${profileRes.data.login}/events/public?per_page=5`,
    { headers }
  );

  return {
    profile: {
      login: profileRes.data.login,
      name: profileRes.data.name || profileRes.data.login,
      avatar_url: profileRes.data.avatar_url,
      public_repos: profileRes.data.public_repos,
      followers: profileRes.data.followers,
      html_url: profileRes.data.html_url,
    },
    repos: reposRes.data.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description,
      stargazers_count: r.stargazers_count,
      language: r.language,
      updated_at: r.updated_at,
    })),
    recentEvents: eventsRes.data.map((e: any) => ({
      id: e.id,
      type: e.type,
      repo: { name: e.repo?.name || 'repository' },
      created_at: e.created_at,
    })),
  };
};
