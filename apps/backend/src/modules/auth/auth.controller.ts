import type { Request, Response } from 'express';
import { refreshTokenSchema, signInSchema, signUpSchema } from './auth.schema.js';
import type { AuthService } from './auth.service.js';
import { ConflictError, InvalidCredentialsError, UnauthorizedError } from '../../lib/errors.js';
import { z } from 'zod';

export class AuthController {
  private readonly authService: AuthService;

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

    res.status(200).json({ data: result.getValue() });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.authService.refreshToken(parsed.data.refreshToken);
    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof UnauthorizedError ? 401 : 500)
        .json({ error: resultError?.message || 'An error occurred' });
      return;
    }

    res.status(200).json({ data: result.getValue() });
  }

  async signOut(req: Request, res: Response): Promise<void> {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    await this.authService.signOut(parsed.data.refreshToken);
    res.status(204).send();
  }
}
