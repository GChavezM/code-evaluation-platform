import type { Request, Response } from 'express';
import { isAuthenticated } from '../auth/auth.middleware.js';
import type { ProblemService } from './problem.service.js';
import {
  createProblemSchema,
  problemIdSchema,
  updateProblemSchema,
  type UpdateProblemDto,
} from './problem.schema.js';
import { z } from 'zod';
import { NotFoundError } from '../../lib/errors.js';

export class ProblemController {
  private readonly problemService: ProblemService;

  constructor(problemService: ProblemService) {
    this.problemService = problemService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const onlyPublished = !isAuthenticated(req);
    const result = await this.problemService.getAll(onlyPublished);
    res.status(200).json({ data: result.unwrap() });
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = problemIdSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.problemService.getById(parsed.data.id);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message || 'An error occurred' });
      return;
    }

    res.status(200).json({ data: result.unwrap() });
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = createProblemSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const { id: userId } = req.user;
    const result = await this.problemService.create(parsed.data, userId);

    res.status(201).json({ data: result.unwrap() });
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsedParams = problemIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res.status(400).json({ error: z.treeifyError(parsedParams.error) });
      return;
    }

    const parsedBody = updateProblemSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: z.treeifyError(parsedBody.error) });
      return;
    }

    const updateDto = parsedBody.data satisfies UpdateProblemDto;

    const result = await this.problemService.update(parsedParams.data.id, updateDto);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message || 'An error occurred' });
      return;
    }

    res.status(200).json({ data: result.unwrap() });
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = problemIdSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const result = await this.problemService.delete(parsed.data.id);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message || 'An error occurred' });
      return;
    }

    res.status(204).send();
  }
}
