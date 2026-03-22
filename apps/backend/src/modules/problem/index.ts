import type { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ProblemController } from './problem.controller.js';
import { ProblemRepository } from './problem.repository.js';
import { ProblemService } from './problem.service.js';
import { createProblemRouter } from './problem.routes.js';

const problemRepository = new ProblemRepository(prisma);
const problemService = new ProblemService(problemRepository);
const problemController = new ProblemController(problemService);

export const problemRouter: Router = createProblemRouter(problemController);

export type { CreateProblemDto, UpdateProblemDto } from './problem.schema.js';
