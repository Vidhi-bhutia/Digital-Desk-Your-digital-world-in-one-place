const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const { getGitHubActivity } = require('./githubController');

const getActivityFeed = async (req, res, next) => {
  try {
    const [tasks, events] = await Promise.all([
      Task.find({ userId: req.user._id, completed: true }).sort({ completedAt: -1 }).limit(30).lean(),
      CalendarEvent.find({ userId: req.user._id }).sort({ date: -1 }).limit(30).lean(),
    ]);
    let githubActivities = [];
    let githubRecent7d = 0;
    try {
      const githubUser = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
      if (githubUser.githubAccessToken) {
        const result = await getGitHubActivity(githubUser, req.query.refresh === '1');
        githubActivities = result.activities.map(item => ({ ...item, icon: 'github' }));
        githubRecent7d = result.activityRecent;
      }
    } catch (error) { /* local activity remains available when GitHub is unavailable */ }
    const activities = [
      ...githubActivities,
      ...tasks.map(t => ({ id: `task-${t._id}`, timestamp: t.completedAt || t.updatedAt, type: 'task', icon: 'task', title: 'Completed task', detail: t.title, url: '/tasks' })),
      ...events.map(e => ({ id: `calendar-${e._id}`, timestamp: e.date || e.createdAt, type: 'calendar', icon: 'calendar', title: e.title, detail: e.type === 'task' ? 'Task event' : 'Calendar event', url: e.htmlLink || '/calendar' })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, Math.min(Number(req.query.limit) || 30, 100));
    res.json({ success: true, activities, nextCursor: null, sources: { github: githubActivities.length, tasks: tasks.length, calendar: events.length }, summary: { githubRecent7d } });
  } catch (error) { next(error); }
};

module.exports = { getActivityFeed };
