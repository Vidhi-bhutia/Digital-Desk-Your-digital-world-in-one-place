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
    githubFetch(user, `/users/${encodeURIComponent(user.githubUsername)}/events?per_page=100`),
  ]);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activities = events.filter(event => new Date(event.created_at).getTime() >= cutoff).map(event => ({
    id: `event-${event.id}`,
    type: 'github',
    title: `${event.type.replace('Event', '')} · ${event.repo?.name || 'GitHub'}`,
    detail: event.payload?.comment?.body || event.payload?.pull_request?.title || event.payload?.issue?.title || event.payload?.ref || '',
    timestamp: event.created_at,
    url: event.payload?.comment?.html_url || event.payload?.pull_request?.html_url || event.payload?.issue?.html_url || `https://github.com/${event.repo?.name || ''}`,
    action: event.type,
  }));
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
