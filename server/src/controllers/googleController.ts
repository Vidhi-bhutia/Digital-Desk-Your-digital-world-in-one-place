import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { AuthenticatedRequest } from '../middleware/auth';
import { OAuthToken } from '../models/OAuthToken';
import { User } from '../models/User';
import { NormalizedEvent } from '../models/NormalizedEvent';
import { fetchGoogleData, validateGoogleConnection } from '../services/googleService';

export const initiateGoogleAuth = (req: AuthenticatedRequest, res: Response): void => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !callbackUrl) {
    res.status(500).json({ success: false, message: 'Google OAuth credentials not configured on server' });
    return;
  }

  const state = req.user ? req.user._id.toString() : 'guest';
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
  ];

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&response_type=code&scope=${encodeURIComponent(
    scopes.join(' ')
  )}&access_type=offline&prompt=consent&state=${state}`;

  res.redirect(authUrl);
};

export const handleGoogleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      res.redirect(`${frontendUrl}/integrations?error=google_cancelled&reason=${encodeURIComponent(String(oauthError))}`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!code || typeof code !== 'string') {
      res.redirect(`${frontendUrl}/integrations?error=google_code_missing`);
      return;
    }

    // Exchange authorization code for tokens
    let tokenRes;
    try {
      tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
      });
    } catch (err: any) {
      console.error('Google token exchange error:', err.response?.data || err.message);
      res.redirect(`${frontendUrl}/integrations?error=google_token_exchange_failed`);
      return;
    }

    const { access_token, refresh_token, expires_in, scope } = tokenRes.data;

    if (!access_token) {
      res.redirect(`${frontendUrl}/integrations?error=google_token_missing`);
      return;
    }

    // Step 5 Verification: Validate Google API access before marking status connected
    const isValid = await validateGoogleConnection(access_token);
    if (!isValid) {
      res.redirect(`${frontendUrl}/integrations?error=google_api_validation_failed`);
      return;
    }

    let userId = state && typeof state === 'string' && state !== 'guest' ? state : null;

    if (!userId && req.cookies.jwt) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded: any = jwt.default.verify(req.cookies.jwt, process.env.JWT_SECRET || '');
        userId = decoded.id;
      } catch (e) {
        console.error('Failed to parse JWT cookie in Google OAuth callback', e);
      }
    }

    if (userId) {
      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : undefined;

      await OAuthToken.findOneAndUpdate(
        { user: userId, provider: 'google' },
        {
          accessToken: access_token,
          refreshToken: refresh_token || undefined,
          expiresAt,
          scope,
          provider: 'google',
          user: userId,
          status: 'connected',
          lastSyncedAt: new Date(),
          lastError: undefined,
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(userId, { 'connectedServices.google': true });

      // Trigger initial sync in background
      fetchGoogleData(userId).catch((err) => console.error('Initial Google sync error:', err));

      res.redirect(`${frontendUrl}/integrations?google=connected`);
    } else {
      res.redirect(`${frontendUrl}/login?error=auth_required`);
    }
  } catch (error) {
    next(error);
  }
};

export const getGoogleOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = await fetchGoogleData(req.user._id.toString());
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch Google data' });
  }
};

export const disconnectGoogle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = req.user._id;

    // Optional token revocation
    const tokenDoc = await OAuthToken.findOne({ user: userId, provider: 'google' });
    if (tokenDoc?.accessToken) {
      try {
        await axios.post(`https://oauth2.googleapis.com/revoke?token=${tokenDoc.accessToken}`);
      } catch (e) {
        // Ignore revocation error if token already invalid
      }
    }

    // Delete token and cached normalized events
    await OAuthToken.deleteOne({ user: userId, provider: 'google' });
    await NormalizedEvent.deleteMany({ user: userId, provider: 'google' });
    await User.findByIdAndUpdate(userId, { 'connectedServices.google': false });

    res.status(200).json({ success: true, message: 'Google integration disconnected successfully' });
  } catch (error) {
    next(error);
  }
};
