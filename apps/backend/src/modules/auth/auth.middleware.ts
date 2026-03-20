import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../lib/jwt.js';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export const isAuthenticated = (req: Request): req is AuthenticatedRequest =>
  typeof (req as AuthenticatedRequest).user?.id === 'string';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token!);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
