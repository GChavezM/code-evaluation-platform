import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../lib/jwt.js';
import type { AuthService } from './auth.service.js';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export const isAuthenticated = (req: Request): req is AuthenticatedRequest =>
  typeof (req as AuthenticatedRequest).user?.id === 'string';

export const createAuthenticateMiddleware = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = verifyAccessToken(token!);

      // Validate session through service layer
      const hasActiveSession = await authService.validateSession(payload.sub);

      if (!hasActiveSession) {
        res.status(401).json({ error: 'Session expired or revoked' });
        return;
      }

      (req as AuthenticatedRequest).user = {
        id: payload.sub,
        email: payload.email,
      };
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
