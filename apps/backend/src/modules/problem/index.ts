import type { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ProblemController } from './problem.controller.js';
import { ProblemRepository } from './problem.repository.js';
import { ProblemService } from './problem.service.js';
import { createProblemRouter } from './problem.routes.js';
import { TestCaseController } from './test-case.controller.js';
import { TestCaseRepository } from './test-case.repository.js';
import { TestCaseService } from './test-case.service.js';
import { createTestCaseRouter } from './test-case.routes.js';

const problemRepository = new ProblemRepository(prisma);
const problemService = new ProblemService(problemRepository);
const problemController = new ProblemController(problemService);

const testCaseRepository = new TestCaseRepository(prisma);
const testCaseService = new TestCaseService(testCaseRepository);
const testCaseController = new TestCaseController(testCaseService);

export const problemRouter: Router = createProblemRouter(problemController);
export const testCaseRouter: Router = createTestCaseRouter(testCaseController);

export type { CreateProblemDto, UpdateProblemDto } from './problem.schema.js';
export type { CreateTestCaseDto, UpdateTestCaseDto } from './test-case.schema.js';
