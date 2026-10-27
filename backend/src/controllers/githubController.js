const { unseal } = require('../utils/crypto');

const githubFetch = async (user, path) => {
  if (!user.githubAccessToken) { const e = new Error('GitHub is not connected. Connect an account in Integrations.'); e.status = 409; throw e; }
  const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${unseal(user.githubAccessToken)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) { const e = new Error(response.status === 401 ? 'GitHub token expired or revoked. Reconnect GitHub.' : `GitHub API request failed (${response.status}).`); e.status = response.status === 401 ? 401 : 502; throw e; }
  return response.json();
};

const getGitHubSummary = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
    req.user.githubAccessToken = user?.githubAccessToken || '';
    const [repos, events] = await Promise.all([githubFetch(req.user, '/user/repos?sort=updated&per_page=10'), githubFetch(req.user, '/user/events?per_page=20')]);
    const activities = events.slice(0, 8).map(e => ({ id: e.id, type: 'github', title: `${e.type.replace('Event', '')} · ${e.repo?.name || 'Repository'}`, detail: e.payload?.commits?.[0]?.message || e.payload?.pull_request?.title || '', timestamp: e.created_at, url: `https://github.com/${e.repo?.name || ''}` }));
    res.json({ success: true, summary: { repositoryCount: repos.length, activityRecent: events.length }, repositories: repos.map(r => ({ id: r.id, name: r.full_name, description: r.description, url: r.html_url, private: r.private, updatedAt: r.updated_at })), activities, isLive: true });
  } catch (error) { res.status(error.status || 502).json({ success: false, message: error.message }); }
};

module.exports = { getGitHubSummary, githubFetch };
