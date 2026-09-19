import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { NormalizedEvent } from '../models/NormalizedEvent';
import { fetchGitHubData } from '../services/githubService';
import { fetchGoogleData } from '../services/googleService';
import { OAuthToken } from '../models/OAuthToken';

export const getTimeline = async (
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
    const source = typeof req.query.source === 'string' ? req.query.source : 'all';
    const range = typeof req.query.range === 'string' ? req.query.range : 'today';
    const userTimezone = typeof req.query.timezone === 'string' ? req.query.timezone : 'UTC';

    const filter: any = { user: userId };

    if (source !== 'all' && ['github', 'gmail', 'calendar'].includes(source)) {
      filter.source = source;
    }

    // Determine Start & End Date in User Timezone
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (range === 'today') {
      // Calculate start & end of day in target timezone
      const localString = now.toLocaleString('en-US', { timeZone: userTimezone });
      const localNow = new Date(localString);
      const startLocal = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 0, 0, 0);
      const endLocal = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 23, 59, 59, 999);

      // Convert back offset
      const diffMs = localNow.getTime() - now.getTime();
      startDate = new Date(startLocal.getTime() - diffMs);
      endDate = new Date(endLocal.getTime() - diffMs);
    } else if (range === 'yesterday') {
      const localString = now.toLocaleString('en-US', { timeZone: userTimezone });
      const localNow = new Date(localString);
      const startLocal = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() - 1, 0, 0, 0);
      const endLocal = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() - 1, 23, 59, 59, 999);

      const diffMs = localNow.getTime() - now.getTime();
      startDate = new Date(startLocal.getTime() - diffMs);
      endDate = new Date(endLocal.getTime() - diffMs);
    } else if (range === 'this_week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'custom' && req.query.startDate && req.query.endDate) {
      startDate = new Date(String(req.query.startDate));
      endDate = new Date(String(req.query.endDate));
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      filter.timestamp = { $gte: startDate, $lte: endDate };
    }

    const events = await NormalizedEvent.find(filter).sort({ timestamp: -1 }).limit(100);

    res.status(200).json({
      success: true,
      data: {
        events: events.map((evt) => ({
          id: evt._id,
          source: evt.source,
          provider: evt.provider,
          eventType: evt.eventType,
          externalId: evt.externalId,
          timestamp: evt.timestamp,
          fetchedAt: evt.fetchedAt,
          title: evt.title,
          description: evt.description,
          metadata: evt.metadata,
        })),
        range,
        source,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (
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
    const source = typeof req.query.source === 'string' ? req.query.source : 'all';

    const filter: any = { user: userId };
    if (source !== 'all') {
      filter.source = source;
    }

    const activities = await NormalizedEvent.find(filter).sort({ timestamp: -1 }).limit(50);

    res.status(200).json({
      success: true,
      data: activities.map((act) => ({
        id: act._id,
        source: act.source,
        provider: act.provider,
        eventType: act.eventType,
        externalId: act.externalId,
        timestamp: act.timestamp,
        title: act.title,
        description: act.description,
        metadata: act.metadata,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getAttention = async (
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
    const now = new Date();
    const attentionItems: any[] = [];

    // Rule 1: Calendar meeting starting within the next 60 minutes
    const upcomingEvents = await NormalizedEvent.find({
      user: userId,
      source: 'calendar',
      timestamp: { $gte: now, $lte: new Date(now.getTime() + 60 * 60 * 1000) },
    }).sort({ timestamp: 1 });

    for (const evt of upcomingEvents) {
      const minutesLeft = Math.round((evt.timestamp.getTime() - now.getTime()) / 60000);
      attentionItems.push({
        id: `cal_alert_${evt._id}`,
        title: `Meeting starting in ${minutesLeft} minutes`,
        description: evt.title,
        type: 'urgent',
        source: 'calendar',
        timestamp: evt.timestamp,
        link: evt.metadata?.htmlLink,
      });
    }

    // Rule 2: Unread email count or recent unread email
    const unreadEmails = await NormalizedEvent.find({
      user: userId,
      source: 'gmail',
      'metadata.unread': true,
    }).sort({ timestamp: -1 });

    if (unreadEmails.length > 0) {
      attentionItems.push({
        id: `gmail_alert_unread`,
        title: `${unreadEmails.length} Unread ${unreadEmails.length === 1 ? 'Email' : 'Emails'}`,
        description: `Latest from ${unreadEmails[0].metadata?.sender || 'Sender'}: "${unreadEmails[0].title}"`,
        type: 'warning',
        source: 'gmail',
        timestamp: unreadEmails[0].timestamp,
        link: '/integrations',
      });
    }

    // Rule 3: GitHub PR / Repos needing attention
    const githubEvents = await NormalizedEvent.find({
      user: userId,
      source: 'github',
    }).sort({ timestamp: -1 }).limit(10);

    const prEvents = githubEvents.filter((e) => e.eventType.includes('pullrequest'));
    if (prEvents.length > 0) {
      attentionItems.push({
        id: `github_alert_pr`,
        title: `GitHub Pull Request Activity`,
        description: prEvents[0].title,
        type: 'info',
        source: 'github',
        timestamp: prEvents[0].timestamp,
        link: '/integrations',
      });
    }

    res.status(200).json({
      success: true,
      data: attentionItems,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerSync = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = req.user._id.toString();
    const provider = req.body.provider;

    let syncResult: any = {};

    if (!provider || provider === 'google') {
      const googleToken = await OAuthToken.findOne({ user: userId, provider: 'google' });
      if (googleToken) {
        syncResult.google = await fetchGoogleData(userId);
      }
    }

    if (!provider || provider === 'github') {
      const githubToken = await OAuthToken.findOne({ user: userId, provider: 'github' });
      if (githubToken) {
        syncResult.github = await fetchGitHubData(userId);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      data: syncResult,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Sync failed. Please try again.',
    });
  }
};
