import type { Request, Response } from 'express';
import { UserRole } from '../../generated/prisma/enums.js';
import type { TestCaseService } from './test-case.service.js';
import { isAuthenticated } from '../auth/auth.middleware.js';
import {
  createTestCaseSchema,
  problemIdParamsSchema,
  testCaseParamsSchema,
  updateTestCaseSchema,
} from './test-case.schema.js';
import { z } from 'zod';
import { NotFoundError } from '../../lib/errors.js';

const { CODER } = UserRole;

export class TestCaseController {
  private readonly testCaseService: TestCaseService;

  constructor(testCaseService: TestCaseService) {
    this.testCaseService = testCaseService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = problemIdParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const onlySamples = req.user.role === CODER;

    const result = await this.testCaseService.getAllByProblemId(parsed.data.problemId, onlySamples);

    res.status(200).json({ data: result.unwrap() });
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = testCaseParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const { id, problemId } = parsed.data;
    const result = await this.testCaseService.getById(id, problemId);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message });
      return;
    }

    const testCase = result.unwrap();

    if (req.user.role === CODER && !testCase.isSample) {
      res.status(403).json({ error: 'Test case not found' });
      return;
    }

    res.status(200).json({ data: testCase });
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsedParams = problemIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res.status(400).json({ error: z.treeifyError(parsedParams.error) });
      return;
    }

    const parsedBody = createTestCaseSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: z.treeifyError(parsedBody.error) });
      return;
    }

    const { problemId } = parsedParams.data;

    const result = await this.testCaseService.create(parsedBody.data, problemId);

    res.status(201).json({ data: result.unwrap() });
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsedParams = testCaseParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res.status(400).json({ error: z.treeifyError(parsedParams.error) });
      return;
    }

    const parsedBody = updateTestCaseSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({ error: z.treeifyError(parsedBody.error) });
      return;
    }

    const { id, problemId } = parsedParams.data;

    const result = await this.testCaseService.update(id, problemId, parsedBody.data);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message });
      return;
    }

    res.status(200).json({ data: result.unwrap() });
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const parsed = testCaseParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: z.treeifyError(parsed.error) });
      return;
    }

    const { id, problemId } = parsed.data;

    const result = await this.testCaseService.delete(id, problemId);

    if (result.isError()) {
      const resultError = result.getError();
      res
        .status(resultError instanceof NotFoundError ? 404 : 500)
        .json({ error: resultError.message });
      return;
    }

    res.status(204).send();
  }
}
