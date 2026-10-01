const CalendarEvent = require('../models/CalendarEvent');

const defaultEvents = [
  { title: 'Product Meeting', time: '2:00 PM', duration: '1 hour', type: 'meeting', meetLink: 'https://meet.google.com/abc-defg-hij' },
  { title: 'Prepare interview', time: '4:00 PM', duration: 'Task · Due today', type: 'task' },
  { title: 'Team sync', time: '6:00 PM', duration: '30 min', type: 'meeting', meetLink: 'https://meet.google.com/xyz-uvwx-rst' },
  { title: 'Read tech article', time: '8:00 PM', duration: 'Task', type: 'task' },
];

const seedCalendarIfEmpty = async (userId) => {
  const count = await CalendarEvent.countDocuments({ userId });
  if (count === 0) {
    const eventsToInsert = defaultEvents.map(e => ({ ...e, userId }));
    await CalendarEvent.insertMany(eventsToInsert);
  }
};

const getCalendarEvents = async (req, res, next) => {
  try {
    await seedCalendarIfEmpty(req.user._id);

    const events = await CalendarEvent.find({ userId: req.user._id }).sort({ createdAt: 1 });
    const count = events.length;

    return res.status(200).json({
      success: true,
      events,
      summary: {
        totalToday: 3,
        upcomingCount: 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCalendarEvent = async (req, res, next) => {
  try {
    const { title, time, duration, type, meetLink } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const event = await CalendarEvent.create({
      userId: req.user._id,
      title: title.trim(),
      time: time || '2:00 PM',
      duration: duration || '30 min',
      type: type || 'meeting',
      meetLink: meetLink || 'https://meet.google.com/new',
    });

    return res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalendarEvents,
  createCalendarEvent,
};
