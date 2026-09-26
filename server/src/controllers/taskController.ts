import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Task, ITask } from '../models/Task';
import { NormalizedEvent } from '../models/NormalizedEvent';

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = req.user._id;
    const filter = typeof req.query.filter === 'string' ? req.query.filter : 'all';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'dueDate';
    const order = typeof req.query.order === 'string' && req.query.order === 'desc' ? 'desc' : 'asc';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Calculate Counts for all categories
    const [allCount, completedCount, overdueCount, todayCount, upcomingCount] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'Completed' }),
      Task.countDocuments({
        userId,
        status: { $ne: 'Completed' },
        dueDate: { $ne: null, $lt: startOfToday },
      }),
      Task.countDocuments({
        userId,
        status: { $ne: 'Completed' },
        dueDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Task.countDocuments({
        userId,
        status: { $ne: 'Completed' },
        dueDate: { $gt: endOfToday },
      }),
    ]);

    // Build DB Query Filter
    const dbFilter: any = { userId };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      dbFilter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (filter === 'today') {
      dbFilter.status = { $ne: 'Completed' };
      dbFilter.dueDate = { $gte: startOfToday, $lte: endOfToday };
    } else if (filter === 'upcoming') {
      dbFilter.status = { $ne: 'Completed' };
      dbFilter.dueDate = { $gt: endOfToday };
    } else if (filter === 'overdue') {
      dbFilter.status = { $ne: 'Completed' };
      dbFilter.dueDate = { $ne: null, $lt: startOfToday };
    } else if (filter === 'completed') {
      dbFilter.status = 'Completed';
    }

    let tasks: ITask[] = await Task.find(dbFilter);

    // Perform sorting
    const sortMultiplier = order === 'desc' ? -1 : 1;

    tasks.sort((a, b) => {
      if (sort === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        if (weightA !== weightB) {
          return (weightB - weightA) * sortMultiplier;
        }
      } else if (sort === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        if (timeA !== timeB) {
          return (timeA - timeB) * sortMultiplier;
        }
      } else {
        // Default sort by dueDate
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (timeA !== timeB) {
          return (timeA - timeB) * sortMultiplier;
        }
      }

      // Secondary fallback sort by title
      return a.title.localeCompare(b.title);
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        counts: {
          all: allCount,
          today: todayCount,
          upcoming: upcomingCount,
          overdue: overdueCount,
          completed: completedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { title, description, status, priority, dueDate, dueTime } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const taskStatus = ['Todo', 'In Progress', 'Completed'].includes(status) ? status : 'Todo';
    const taskPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const completedAt = taskStatus === 'Completed' ? new Date() : null;

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: taskStatus,
      priority: taskPriority,
      dueDate: parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate : null,
      dueTime: dueTime || '',
      completedAt,
    });

    // Record activity in NormalizedEvent timeline
    try {
      await NormalizedEvent.create({
        user: req.user._id,
        source: 'tasks',
        provider: 'native',
        eventType: 'task_created',
        externalId: `task_created_${task._id}`,
        timestamp: new Date(),
        title: `Task created: "${task.title}"`,
        description: task.description || '',
        metadata: {
          taskId: task._id,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
        },
      });
    } catch (err) {
      // Ignore non-fatal timeline logging error
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { title, description, status, priority, dueDate, dueTime } = req.body;
    const prevStatus = task.status;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Task title cannot be empty' });
        return;
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined && ['Todo', 'In Progress', 'Completed'].includes(status)) {
      task.status = status;
      if (status === 'Completed' && prevStatus !== 'Completed') {
        task.completedAt = new Date();
      } else if (status !== 'Completed') {
        task.completedAt = null;
      }
    }

    if (priority !== undefined && ['Low', 'Medium', 'High'].includes(priority)) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      const parsedDueDate = dueDate ? new Date(dueDate) : null;
      task.dueDate = parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate : null;
    }

    if (dueTime !== undefined) {
      task.dueTime = dueTime || '';
    }

    await task.save();

    // Log event in Timeline if completed or updated
    if (task.status === 'Completed' && prevStatus !== 'Completed') {
      try {
        await NormalizedEvent.create({
          user: req.user._id,
          source: 'tasks',
          provider: 'native',
          eventType: 'task_completed',
          externalId: `task_completed_${task._id}_${Date.now()}`,
          timestamp: new Date(),
          title: `Task completed: "${task.title}"`,
          description: task.description || '',
          metadata: { taskId: task._id },
        });
      } catch (err) {}
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskComplete = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    let isNowCompleted: boolean;

    if (req.body.completed !== undefined) {
      isNowCompleted = Boolean(req.body.completed);
    } else {
      isNowCompleted = task.status !== 'Completed';
    }

    if (isNowCompleted) {
      task.status = 'Completed';
      task.completedAt = new Date();
    } else {
      task.status = 'Todo';
      task.completedAt = null;
    }

    await task.save();

    if (isNowCompleted) {
      try {
        await NormalizedEvent.create({
          user: req.user._id,
          source: 'tasks',
          provider: 'native',
          eventType: 'task_completed',
          externalId: `task_completed_${task._id}_${Date.now()}`,
          timestamp: new Date(),
          title: `Task completed: "${task.title}"`,
          description: task.description || '',
          metadata: { taskId: task._id },
        });
      } catch (err) {}
    }

    res.status(200).json({
      success: true,
      message: isNowCompleted ? 'Task marked as completed' : 'Task marked as incomplete',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
