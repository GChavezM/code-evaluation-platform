import type { Request, Response } from 'express';
import { z } from 'zod';
import { ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { isAuthenticated } from '../auth/auth.middleware.js';
import type { SubmissionService } from './submission.service.js';
import {
  createSubmissionSchema,
  listSubmissionsQuerySchema,
  submissionIdSchema,
} from './submission.shema.js';

export class SubmissionController {
  private readonly submissionService: SubmissionService;

  constructor(submissionService: SubmissionService) {
    this.submissionService = submissionService;
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = createSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.submissionService.create(parsed.data, req.user.id);

    res.status(202).json({ data: result.unwrap() });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = listSubmissionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.submissionService.getAll(req.user.id, req.user.role, parsed.data);

    res.status(200).json({ data: result.unwrap() });
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = submissionIdSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.submissionService.getById(parsed.data.id, req.user.id, req.user.role);

    if (result.isError()) {
      const error = result.getError();
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'An unexpected error occurred' });
      return;
    }

    res.status(200).json({ data: result.unwrap() });
  }
}
