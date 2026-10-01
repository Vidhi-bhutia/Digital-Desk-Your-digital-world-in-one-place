const getGmailSummary = async (req, res) => {
  return res.status(200).json({
    success: true,
    summary: {
      unreadEmails: 12,
      importantCount: 3,
    },
    latestEmails: [
      { id: '1', sender: 'recruiter@example.com', subject: 'Interview preparation resources', time: '09:31', isImportant: true },
      { id: '2', sender: 'github@notifications.com', subject: '[GitHub] Security alert for repository', time: '08:15', isImportant: false },
      { id: '3', sender: 'team@digitaldesk.app', subject: 'Welcome to Digital Desk Phase 2!', time: 'Yesterday', isImportant: true },
    ],
  });
};

module.exports = { getGmailSummary };
