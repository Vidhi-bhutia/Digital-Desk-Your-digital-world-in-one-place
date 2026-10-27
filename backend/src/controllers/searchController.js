const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');
const { unseal } = require('../utils/crypto');
const { googleFetch } = require('../services/googleService');

const getWeb = async (query) => {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error('Web search is not configured. Add TAVILY_API_KEY to backend/.env.');
  const response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key, query, max_results: 8, search_depth: 'basic' }), signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Web search provider failed (${response.status}).`);
  const data = await response.json();
  return (data.results || []).map((r, i) => ({ id: r.url, type: 'web', source: 'Web', title: r.title, subtitle: r.content, url: r.url, domain: (() => { try { return new URL(r.url).hostname; } catch { return ''; } })(), score: r.score, rank: i + 1 }));
};

// Search only repositories owned by the authenticated GitHub account. Never
// call GitHub's global repository search from the personal workspace search.
const getGitHub = async (user, query) => {
  if (!user?.githubAccessToken) throw new Error('GitHub is disconnected.');
  const token = unseal(user.githubAccessToken);
  const response = await fetch('https://api.github.com/user/repos?type=owner&sort=updated&per_page=100', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(response.status === 401 ? 'GitHub authorization expired. Reconnect GitHub.' : `GitHub search failed (${response.status}).`);
  const repos = await response.json();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return repos.filter(repo => {
    const text = `${repo.full_name} ${repo.description || ''} ${repo.language || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    return text.includes(query.toLowerCase()) || terms.every(term => text.includes(term));
  }).slice(0, 25).map(repo => ({ id: repo.id, type: 'github', source: 'GitHub', title: repo.full_name, subtitle: repo.description || `${repo.language || 'Repository'} · updated ${new Date(repo.updated_at).toLocaleDateString()}`, url: repo.html_url, private: repo.private }));
};

const getGmail = async (user, query) => {
  const q = encodeURIComponent(query);
  const list = await googleFetch(user, `/gmail/v1/users/me/messages?q=${q}&maxResults=10`);
  const items = await Promise.all((list.messages || []).map(async item => {
    const message = await googleFetch(user, `/gmail/v1/users/me/messages/${encodeURIComponent(item.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
    const headers = Object.fromEntries((message.payload?.headers || []).map(header => [header.name.toLowerCase(), header.value]));
    const from = headers.from || 'Unknown sender';
    return { id: message.id, type: 'gmail', source: 'Gmail', title: headers.subject || '(no subject)', subtitle: `${from} · ${message.snippet || ''}`, url: `https://mail.google.com/mail/u/0/#all/${message.id}`, timestamp: headers.date || '' };
  }));
  return items;
};

const getGoogleCalendar = async (user, query) => {
  const params = new URLSearchParams({ q: query, maxResults: '25', singleEvents: 'true', orderBy: 'startTime' });
  params.set('timeMin', new Date(Date.now() - 365 * 86400000).toISOString());
  params.set('timeMax', new Date(Date.now() + 365 * 86400000).toISOString());
  const data = await googleFetch(user, `/calendar/v3/calendars/primary/events?${params}`);
  return (data.items || []).map(event => ({ id: event.id, type: 'calendar', source: 'Calendar', title: event.summary || '(no title)', subtitle: event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start?.date || 'All day', url: event.htmlLink || 'https://calendar.google.com/calendar/u/0/r', meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.find(p => p.entryPointType === 'video')?.uri || '' }));
};

const searchAll = async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 200);
  if (!query) return res.json({ success: true, query, results: [], sections: {}, errors: {}, unavailable: {} });
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const errors = {};
  const unavailable = {};
  const settle = async (name, promise) => { try { return await promise; } catch (error) { errors[name] = error.message; return []; } };
  const [githubUser, googleUser] = await Promise.all([
    User.findById(req.user._id).select('+githubAccessToken'),
    User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken'),
  ]);
  const googleConnected = !!(googleUser?.googleAccessToken || googleUser?.googleRefreshToken);
  if (!githubUser?.githubAccessToken) unavailable.github = 'GitHub is disconnected.';
  if (!googleConnected) { unavailable.gmail = 'Gmail is disconnected.'; unavailable.calendar = 'Google Calendar is disconnected.'; }
  const tasksPromise = Task.find({ userId: req.user._id, $or: [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }, { category: { $regex: escaped, $options: 'i' } }] }).limit(25).lean().then(rows => rows.map(task => ({ id: task._id, type: 'task', source: 'Tasks', title: task.title, subtitle: task.description || task.category, url: '/tasks' })));
  const localCalendarPromise = CalendarEvent.find({ userId: req.user._id, title: { $regex: escaped, $options: 'i' } }).limit(25).lean().then(rows => rows.map(event => ({ id: event._id, type: 'calendar', source: 'Calendar', title: event.title, subtitle: event.date?.toISOString?.() || '', url: event.htmlLink || '/calendar' })));
  const [web, tasks, localCalendar, github, gmail, googleCalendar] = await Promise.all([
    settle('web', getWeb(query)),
    settle('tasks', tasksPromise),
    settle('calendar', localCalendarPromise),
    githubUser?.githubAccessToken ? settle('github', getGitHub(githubUser, query)) : Promise.resolve([]),
    googleConnected ? settle('gmail', getGmail(googleUser, query)) : Promise.resolve([]),
    googleConnected ? settle('calendar', getGoogleCalendar(googleUser, query)) : Promise.resolve([]),
  ]);
  const calendar = [...googleCalendar, ...localCalendar];
  const sections = { web, github, gmail, calendar, tasks };
  res.json({ success: true, query, sections, results: [...web, ...github, ...gmail, ...calendar, ...tasks], errors, unavailable, counts: Object.fromEntries(Object.entries(sections).map(([name, rows]) => [name, rows.length])) });
};

module.exports = { searchAll };
