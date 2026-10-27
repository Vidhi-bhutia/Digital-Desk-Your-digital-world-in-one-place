const { unseal } = require('../utils/crypto');

const githubFetch = async (user, path) => {
  if (!user.githubAccessToken) { const e = new Error('GitHub is not connected. Connect an account in Integrations.'); e.status = 409; throw e; }
  const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${unseal(user.githubAccessToken)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) { const e = new Error(response.status === 401 ? 'GitHub token expired or revoked. Reconnect GitHub.' : `GitHub API request failed (${response.status}).`); e.status = response.status === 401 ? 401 : 502; throw e; }
  return response.json();
};

const getGitHubActivity = async (user) => {
  const [repos, events] = await Promise.all([
    githubFetch(user, '/user/repos?sort=updated&per_page=10'),
    githubFetch(user, `/users/${encodeURIComponent(user.githubUsername)}/events?per_page=30`),
  ]);
  const commitGroups = await Promise.all(repos.map(async repo => {
    const repoPath = repo.full_name.split('/').map(encodeURIComponent).join('/');
    const commits = await githubFetch(user, `/repos/${repoPath}/commits?author=${encodeURIComponent(user.githubUsername)}&per_page=10`);
    return commits.map(commit => ({
      id: `commit-${commit.sha}`,
      type: 'github',
      title: `Commit · ${repo.full_name}`,
      detail: (commit.commit?.message || '').split('\n')[0],
      timestamp: commit.commit?.author?.date || commit.commit?.committer?.date,
      url: commit.html_url,
      action: 'commit',
    }));
  }));
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const commitActivities = commitGroups.flat().filter(item => item.timestamp && new Date(item.timestamp).getTime() >= cutoff);
  const eventActivities = events.filter(event => event.type !== 'PushEvent' && new Date(event.created_at).getTime() >= cutoff).map(event => ({
    id: `event-${event.id}`,
    type: 'github',
    title: `${event.type.replace('Event', '')} · ${event.repo?.name || 'GitHub'}`,
    detail: event.payload?.pull_request?.title || event.payload?.issue?.title || event.payload?.ref || '',
    timestamp: event.created_at,
    url: `https://github.com/${event.repo?.name || ''}`,
    action: event.type,
  }));
  const activities = [...commitActivities, ...eventActivities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return { repos, activities, activityRecent: activities.filter(item => new Date(item.timestamp).getTime() >= recentCutoff).length };
};

const getGitHubSummary = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
    if (!user?.githubAccessToken) return res.status(409).json({ success: false, message: 'GitHub is not connected.' });
    const data = await getGitHubActivity(user, req.query.refresh === '1');
    res.json({ success: true, summary: { repositoryCount: data.repos.length, activityRecent: data.activityRecent, activityWindowDays: 7 }, repositories: data.repos.map(r => ({ id: r.id, name: r.full_name, description: r.description, url: r.html_url, private: r.private, updatedAt: r.updated_at })), activities: data.activities.slice(0, 30), isLive: true, refreshedAt: new Date().toISOString() });
  } catch (error) { res.status(error.status || 502).json({ success: false, message: error.message }); }
};

module.exports = { getGitHubSummary, githubFetch, getGitHubActivity };
