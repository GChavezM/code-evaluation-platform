import { Router } from 'express';
import type { AuthController } from './auth.controller.js';

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  router.post('/signup', (req, res) => controller.signUp(req, res));
  router.post('/signin', (req, res) => controller.signIn(req, res));
  router.post('/refresh-token', (req, res) => controller.refreshToken(req, res));
  router.post('/signout', (req, res) => controller.signOut(req, res));

  return router;
};
