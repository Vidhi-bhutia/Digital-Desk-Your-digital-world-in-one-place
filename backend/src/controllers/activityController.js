const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const { getGitHubActivity } = require('./githubController');

const getActivityFeed = async (req, res, next) => {
  try {
    const [tasks, events] = await Promise.all([
      Task.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(100).lean(),
      CalendarEvent.find({ userId: req.user._id }).sort({ date: -1 }).limit(30).lean(),
    ]);
    let githubActivities = [];
    let githubRecent7d = 0;
    let githubConnected = false;
    let googleMeetings = [];
    const providerErrors = {};
    try {
      const googleUser = await require('../models/User').findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
      if (googleUser.googleAccessToken || googleUser.googleRefreshToken) {
        const { googleFetch } = require('../services/googleService');
        const from = new Date(); from.setHours(0, 0, 0, 0);
        const to = new Date(from); to.setDate(to.getDate() + 30);
        const result = await googleFetch(googleUser, `/calendar/v3/calendars/primary/events?${new URLSearchParams({ maxResults: '100', singleEvents: 'true', orderBy: 'startTime', timeMin: from.toISOString(), timeMax: to.toISOString() })}`);
        googleMeetings = (result.items || []).map(event => ({
          id: `google-calendar-${event.id}`, timestamp: event.start?.dateTime || event.start?.date,
          type: 'calendar', icon: 'calendar', title: 'Meeting', detail: `${event.summary || '(no title)'} · ${new Date(event.start?.dateTime || event.start?.date).toLocaleString()}`,
          url: event.htmlLink || '/calendar',
        }));
      }
    } catch (error) { providerErrors.calendar = error.message; }
    try {
      const githubUser = await require('../models/User').findById(req.user._id).select('+githubAccessToken');
      if (githubUser.githubAccessToken) {
        githubConnected = true;
        const result = await getGitHubActivity(githubUser, req.query.refresh === '1');
        githubActivities = result.activities.map(item => ({ ...item, icon: 'github' }));
        githubRecent7d = result.activityRecent;
      }
      else providerErrors.github = 'GitHub is not connected.';
    } catch (error) { providerErrors.github = error.message; }
    const activities = [
      ...githubActivities,
      ...tasks.map(t => ({ id: `task-${t._id}`, timestamp: t.completed ? (t.completedAt || t.updatedAt) : (t.createdAt || t.updatedAt), type: 'task', icon: 'task', title: t.completed ? 'Completed task' : 'Task added', detail: t.title, url: '/tasks' })),
      ...events.map(e => ({ id: `calendar-${e._id}`, timestamp: e.date || e.createdAt, type: 'calendar', icon: 'calendar', title: e.type === 'meeting' ? 'Meeting' : 'Calendar event', detail: `${e.title}${e.date ? ` · ${new Date(e.date).toLocaleString()}` : ''}`, url: e.htmlLink || '/calendar' })),
      ...googleMeetings,
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, Math.min(Number(req.query.limit) || 30, 100));
    res.json({ success: true, activities, nextCursor: null, providers: providerErrors, sources: { github: githubActivities.length, tasks: tasks.length, calendar: events.length + googleMeetings.length }, summary: { githubRecent7d, githubConnected } });
  } catch (error) { next(error); }
};

module.exports = { getActivityFeed };
