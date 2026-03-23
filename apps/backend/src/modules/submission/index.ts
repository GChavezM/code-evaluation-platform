import type { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { SubmissionController } from './submission.controller.js';
import { SubmissionRepository } from './submission.repository.js';
import { SubmissionService } from './submission.service.js';
import { createSubmissionRouter } from './submission.routes.js';
import { EvaluationStrategyRegistry } from './strategies/index.js';
import { PythonEvaluationStrategy } from './strategies/python.evaluation.strategy.js';
import { evaluationQueue } from '../../queues/evaluation.queue.js';

export const strategyRegistry = new EvaluationStrategyRegistry();
strategyRegistry.register(new PythonEvaluationStrategy(evaluationQueue));

const submissionRepository = new SubmissionRepository(prisma);
const submissionService = new SubmissionService(submissionRepository, strategyRegistry);
const submissionController = new SubmissionController(submissionService);

export const submissionRouter: Router = createSubmissionRouter(submissionController);

export { submissionService };
export type { CreateSubmissionDto, ListSubmissionsQueryDto } from './submission.shema.js';
export type { SubmissionWithResults } from './submission.repository.js';
