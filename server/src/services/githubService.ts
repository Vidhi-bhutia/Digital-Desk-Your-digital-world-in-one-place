import axios from 'axios';
import { OAuthToken } from '../models/OAuthToken';
import { NormalizedEvent } from '../models/NormalizedEvent';

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
  openPRsCount?: number;
  lastSyncedAt?: string;
}

export const validateGitHubConnection = async (token: string): Promise<boolean> => {
  try {
    const res = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Digital-Desk-App',
      },
    });
    return !!res.data?.login;
  } catch (err) {
    return false;
  }
};

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
    'https://api.github.com/user/repos?sort=updated&per_page=10&type=all',
    { headers }
  );

  // Fetch Recent Events
  const eventsRes = await axios.get(
    `https://api.github.com/users/${profileRes.data.login}/events/public?per_page=10`,
    { headers }
  );

  // Search Open Pull Requests by user
  let openPRsCount = 0;
  try {
    const prRes = await axios.get(
      `https://api.github.com/search/issues?q=author:${profileRes.data.login}+type:pr+state:open`,
      { headers }
    );
    openPRsCount = prRes.data.total_count || 0;
  } catch (e) {
    // Ignore PR search rate limits if any
  }

  const rawEvents: any[] = eventsRes.data || [];
  for (const evt of rawEvents) {
    if (!evt.id) continue;
    const evtDate = new Date(evt.created_at);

    await NormalizedEvent.findOneAndUpdate(
      { user: userId, provider: 'github', externalId: `github_${evt.id}` },
      {
        user: userId,
        source: 'github',
        provider: 'github',
        eventType: evt.type.toLowerCase().replace('event', ''),
        externalId: `github_${evt.id}`,
        timestamp: evtDate,
        fetchedAt: new Date(),
        title: `${evt.type.replace('Event', '')} in ${evt.repo?.name || 'repository'}`,
        description: `Activity on repository ${evt.repo?.name || ''}`,
        metadata: {
          repoName: evt.repo?.name,
          actor: evt.actor?.login,
          payload: evt.payload,
        },
      },
      { upsert: true, new: true }
    );
  }

  // Update token document status
  await OAuthToken.findOneAndUpdate(
    { user: userId, provider: 'github' },
    { status: 'connected', lastSyncedAt: new Date(), lastError: undefined }
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
    repos: (reposRes.data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description,
      stargazers_count: r.stargazers_count,
      language: r.language,
      updated_at: r.updated_at,
    })),
    recentEvents: rawEvents.map((e: any) => ({
      id: e.id,
      type: e.type,
      repo: { name: e.repo?.name || 'repository' },
      created_at: e.created_at,
    })),
    openPRsCount,
    lastSyncedAt: new Date().toISOString(),
  };
};
