import { Router } from 'express';
import { UserRole } from '../../generated/prisma/enums.js';
import type { TestCaseController } from './test-case.controller.js';
import { authenticate, requireRole } from '../auth/index.js';

const { EVALUATOR } = UserRole;

export const createTestCaseRouter = (controller: TestCaseController): Router => {
  const router = Router({ mergeParams: true });

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
