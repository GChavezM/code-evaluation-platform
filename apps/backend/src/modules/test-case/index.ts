import type { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { TestCaseController } from './test-case.controller.js';
import { TestCaseRepository } from './test-case.repository.js';
import { createTestCaseRouter } from './test-case.routes.js';
import { TestCaseService } from './test-case.service.js';

const testCaseRepository = new TestCaseRepository(prisma);
const testCaseService = new TestCaseService(testCaseRepository);
const testCaseController = new TestCaseController(testCaseService);

export const testCaseRouter: Router = createTestCaseRouter(testCaseController);

export type { CreateTestCaseDto, UpdateTestCaseDto } from './test-case.schema.js';
