const logger = require('../utils/logger');

const getGitHubSummary = async (req, res) => {
  const username = req.query.username || 'Vidhi-bhutia';

  try {
    const url = `https://api.github.com/users/${username}/events/public?per_page=10`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Digital-Desk-App',
      },
    });

    if (response.ok) {
      const events = await response.json();
      if (Array.isArray(events) && events.length > 0) {
        const formatted = events.slice(0, 5).map((ev) => {
          const time = new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          let action = 'GitHub Activity';
          let detail = ev.repo?.name || 'Repository activity';

          if (ev.type === 'PushEvent') {
            action = `Pushed ${ev.payload?.commits?.length || 1} commit(s)`;
            detail = ev.payload?.commits[0]?.message || detail;
          } else if (ev.type === 'PullRequestEvent') {
            action = `Pull Request ${ev.payload?.action}`;
            detail = ev.payload?.pull_request?.title || detail;
          } else if (ev.type === 'CreateEvent') {
            action = `Created ${ev.payload?.ref_type}`;
            detail = ev.payload?.ref || detail;
          }

          return {
            id: ev.id,
            action,
            detail,
            time,
            repo: ev.repo?.name,
          };
        });

        return res.status(200).json({
          success: true,
          summary: {
            activityToday: events.length,
            openPullRequests: 2,
          },
          activities: formatted,
          isLive: true,
        });
      }
    }
  } catch (err) {
    logger.warn('GitHub API request failed, serving default activity:', err.message);
  }

  // Default fallback data if offline or username has no public events
  return res.status(200).json({
    success: true,
    summary: {
      activityToday: 8,
      openPullRequests: 2,
    },
    activities: [
      { id: '1', action: 'Pushed changes to Digital-Desk', detail: 'feat: update home UI', time: '09:02', repo: 'Digital-Desk' },
      { id: '2', action: 'New pull request opened', detail: 'fix: resolve authentication issue', time: '11:24', repo: 'Digital-Desk' },
      { id: '3', action: 'Merged PR #14', detail: 'refactor: modularize API routes', time: 'Yesterday', repo: 'Digital-Desk' },
    ],
    isLive: false,
  });
};

module.exports = { getGitHubSummary };
