import { Router } from 'express';
import type { ProblemController } from './problem.controller.js';
import { authenticate, requireRole } from '../auth/index.js';
import { UserRole } from '../../generated/prisma/enums.js';

const { EVALUATOR } = UserRole;

export const createProblemRouter = (controller: ProblemController): Router => {
  const router = Router();

  router.get('/', authenticate, (req, res) => controller.getAll(req, res));
  router.get('/:id', authenticate, (req, res) => controller.getById(req, res));
  router.post('/', authenticate, requireRole(EVALUATOR), (req, res) => controller.create(req, res));
  router.patch('/:id', authenticate, requireRole(EVALUATOR), (req, res) =>
    controller.update(req, res)
  );
  router.delete('/:id', authenticate, requireRole(EVALUATOR), (req, res) =>
    controller.delete(req, res)
  );

  return router;
};
