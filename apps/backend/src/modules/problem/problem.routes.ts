import { Router } from 'express';
import type { ProblemController } from './problem.controller.js';
import { authenticate } from '../auth/index.js';

export const createProblemRouter = (controller: ProblemController): Router => {
  const router = Router();

  router.get('/', authenticate, (req, res) => controller.getAll(req, res));
  router.get('/:id', authenticate, (req, res) => controller.getById(req, res));
  router.post('/', authenticate, (req, res) => controller.create(req, res));
  router.patch('/:id', authenticate, (req, res) => controller.update(req, res));
  router.delete('/:id', authenticate, (req, res) => controller.delete(req, res));

  return router;
};
