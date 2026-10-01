const getActivityFeed = async (req, res) => {
  const activities = [
    {
      id: '1',
      time: '09:02',
      type: 'github',
      icon: 'github',
      title: 'Pushed changes to Digital-Desk',
      detail: 'feat: update home UI',
    },
    {
      id: '2',
      time: '09:31',
      type: 'gmail',
      icon: 'gmail',
      title: 'New email from recruiter@example.com',
      detail: '"Interview preparation resources"',
    },
    {
      id: '3',
      time: '10:00',
      type: 'calendar',
      icon: 'calendar',
      title: 'Product meeting',
      detail: 'Google Meet · 1 hour',
    },
    {
      id: '4',
      time: '11:24',
      type: 'github',
      icon: 'github',
      title: 'New pull request opened',
      detail: 'fix: resolve authentication issue',
    },
    {
      id: '5',
      time: '12:04',
      type: 'task',
      icon: 'task',
      title: 'Completed task',
      detail: '"Update portfolio"',
    },
  ];

  return res.status(200).json({
    success: true,
    activities,
  });
};

module.exports = { getActivityFeed };
