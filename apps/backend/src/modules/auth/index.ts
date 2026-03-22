import type { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { createAuthRouter } from './auth.routes.js';
import { createAuthenticateMiddleware } from './auth.middleware.js';

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);
export const authenticate = createAuthenticateMiddleware();

export const authRouter: Router = createAuthRouter(authController);

export type { AuthTokens, AuthUser } from './auth.service.js';
export type { SignUpDto, SignInDto } from './auth.schema.js';
export { isAuthenticated, requireRole } from './auth.middleware.js';
export { authService };
