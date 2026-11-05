const Task = require('../models/Task');
const crypto = require('crypto');
const { googleFetch } = require('../services/googleService');
const User = require('../models/User');
const { notifyIfAllowed } = require('./notificationController');

const getTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const filter = req.query.filter || 'all';
    const query = { userId: req.user._id };
    if (req.query.q) {
      const search = String(req.query.q).slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'completed') query.completed = true;
    if (filter === 'open') query.completed = false;
    if (filter === 'today') Object.assign(query, { completed: false, dueDate: { $gte: start, $lt: end } });
    if (filter === 'upcoming') Object.assign(query, { completed: false, $or: [{ dueDate: { $gte: end } }, { dueDate: null }, { dueDate: { $exists: false } }] });
    if (filter === 'overdue') Object.assign(query, { completed: false, dueDate: { $lt: start } });
    const [tasks, total, today, upcoming, overdue, completed] = await Promise.all([
      Task.find(query).sort({ dueDate: 1, priority: 1, createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 100, 200)),
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: false, dueDate: { $gte: start, $lt: end } }),
      Task.countDocuments({ userId: req.user._id, completed: false, $or: [{ dueDate: { $gte: end } }, { dueDate: null }, { dueDate: { $exists: false } }] }),
      Task.countDocuments({ userId: req.user._id, completed: false, dueDate: { $exists: true, $lt: start } }),
      Task.countDocuments({ userId: req.user._id, completed: true }),
    ]);
    res.json({ success: true, tasks, counts: { total, today, upcoming, overdue, completed } });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, dueDate, noDeadline, dueText, priority, category, description } = req.body;
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required.' });
    if (!dueDate && noDeadline !== true) return res.status(400).json({ success: false, message: 'Choose a deadline or explicitly mark the task as having no deadline.' });
    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return res.status(400).json({ success: false, message: 'Task deadline is invalid.' });
    const task = await Task.create({ userId: req.user._id, title: title.trim(), description: description || '', dueDate: dueDate ? new Date(dueDate) : null, dueText: dueText || '', priority: priority || 'Medium', category: category || 'General' });
    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'dueDate', 'dueText', 'priority', 'category', 'completed'];
    const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if ('title' in changes && (typeof changes.title !== 'string' || !changes.title.trim())) return res.status(400).json({ success: false, message: 'Task title cannot be empty.' });
    if ('title' in changes) changes.title = changes.title.trim();
    if ('dueDate' in changes) changes.dueDate = changes.dueDate ? new Date(changes.dueDate) : null;
    if (typeof changes.completed === 'boolean') changes.completedAt = changes.completed ? new Date() : null;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: changes }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.completed && req.user.notificationPreferences?.completedTasks === true) await notifyIfAllowed(req.user, { category: 'tasks', title: 'Task completed', message: task.title, link: '/tasks', dedupeKey: `task:${task._id}:completed:${task.completedAt?.getTime() || Date.now()}` });
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) { next(error); }
};

const addTaskToGoogleCalendar = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!task.dueDate) return res.status(400).json({ success: false, message: 'Add a task deadline before sending it to Google Calendar.' });
    if (task.googleCalendarEventId) return res.json({ success: true, alreadyAdded: true, event: { id: task.googleCalendarEventId, htmlLink: task.googleCalendarEventUrl } });
    const googleUser = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
    if (!googleUser?.googleAccessToken && !googleUser?.googleRefreshToken) return res.status(409).json({ success: false, message: 'Connect Google in Settings before adding tasks to Calendar.' });
    const eventId = crypto.createHash('sha256').update(`digital-desk-task:${task._id}`).digest('hex');
    const start = task.dueDate.toISOString();
    const end = new Date(task.dueDate.getTime() + 30 * 60 * 1000).toISOString();
    let event;
    try {
      event = await googleFetch(googleUser, '/calendar/v3/calendars/primary/events', { method: 'POST', body: JSON.stringify({ id: eventId, summary: task.title, description: task.description || 'Task created in Digital Desk.', start: { dateTime: start }, end: { dateTime: end } }) });
    } catch (error) {
      // Google may have created the event before a network timeout. The stable
      // event ID makes retries idempotent; retrieve it instead of duplicating.
      if (error.status !== 409) throw error;
      event = await googleFetch(googleUser, `/calendar/v3/calendars/primary/events/${eventId}`);
    }
    task.googleCalendarEventId = event.id;
    task.googleCalendarEventUrl = event.htmlLink || '';
    await task.save();
    res.json({ success: true, alreadyAdded: false, event: { id: event.id, htmlLink: event.htmlLink || '' } });
  } catch (error) { next(error); }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, addTaskToGoogleCalendar };
