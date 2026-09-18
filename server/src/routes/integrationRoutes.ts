import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  getGitHubOverview,
  disconnectGitHub,
} from '../controllers/githubController';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getGoogleOverview,
  disconnectGoogle,
} from '../controllers/googleController';
import { getWeather } from '../controllers/weatherController';

const router = Router();

// GitHub OAuth & Data Endpoints
router.get('/github/auth', protect, initiateGitHubAuth);
router.get('/github/callback', handleGitHubCallback);
router.get('/github/overview', protect, getGitHubOverview);
router.delete('/github/disconnect', protect, disconnectGitHub);

// Google OAuth (Gmail & Calendar) & Data Endpoints
router.get('/google/auth', protect, initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/google/overview', protect, getGoogleOverview);
router.delete('/google/disconnect', protect, disconnectGoogle);

// Weather Proxy Endpoint
router.get('/weather', getWeather);

export default router;
