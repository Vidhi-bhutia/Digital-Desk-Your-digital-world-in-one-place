const Task = require('../models/Task');

// Default initial tasks if user has none
const defaultTasks = [
  { title: 'Prepare interview', dueText: 'Today, 4:00 PM', priority: 'High', completed: false },
  { title: 'Update portfolio', dueText: 'Tomorrow', priority: 'Medium', completed: false },
  { title: 'Push Digital Desk changes', dueText: 'Today', priority: 'Medium', completed: true },
  { title: 'Read tech article', dueText: 'Sat, Sep 28', priority: 'Low', completed: false },
  { title: 'Review pull requests', dueText: 'Today', priority: 'High', completed: false },
];

const seedDefaultTasksIfEmpty = async (userId) => {
  const count = await Task.countDocuments({ userId });
  if (count === 0) {
    const tasksToInsert = defaultTasks.map(t => ({ ...t, userId }));
    await Task.insertMany(tasksToInsert);
  }
};

const getTasks = async (req, res, next) => {
  try {
    await seedDefaultTasksIfEmpty(req.user._id);

    const filter = req.query.filter || 'all';
    let query = { userId: req.user._id };

    if (filter === 'completed') {
      query.completed = true;
    } else if (filter === 'today') {
      query.completed = false;
    } else if (filter === 'upcoming') {
      query.completed = false;
    } else if (filter === 'overdue') {
      query.completed = false;
      query.priority = 'High';
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    const totalCount = await Task.countDocuments({ userId: req.user._id });
    const todayCount = await Task.countDocuments({ userId: req.user._id, completed: false });
    const upcomingCount = await Task.countDocuments({ userId: req.user._id, completed: false, priority: 'Medium' });
    const overdueCount = await Task.countDocuments({ userId: req.user._id, completed: false, priority: 'High' });
    const completedCount = await Task.countDocuments({ userId: req.user._id, completed: true });

    return res.status(200).json({
      success: true,
      tasks,
      counts: {
        total: totalCount,
        today: todayCount,
        upcoming: upcomingCount,
        overdue: overdueCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, dueText, priority, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      dueText: dueText || 'Today, 5:00 PM',
      priority: priority || 'Medium',
      category: category || 'General',
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
      task.completedAt = req.body.completed ? new Date() : null;
    }
    if (req.body.title) task.title = req.body.title.trim();
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.dueText) task.dueText = req.body.dueText;

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Task.deleteOne({ _id: id, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
