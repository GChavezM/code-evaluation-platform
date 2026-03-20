import type { Request, Response } from 'express';
import { signInSchema, signUpSchema } from './auth.schema.js';
import type { AuthService } from './auth.service.js';
import { ConflictError, InvalidCredentialsError, UnauthorizedError } from '../../lib/errors.js';
import config from '../../config/config.js';
import { z } from 'zod';

export class AuthController {
  private readonly authService: AuthService;

  private static readonly COOKIE_NAME = 'refreshToken';

  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict' as const,
  };

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async signUp(req: Request, res: Response): Promise<void> {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.authService.signUp(parsed.data);
    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof ConflictError ? 409 : 500)
        .json({ error: resultError?.message || 'An error occurred' });
      return;
    }

    res.status(201).json({ data: result.getValue() });
  }

  async signIn(req: Request, res: Response): Promise<void> {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.authService.signIn(parsed.data);
    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof InvalidCredentialsError ? 401 : 500)
        .json({ error: resultError?.message || 'An error occurred' });
      return;
    }

    const { user, tokens } = result.unwrap();
    res.cookie(AuthController.COOKIE_NAME, tokens.refreshToken, {
      ...AuthController.COOKIE_OPTIONS,
      maxAge: config.jwtRefreshExpiresIn * 1000,
    });
    res.status(200).json({ data: { user, accessToken: tokens.accessToken } });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const rawToken: unknown = req.cookies?.[AuthController.COOKIE_NAME];
    if (typeof rawToken !== 'string' || rawToken.trim() === '') {
      res.status(401).json({ error: 'Missing refresh token' });
      return;
    }

    const result = await this.authService.refreshToken(rawToken);
    if (result.isError()) {
      res.clearCookie(AuthController.COOKIE_NAME, AuthController.COOKIE_OPTIONS);
      const resultError = result.getError();
      res
        .status(resultError instanceof UnauthorizedError ? 401 : 500)
        .json({ error: resultError?.message || 'An error occurred' });
      return;
    }

    const tokens = result.unwrap();
    res.cookie(AuthController.COOKIE_NAME, tokens.refreshToken, {
      ...AuthController.COOKIE_OPTIONS,
      maxAge: config.jwtRefreshExpiresIn * 1000,
    });
    res.status(200).json({ data: { accessToken: tokens.accessToken } });
  }

  async signOut(req: Request, res: Response): Promise<void> {
    const rawToken: unknown = req.cookies?.[AuthController.COOKIE_NAME];
    if (typeof rawToken === 'string' && rawToken.trim() !== '') {
      await this.authService.signOut(rawToken);
    }
    res.clearCookie(AuthController.COOKIE_NAME, AuthController.COOKIE_OPTIONS);
    res.status(204).send();
  }
}
