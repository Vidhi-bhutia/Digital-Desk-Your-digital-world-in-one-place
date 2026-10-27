const { googleFetch } = require('../services/googleService');

const getGmailSummary = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
    const [unread, list] = await Promise.all([
      googleFetch(user, '/gmail/v1/users/me/labels/UNREAD'),
      googleFetch(user, '/gmail/v1/users/me/messages?q=is%3Aunread&maxResults=5'),
    ]);
    const latestEmails = await Promise.all((list.messages || []).map(async item => {
      const m = await googleFetch(user, `/gmail/v1/users/me/messages/${encodeURIComponent(item.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
      const headers = Object.fromEntries((m.payload?.headers || []).map(h => [h.name.toLowerCase(), h.value]));
      const sender = headers.from || 'Unknown sender';
      const match = sender.match(/^(.*?)\s*<([^>]+)>$/);
      return { id: m.id, sender: match?.[1]?.replaceAll('"', '') || sender, email: match?.[2] || sender, subject: headers.subject || '(no subject)', timestamp: headers.date || '', snippet: m.snippet || '', url: `https://mail.google.com/mail/u/0/#all/${m.id}`, isUnread: true };
    }));
    res.json({ success: true, connected: true, summary: { unreadEmails: unread.messagesUnread || 0 }, latestEmails });
  } catch (error) { res.status(error.status || 502).json({ success: false, connected: false, message: error.message }); }
};

module.exports = { getGmailSummary };
