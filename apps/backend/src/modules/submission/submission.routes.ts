import { Router } from 'express';
import { authenticate, requireRole } from '../auth/index.js';
import { UserRole } from '../../generated/prisma/enums.js';
import type { SubmissionController } from './submission.controller.js';

export const createSubmissionRouter = (controller: SubmissionController): Router => {
  const router = Router();

  router.post('/', authenticate, requireRole(UserRole.CODER), (req, res) =>
    controller.create(req, res)
  );
  router.get('/', authenticate, (req, res) => controller.getAll(req, res));
  router.get('/:id', authenticate, (req, res) => controller.getById(req, res));

  return router;
};
