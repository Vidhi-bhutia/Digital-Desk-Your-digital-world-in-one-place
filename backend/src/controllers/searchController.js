const searchAll = async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();

  if (!query) {
    return res.status(200).json({ success: true, results: [] });
  }

  const results = [
    { type: 'task', title: 'Prepare interview', subtitle: 'Task due today, 4:00 PM', category: 'Tasks' },
    { type: 'gmail', title: 'Interview preparation resources', subtitle: 'From recruiter@example.com', category: 'Emails' },
    { type: 'calendar', title: 'Product Meeting', subtitle: 'Google Meet · 2:00 PM', category: 'Calendar' },
    { type: 'github', title: 'Digital-Desk repository', subtitle: 'Pushed changes 09:02 AM', category: 'GitHub' },
  ].filter(r => r.title.toLowerCase().includes(query) || r.subtitle.toLowerCase().includes(query));

  return res.status(200).json({
    success: true,
    query,
    results,
  });
};

module.exports = { searchAll };
