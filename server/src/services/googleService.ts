import axios from 'axios';
import { OAuthToken } from '../models/OAuthToken';

export interface GoogleOverview {
  gmail: {
    unreadCount: number;
    messages: Array<{
      id: string;
      snippet: string;
    }>;
  };
  calendar: {
    events: Array<{
      id: string;
      summary: string;
      start: string;
      end: string;
      location?: string;
      htmlLink: string;
    }>;
  };
}

export const fetchGoogleData = async (userId: string): Promise<GoogleOverview> => {
  const tokenDoc = await OAuthToken.findOne({ user: userId, provider: 'google' });
  if (!tokenDoc) {
    throw new Error('Google integration is not connected');
  }

  const token = tokenDoc.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  let unreadCount = 0;
  let messages: Array<{ id: string; snippet: string }> = [];
  let events: Array<{ id: string; summary: string; start: string; end: string; location?: string; htmlLink: string }> = [];

  // 1. Fetch Gmail Unread Counter & List
  try {
    const gmailRes = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5',
      { headers }
    );

    unreadCount = gmailRes.data.resultSizeEstimate || (gmailRes.data.messages?.length ?? 0);

    if (gmailRes.data.messages && Array.isArray(gmailRes.data.messages)) {
      const msgPromises = gmailRes.data.messages.slice(0, 3).map(async (msg: any) => {
        try {
          const mRes = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=minimal`,
            { headers }
          );
          return { id: msg.id, snippet: mRes.data.snippet || 'No preview available' };
        } catch {
          return { id: msg.id, snippet: 'Email message' };
        }
      });
      messages = await Promise.all(msgPromises);
    }
  } catch (e) {
    console.error('[Google Service] Gmail API error:', e);
  }

  // 2. Fetch Google Calendar Upcoming Events
  try {
    const now = new Date().toISOString();
    const calendarRes = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        now
      )}&maxResults=5&orderBy=startTime&singleEvents=true`,
      { headers }
    );

    if (calendarRes.data.items && Array.isArray(calendarRes.data.items)) {
      events = calendarRes.data.items.map((item: any) => ({
        id: item.id,
        summary: item.summary || 'Untitled Event',
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        location: item.location,
        htmlLink: item.htmlLink,
      }));
    }
  } catch (e) {
    console.error('[Google Service] Calendar API error:', e);
  }

  return {
    gmail: {
      unreadCount,
      messages,
    },
    calendar: {
      events,
    },
  };
};
