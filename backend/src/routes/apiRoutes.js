const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');

const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { getCalendarEvents, createCalendarEvent } = require('../controllers/calendarController');
const { getGmailSummary } = require('../controllers/gmailController');
const { getGitHubSummary } = require('../controllers/githubController');
const { getWeather } = require('../controllers/weatherController');
const { getActivityFeed } = require('../controllers/activityController');
const { searchAll } = require('../controllers/searchController');
const { getNowPlaying, controlPlayback } = require('../controllers/musicController');

// Protect all Phase 2 feature routes
router.use(requireAuth);

// Tasks API
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Calendar API
router.get('/calendar/events', getCalendarEvents);
router.post('/calendar/events', createCalendarEvent);

// Integrations APIs
router.get('/gmail/summary', getGmailSummary);
router.get('/github/summary', getGitHubSummary);
router.get('/weather', getWeather);

// Dashboard Activity & Universal Search APIs
router.get('/activity', getActivityFeed);
router.get('/search', searchAll);

// Music API
router.get('/music/now-playing', getNowPlaying);
router.post('/music/control', controlPlayback);

module.exports = router;
