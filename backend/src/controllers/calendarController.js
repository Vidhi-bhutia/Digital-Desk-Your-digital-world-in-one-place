const CalendarEvent = require('../models/CalendarEvent');
const { googleFetch } = require('../services/googleService');

const getCalendarEvents = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.from || req.query.to) query.date = {};
    if (req.query.from) { const from = new Date(req.query.from); if (Number.isNaN(from.getTime())) return res.status(400).json({ success: false, message: 'Calendar start date is invalid.' }); query.date.$gte = from; }
    if (req.query.to) { const to = new Date(req.query.to); if (Number.isNaN(to.getTime())) return res.status(400).json({ success: false, message: 'Calendar end date is invalid.' }); query.date.$lt = to; }
    const localEvents = await CalendarEvent.find(query).sort({ date: 1 }).limit(300);
    let googleEvents = [];
    const googleUser = await require('../models/User').findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
    if (googleUser.googleAccessToken || googleUser.googleRefreshToken) {
      const params = new URLSearchParams({ maxResults: '100', singleEvents: 'true', orderBy: 'startTime' });
      params.set('timeMin', req.query.from || new Date(new Date().setHours(0,0,0,0)).toISOString());
      params.set('timeMax', req.query.to || new Date(Date.now() + 90 * 86400000).toISOString());
      try {
        const response = await googleFetch(googleUser, `/calendar/v3/calendars/primary/events?${params}`);
        googleEvents = (response.items || []).map(e => ({ _id: `google-${e.id}`, provider: 'google', googleId: e.id, title: e.summary || '(no title)', date: e.start?.dateTime || e.start?.date, time: e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : 'All day', duration: '', type: 'meeting', meetLink: e.hangoutLink || e.conferenceData?.entryPoints?.find(p=>p.entryPointType==='video')?.uri || '', htmlLink: e.htmlLink || '', description: e.description || '' }));
      } catch (error) {
        const events = localEvents.map(e => ({ ...e.toObject(), provider: 'digital-desk' }));
        return res.json({ success: true, events, providerError: error.message, summary: { totalToday: 0, upcomingCount: events.filter(e => new Date(e.date) >= new Date()).length } });
      }
    }
    const events = [...localEvents.map(e => ({ ...e.toObject(), provider: 'digital-desk' })), ...googleEvents].sort((a,b) => new Date(a.date) - new Date(b.date));
    const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59, 999);
    res.json({ success: true, events, summary: { totalToday: events.filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && new Date(e.date) <= end).length, upcomingCount: events.filter(e => new Date(e.date) >= now).length } });
  } catch (error) { next(error); }
};

const createCalendarEvent = async (req, res, next) => {
  try {
    const { title, date, time, duration, type, meetLink } = req.body;
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
    const eventDate = date ? new Date(date) : null;
    if (eventDate && Number.isNaN(eventDate.getTime())) return res.status(400).json({ success: false, message: 'Event date is invalid.' });
    let event;
    if (req.body.provider === 'google') {
      const googleUser = await require('../models/User').findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
      const start = eventDate?.toISOString();
      if (!start) return res.status(400).json({ success: false, message: 'A date is required for a Google Calendar event.' });
      const end = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString();
      const created = await googleFetch(googleUser, '/calendar/v3/calendars/primary/events', { method: 'POST', body: JSON.stringify({ summary: title.trim(), start: { dateTime: start }, end: { dateTime: end }, ...(meetLink ? { location: meetLink } : {}) }) });
      event = created;
    } else {
      event = await CalendarEvent.create({ userId: req.user._id, title: title.trim(), date: eventDate, time: time || '', duration: duration || '', type: type || 'meeting', meetLink: meetLink || '', htmlLink: req.body.htmlLink || '' });
    }
    res.status(201).json({ success: true, event });
  } catch (error) { next(error); }
};

module.exports = { getCalendarEvents, createCalendarEvent };
