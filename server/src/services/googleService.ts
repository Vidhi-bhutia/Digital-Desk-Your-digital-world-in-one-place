import axios from 'axios';
import { OAuthToken } from '../models/OAuthToken';
import { NormalizedEvent } from '../models/NormalizedEvent';

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  sender: string;
  subject: string;
  timestamp: string;
  unread: boolean;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  htmlLink: string;
  calendarName?: string;
}

export interface GoogleOverview {
  gmail: {
    unreadCount: number;
    messages: GmailMessageItem[];
  };
  calendar: {
    events: CalendarEventItem[];
  };
  lastSyncedAt?: string;
}

/**
 * Ensures a valid Google access token by checking expiry and refreshing if necessary.
 */

export const getValidGoogleAccessToken = async (userId: string): Promise<string> => {
  const tokenDoc = await OAuthToken.findOne({ user: userId, provider: 'google' });
  if (!tokenDoc) {
    throw new Error('Google integration is not connected');
  }

  // Check if access token is expired or about to expire in 60s
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() - Date.now() < 60000 && tokenDoc.refreshToken) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      const refreshRes = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenDoc.refreshToken,
        grant_type: 'refresh_token',
      });

      const { access_token, expires_in } = refreshRes.data;
      tokenDoc.accessToken = access_token;
      if (expires_in) {
        tokenDoc.expiresAt = new Date(Date.now() + expires_in * 1000);
      }
      tokenDoc.status = 'connected';
      tokenDoc.lastError = undefined;
      await tokenDoc.save();
      return access_token;
    } catch (err: any) {
      tokenDoc.status = 'expired';
      tokenDoc.lastError = 'Token refresh failed';
      await tokenDoc.save();
      throw new Error('Google authorization expired. Please reconnect your account.');
    }
  }

  return tokenDoc.accessToken;
};

/**
 * Validates Google access token by performing a test API call.
 */
export const validateGoogleConnection = async (accessToken: string): Promise<boolean> => {
  try {
    const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return !!res.data?.id;
  } catch (err) {
    return false;
  }
};

/**
 * Fetches real Gmail & Google Calendar data from Google API and normalizes into DB.
 */
export const fetchGoogleData = async (userId: string): Promise<GoogleOverview> => {
  const accessToken = await getValidGoogleAccessToken(userId);
  const headers = { Authorization: `Bearer ${accessToken}` };

  const gmailMessages: GmailMessageItem[] = [];
  let unreadCount = 0;
  const calendarEvents: CalendarEventItem[] = [];

  // 1. Fetch Gmail Unread Messages & Recent Email List
  try {
    const profileRes = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers });
    
    // Search unread messages
    const unreadListRes = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=100',
      { headers }
    );
    unreadCount = unreadListRes.data.resultSizeEstimate ?? (unreadListRes.data.messages?.length || 0);

    // Get recent 10 messages
    const recentListRes = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
      { headers }
    );

    const messageSummaries: Array<{ id: string }> = recentListRes.data.messages || [];

    for (const msgRef of messageSummaries) {
      try {
        const msgDetail = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
          { headers }
        );

        const payload = msgDetail.data.payload || {};
        const headersList = payload.headers || [];
        const senderHeader = headersList.find((h: any) => h.name.toLowerCase() === 'from');
        const subjectHeader = headersList.find((h: any) => h.name.toLowerCase() === 'subject');
        const dateHeader = headersList.find((h: any) => h.name.toLowerCase() === 'date');

        const sender = senderHeader ? senderHeader.value : 'Unknown Sender';
        const subject = subjectHeader ? subjectHeader.value : 'No Subject';
        const dateStr = dateHeader ? dateHeader.value : new Date().toISOString();
        const snippet = msgDetail.data.snippet || '';
        const unread = (msgDetail.data.labelIds || []).includes('UNREAD');
        const msgDate = new Date(dateStr).toString() !== 'Invalid Date' ? new Date(dateStr) : new Date();

        const item: GmailMessageItem = {
          id: msgRef.id,
          threadId: msgDetail.data.threadId,
          snippet,
          sender,
          subject,
          timestamp: msgDate.toISOString(),
          unread,
        };

        gmailMessages.push(item);

        // Upsert into NormalizedEvent collection
        await NormalizedEvent.findOneAndUpdate(
          { user: userId, provider: 'google', externalId: `gmail_${msgRef.id}` },
          {
            user: userId,
            source: 'gmail',
            provider: 'google',
            eventType: 'email',
            externalId: `gmail_${msgRef.id}`,
            timestamp: msgDate,
            fetchedAt: new Date(),
            title: subject,
            description: snippet,
            metadata: {
              sender,
              unread,
              threadId: msgDetail.data.threadId,
            },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`Failed to fetch details for message ${msgRef.id}`, err);
      }
    }
  } catch (err: any) {
    console.error('Failed fetching Gmail data:', err.response?.data || err.message);
  }

  // 2. Fetch Google Calendar Upcoming Events
  try {
    const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // From 1 day ago
    const calendarRes = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&singleEvents=true&orderBy=startTime&maxResults=20`,
      { headers }
    );

    const rawEvents: any[] = calendarRes.data.items || [];

    for (const evt of rawEvents) {
      if (!evt.id || !evt.summary) continue;

      const startStr = evt.start?.dateTime || evt.start?.date || new Date().toISOString();
      const endStr = evt.end?.dateTime || evt.end?.date || startStr;
      const startDate = new Date(startStr);

      const item: CalendarEventItem = {
        id: evt.id,
        summary: evt.summary,
        description: evt.description || '',
        start: startStr,
        end: endStr,
        location: evt.location || undefined,
        htmlLink: evt.htmlLink || `https://calendar.google.com/calendar/event?eid=${evt.id}`,
        calendarName: calendarRes.data.summary || 'Primary Calendar',
      };

      calendarEvents.push(item);

      // Upsert into NormalizedEvent collection
      await NormalizedEvent.findOneAndUpdate(
        { user: userId, provider: 'google', externalId: `calendar_${evt.id}` },
        {
          user: userId,
          source: 'calendar',
          provider: 'google',
          eventType: 'calendar_event',
          externalId: `calendar_${evt.id}`,
          timestamp: startDate,
          fetchedAt: new Date(),
          title: evt.summary,
          description: evt.description || '',
          metadata: {
            start: startStr,
            end: endStr,
            location: evt.location,
            htmlLink: item.htmlLink,
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (err: any) {
    console.error('Failed fetching Google Calendar data:', err.response?.data || err.message);
  }

  // Update token document lastSyncedAt
  await OAuthToken.findOneAndUpdate(
    { user: userId, provider: 'google' },
    { status: 'connected', lastSyncedAt: new Date(), lastError: undefined }
  );

  return {
    gmail: {
      unreadCount,
      messages: gmailMessages,
    },
    calendar: {
      events: calendarEvents,
    },
    lastSyncedAt: new Date().toISOString(),
  };
};
