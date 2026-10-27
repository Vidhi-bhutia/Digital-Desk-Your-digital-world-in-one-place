const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const { unseal } = require('../utils/crypto');

const getWeb = async (query) => {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error('Web search is not configured. Set TAVILY_API_KEY on the backend.');
  const response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key, query, max_results: 8, search_depth: 'basic' }), signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Web search provider failed (${response.status}).`);
  const data = await response.json();
  return (data.results || []).map((r, i) => ({ id: r.url, type: 'web', source: 'Web', title: r.title, subtitle: r.content, url: r.url, domain: (() => { try { return new URL(r.url).hostname; } catch { return ''; } })(), score: r.score, rank: i + 1 }));
};

const getGitHub = async (user, q) => {
  if (!user.githubAccessToken) throw new Error('GitHub is disconnected.');
  const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=10`, { headers: { Authorization: `Bearer ${unseal(user.githubAccessToken)}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`GitHub search failed (${response.status}).`);
  const d = await response.json();
  return (d.items || []).map(r => ({ id: r.id, type: 'github', source: 'GitHub', title: r.full_name, subtitle: r.description || 'Repository', url: r.html_url }));
};

const searchAll = async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 200);
  if (!query) return res.json({ success: true, query, results: [], sections: {}, errors: {} });
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const errors = {};
  const settle = async (name, promise) => { try { return await promise; } catch (e) { errors[name] = e.message; return []; } };
  const githubUser = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
  const [web, tasks, events, github] = await Promise.all([
    settle('web', getWeb(query)),
    settle('tasks', Task.find({ userId: req.user._id, $or: [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }, { category: { $regex: escaped, $options: 'i' } }] }).limit(25).lean().then(xs => xs.map(t => ({ id: t._id, type: 'task', source: 'Tasks', title: t.title, subtitle: t.description || t.category, url: '/tasks' })))),
    settle('calendar', CalendarEvent.find({ userId: req.user._id, title: { $regex: escaped, $options: 'i' } }).limit(25).lean().then(xs => xs.map(e => ({ id: e._id, type: 'calendar', source: 'Calendar', title: e.title, subtitle: e.date?.toISOString?.() || '', url: e.htmlLink || '/calendar' })))),
    settle('github', getGitHub(githubUser || req.user, query)),
  ]);
  let gmail = [];
  const unavailable = {};
  if (req.user.googleAccessToken || req.user.googleRefreshToken) unavailable.gmail = 'Gmail search adapter requires Google OAuth setup.';
  else unavailable.gmail = 'Gmail is disconnected.';
  const sections = { web, github, gmail, calendar: events, tasks };
  res.json({ success: true, query, results: [...web, ...github, ...events, ...tasks], sections, errors, unavailable });
};

module.exports = { searchAll };
