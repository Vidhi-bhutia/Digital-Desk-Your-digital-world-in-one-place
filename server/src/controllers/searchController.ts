import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { NormalizedEvent } from '../models/NormalizedEvent';
import { Task } from '../models/Task';

export const handleGlobalSearch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const queryStr = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!queryStr) {
      res.status(200).json({
        success: true,
        data: {
          tasks: [],
          github: [],
          gmail: [],
          calendar: [],
          activity: [],
        },
      });
      return;
    }

    const userId = req.user._id;
    const searchRegex = new RegExp(queryStr, 'i');

    // Search tasks in MongoDB
    const matchingTasks = await Task.find({
      userId,
      $or: [{ title: searchRegex }, { description: searchRegex }],
    }).sort({ createdAt: -1 }).limit(20);

    // Search normalized events in MongoDB database
    const matchingEvents = await NormalizedEvent.find({
      user: userId,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'metadata.sender': searchRegex },
        { 'metadata.repoName': searchRegex },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(30);

    const taskResults = matchingTasks.map((t) => ({
      id: t._id,
      source: 'tasks',
      provider: 'native',
      eventType: 'task',
      title: t.title,
      description: t.description || '',
      timestamp: t.createdAt,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      url: '/tasks',
    }));

    const githubResults: any[] = [];
    const gmailResults: any[] = [];
    const calendarResults: any[] = [];
    const activityResults: any[] = [...taskResults];

    for (const item of matchingEvents) {
      const formatted = {
        id: item._id,
        source: item.source,
        provider: item.provider,
        eventType: item.eventType,
        externalId: item.externalId,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        url: item.metadata?.htmlLink || item.metadata?.url || undefined,
        metadata: item.metadata,
      };

      activityResults.push(formatted);

      if (item.source === 'github') {
        githubResults.push(formatted);
      } else if (item.source === 'gmail') {
        gmailResults.push(formatted);
      } else if (item.source === 'calendar') {
        calendarResults.push(formatted);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        tasks: taskResults,
        github: githubResults,
        gmail: gmailResults,
        calendar: calendarResults,
        activity: activityResults,
      },
    });
  } catch (error) {
    next(error);
  }
};
