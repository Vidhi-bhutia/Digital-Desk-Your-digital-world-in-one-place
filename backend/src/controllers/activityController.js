const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const { githubFetch } = require('./githubController');

const getActivityFeed = async (req, res, next) => {
  try {
    const [tasks, events] = await Promise.all([
      Task.find({ userId: req.user._id, completed: true }).sort({ completedAt: -1 }).limit(30).lean(),
      CalendarEvent.find({ userId: req.user._id }).sort({ date: -1 }).limit(30).lean(),
    ]);
    let githubActivities = [];
    try {
      const githubUser = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
      if (githubUser.githubAccessToken) {
        const events = await githubFetch(githubUser, '/user/events?per_page=30');
        githubActivities = events.map(e => ({ id: `github-${e.id}`, timestamp: e.created_at, type: 'github', icon: 'github', title: `${e.type.replace('Event','')} · ${e.repo?.name || 'GitHub'}`, detail: e.payload?.commits?.[0]?.message || e.payload?.pull_request?.title || '', url: `https://github.com/${e.repo?.name || ''}` }));
      }
    } catch (error) { /* local activity remains available when GitHub is unavailable */ }
    const activities = [
      ...githubActivities,
      ...tasks.map(t => ({ id: `task-${t._id}`, timestamp: t.completedAt || t.updatedAt, type: 'task', icon: 'task', title: 'Completed task', detail: t.title, url: '/tasks' })),
      ...events.map(e => ({ id: `calendar-${e._id}`, timestamp: e.date || e.createdAt, type: 'calendar', icon: 'calendar', title: e.title, detail: e.type === 'task' ? 'Task event' : 'Calendar event', url: e.htmlLink || '/calendar' })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, Math.min(Number(req.query.limit) || 30, 100));
    res.json({ success: true, activities, nextCursor: null, sources: { github: githubActivities.length, tasks: tasks.length, calendar: events.length } });
  } catch (error) { next(error); }
};

module.exports = { getActivityFeed };
