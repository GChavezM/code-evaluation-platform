import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import type { UserRole } from '../generated/prisma/enums.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, config.jwtAccessSecret);
  if (typeof payload === 'string' || !payload.sub || !payload['email'] || !payload['role']) {
    throw new Error('Malformed token payload');
  }
  return payload as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, config.jwtRefreshSecret);
  if (typeof payload === 'string' || !payload.sub || !payload.jti) {
    throw new Error('Malformed token payload');
  }
  return payload as RefreshTokenPayload;
};
