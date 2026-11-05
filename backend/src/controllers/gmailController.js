const { googleFetch } = require('../services/googleService');

const getGmailSummary = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
    const unread = await googleFetch(user, '/gmail/v1/users/me/labels/UNREAD');
    res.json({ success: true, connected: true, summary: { unreadEmails: unread.messagesUnread || 0 }, latestEmails: [] });
  } catch (error) { res.status(error.status || 502).json({ success: false, connected: false, message: error.message }); }
};

module.exports = { getGmailSummary };
