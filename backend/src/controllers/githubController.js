const { unseal } = require('../utils/crypto');

const githubFetch = async (user, path) => {
  if (!user.githubAccessToken) { const e = new Error('GitHub is not connected. Connect an account in Integrations.'); e.status = 409; throw e; }
  const response = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${unseal(user.githubAccessToken)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) { const e = new Error(response.status === 401 ? 'GitHub token expired or revoked. Reconnect GitHub.' : `GitHub API request failed (${response.status}).`); e.status = response.status === 401 ? 401 : 502; throw e; }
  return response.json();
};

const fetchGitHubActivity = async (user) => {
  const [repos, events] = await Promise.all([
    githubFetch(user, '/user/repos?sort=pushed&per_page=10'),
    githubFetch(user, `/users/${encodeURIComponent(user.githubUsername)}/events?per_page=100`),
  ]);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(event => new Date(event.created_at).getTime() >= cutoff);
  const pushCommitResults = new Map();
  const pushesNeedingCommits = recentEvents.filter(event => event.type === 'PushEvent' && (event.payload?.commits?.length || 0) < (Number(event.payload?.size) || 1) && event.payload?.before && event.payload?.head).slice(0, 3);
  await Promise.all(pushesNeedingCommits.map(async event => {
    const repoPath = (event.repo?.name || '').split('/').map(encodeURIComponent).join('/');
    const before = encodeURIComponent(event.payload.before); const head = encodeURIComponent(event.payload.head);
    try {
      const comparison = await githubFetch(user, `/repos/${repoPath}/compare/${before}...${head}`);
      pushCommitResults.set(event.id, comparison.commits || []);
    } catch { pushCommitResults.set(event.id, []); }
  }));
  const activities = recentEvents.flatMap(event => {
    const repoName = event.repo?.name || 'GitHub';
    if (event.type === 'PushEvent') {
      const eventCommits = Array.isArray(event.payload?.commits) ? event.payload.commits : [];
      const comparedCommits = pushCommitResults.get(event.id) || [];
      const commits = comparedCommits.length > eventCommits.length ? comparedCommits : eventCommits;
      const count = Math.max(Number(event.payload?.size) || 0, commits.length, 1);
      if (commits.length) return commits.map((commit, index) => ({
        id: `event-${event.id}-commit-${commit.sha || index}`,
        type: 'github',
        title: `Commit - ${repoName}`,
        detail: commit.message || commit.commit?.message || `Commit ${commit.sha?.slice(0, 7) || index + 1}`,
        timestamp: event.created_at,
        url: commit.html_url || (commit.sha ? `https://github.com/${repoName}/commit/${commit.sha}` : `https://github.com/${repoName}`),
        action: event.type,
        commitCount: 1,
        commitSha: commit.sha,
      }));
      return [{ id: `event-${event.id}`, type: 'github', title: `Push - ${repoName}`, detail: `${count} commit${count === 1 ? '' : 's'} pushed${event.payload?.ref ? ` to ${event.payload.ref.replace('refs/heads/', '')}` : ''}`, timestamp: event.created_at, url: `https://github.com/${repoName}/commits`, action: event.type, commitCount: count }];
    }
    return [{
      id: `event-${event.id}`,
      type: 'github',
      title: `${event.type.replace('Event', '')} - ${repoName}`,
      detail: event.payload?.comment?.body || event.payload?.pull_request?.title || event.payload?.issue?.title || event.payload?.ref || '',
      timestamp: event.created_at,
      url: event.payload?.comment?.html_url || event.payload?.pull_request?.html_url || event.payload?.issue?.html_url || `https://github.com/${repoName}`,
      action: event.type,
      commitCount: 0,
    }];
  });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const repoCommits = await Promise.all(repos.slice(0, 5).map(async repo => {
    const repoPath = repo.full_name.split('/').map(encodeURIComponent).join('/');
    try { return await githubFetch(user, `/repos/${repoPath}/commits?since=${encodeURIComponent(since)}&per_page=100`); }
    catch { return []; }
  }));
  const targetLogin = String(user.githubUsername || '').toLowerCase();
  const targetEmail = String(user.email || '').toLowerCase();
  const directCommits = repoCommits.flat().filter(commit => {
    const authorLogin = String(commit.author?.login || commit.committer?.login || '').toLowerCase();
    const authorEmail = String(commit.commit?.author?.email || '').toLowerCase();
    return (authorLogin && authorLogin === targetLogin) || (targetEmail && authorEmail === targetEmail);
  }).map(commit => ({
    id: `commit-${commit.sha}`,
    commitSha: commit.sha,
    type: 'github',
    title: `Commit - ${commit.repository?.full_name || repos.find(repo => commit.html_url?.includes(repo.full_name))?.full_name || 'GitHub'}`,
    detail: commit.commit?.message || 'Commit',
    timestamp: commit.commit?.committer?.date || commit.commit?.author?.date,
    url: commit.html_url || `https://github.com/${commit.repository?.full_name || ''}/commit/${commit.sha}`,
    action: 'PushEvent',
    commitCount: 1,
  }));
  const uniqueDirectCommits = directCommits.filter(commit => !activities.some(item => item.commitSha === commit.commitSha));
  const eventActivities = activities.filter(item => {
    if (item.action !== 'PushEvent' || item.commitSha) return true;
    return !directCommits.some(commit => commit.title === `Commit - ${item.title.replace(/^Push - /, '')}` && Math.abs(new Date(commit.timestamp) - new Date(item.timestamp)) < 12 * 60 * 60 * 1000);
  });
  const allActivities = [...eventActivities, ...uniqueDirectCommits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const eventActivityRecent = recentEvents.filter(event => new Date(event.created_at).getTime() >= recentCutoff).reduce((total, event) => total + (event.type === 'PushEvent' ? Math.max(Number(event.payload?.size) || 0, event.payload?.commits?.length || 0, pushCommitResults.get(event.id)?.length || 0, 1) : 1), 0);
  const directActivityRecent = directCommits.filter(commit => new Date(commit.timestamp).getTime() >= recentCutoff).length;
  return { repos, activities: allActivities, activityRecent: Math.max(eventActivityRecent, directActivityRecent) };
};

const activityCache = new Map();
const activityInFlight = new Map();
const getGitHubActivity = async (user, force = false) => {
  const key = String(user._id || user.id || user.githubUsername || 'github-user');
  const cached = activityCache.get(key);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.data;
  if (!force && activityInFlight.has(key)) return activityInFlight.get(key);
  const request = fetchGitHubActivity(user).then(data => {
    activityCache.set(key, { data, expiresAt: Date.now() + 45000 });
    return data;
  }).finally(() => activityInFlight.delete(key));
  activityInFlight.set(key, request);
  return request;
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
