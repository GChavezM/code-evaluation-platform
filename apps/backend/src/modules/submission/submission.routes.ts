import { Router } from 'express';
import { authenticate } from '../auth/index.js';
import type { SubmissionController } from './submission.controller.js';

export const createSubmissionRouter = (controller: SubmissionController): Router => {
  const router = Router();

  router.post('/', authenticate, (req, res) => controller.create(req, res));
  router.get('/', authenticate, (req, res) => controller.getAll(req, res));
  router.get('/:id', authenticate, (req, res) => controller.getById(req, res));

  return router;
};
