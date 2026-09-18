import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AuthenticatedRequest } from '../middleware/auth';
import { OAuthToken } from '../models/OAuthToken';
import { User } from '../models/User';
import { fetchGitHubData } from '../services/githubService';

export const initiateGitHubAuth = (req: AuthenticatedRequest, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;

  if (!clientId || !callbackUrl) {
    res.status(500).json({ success: false, message: 'GitHub OAuth credentials not configured' });
    return;
  }

  // Encode user ID into state if available, or generate state
  const state = req.user ? req.user._id.toString() : 'guest';
  const scope = 'read:user repo';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authUrl);
};

export const handleGitHubCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, state } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!code || typeof code !== 'string') {
      res.redirect(`${frontendUrl}/settings?error=github_code_missing`);
      return;
    }

    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      res.redirect(`${frontendUrl}/settings?error=github_token_exchange_failed`);
      return;
    }

    // Associate token with user (from state or current cookies)
    let userId = state && typeof state === 'string' && state !== 'guest' ? state : null;

    if (!userId && req.cookies.jwt) {
      // Decode JWT token if state is guest
      try {
        const jwt = await import('jsonwebtoken');
        const decoded: any = jwt.default.verify(req.cookies.jwt, process.env.JWT_SECRET || '');
        userId = decoded.id;
      } catch (e) {
        console.error('Failed to parse JWT cookie in OAuth callback', e);
      }
    }

    if (userId) {
      await OAuthToken.findOneAndUpdate(
        { user: userId, provider: 'github' },
        { accessToken, provider: 'github', user: userId },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(userId, { 'connectedServices.github': true });
      res.redirect(`${frontendUrl}/settings?github=connected`);
    } else {
      res.redirect(`${frontendUrl}/login?error=auth_required`);
    }
  } catch (error) {
    next(error);
  }
};

export const getGitHubOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = await fetchGitHubData(req.user._id.toString());
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch GitHub overview' });
  }
};

export const disconnectGitHub = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await OAuthToken.deleteOne({ user: req.user._id, provider: 'github' });
    await User.findByIdAndUpdate(req.user._id, { 'connectedServices.github': false });

    res.status(200).json({ success: true, message: 'GitHub integration disconnected successfully' });
  } catch (error) {
    next(error);
  }
};
