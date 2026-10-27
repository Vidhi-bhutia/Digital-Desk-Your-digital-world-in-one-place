const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const filter = req.query.filter || 'all';
    const query = { userId: req.user._id };
    if (req.query.q) query.$or = [
      { title: { $regex: req.query.q, $options: 'i' } },
      { description: { $regex: req.query.q, $options: 'i' } },
      { category: { $regex: req.query.q, $options: 'i' } },
    ];
    if (filter === 'completed') query.completed = true;
    if (filter === 'today') Object.assign(query, { completed: false, dueDate: { $gte: start, $lt: end } });
    if (filter === 'upcoming') Object.assign(query, { completed: false, dueDate: { $gte: end } });
    if (filter === 'overdue') Object.assign(query, { completed: false, dueDate: { $lt: start } });
    const [tasks, total, today, upcoming, overdue, completed] = await Promise.all([
      Task.find(query).sort({ dueDate: 1, priority: 1, createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 100, 200)),
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: false, dueDate: { $gte: start, $lt: end } }),
      Task.countDocuments({ userId: req.user._id, completed: false, dueDate: { $gte: end } }),
      Task.countDocuments({ userId: req.user._id, completed: false, dueDate: { $lt: start } }),
      Task.countDocuments({ userId: req.user._id, completed: true }),
    ]);
    res.json({ success: true, tasks, counts: { total, today, upcoming, overdue, completed } });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, dueDate, dueText, priority, category, description } = req.body;
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required.' });
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

module.exports = { getTasks, createTask, updateTask, deleteTask };
