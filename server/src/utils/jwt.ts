import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const sendTokenCookie = (
  user: IUser,
  statusCode: number,
  res: Response,
  message: string
): void => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const token = jwt.sign({ id: user._id.toString() }, secret, {
    expiresIn: '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`,
      connectedServices: user.connectedServices || { github: false, google: false },
      createdAt: user.createdAt,
    },
  });
};
