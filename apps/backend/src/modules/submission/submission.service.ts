import type { ProgramingLanguage, Submission } from '../../generated/prisma/client.js';
import { SubmissionStatus, UserRole } from '../../generated/prisma/enums.js';
import { ForbiddenError, NotFoundError, UnsupportedLanguageError } from '../../lib/errors.js';
import { Result } from '../../lib/result.js';
import type { IEvaluationStrategyRegistry, TestCaseResult } from './strategies/index.js';
import type { ISubmissionRepository, SubmissionWithResults } from './submission.repository.js';
import type { CreateSubmissionDto, ListSubmissionsQueryDto } from './submission.schema.js';
import { submissionEvents } from './submission.events.js';

export interface SubmissionExecutionContext {
  submissionId: string;
  userId: string;
  sourceCode: string;
  language: ProgramingLanguage;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
}

export class SubmissionService {
  private readonly submissionRepo: ISubmissionRepository;
  private readonly strategyRegistry: IEvaluationStrategyRegistry;

  constructor(
    submissionRepo: ISubmissionRepository,
    strategyRegistry: IEvaluationStrategyRegistry
  ) {
    this.submissionRepo = submissionRepo;
    this.strategyRegistry = strategyRegistry;
  }

  async create(
    dto: CreateSubmissionDto,
    userId: string
  ): Promise<Result<Submission, UnsupportedLanguageError>> {
    const strategy = this.strategyRegistry.get(dto.language as ProgramingLanguage);

    if (!strategy) {
      return Result.error(new UnsupportedLanguageError(dto.language));
    }

    const submission = await this.submissionRepo.create({
      sourceCode: dto.sourceCode,
      language: dto.language,
      problemId: dto.problemId,
      userId,
    });

    const jobId = await strategy.enqueue(submission);
    const queuedSubmission = await this.submissionRepo.setQueueJobId(submission.id, jobId);

    submissionEvents.emitLifecycle({
      type: 'queued',
      submissionId: queuedSubmission.id,
      userId: queuedSubmission.userId,
      language: queuedSubmission.language,
      queueJobId: jobId,
    });

    return Result.ok(queuedSubmission);
  }

  async getAll(
    requestingUserId: string,
    role: UserRole,
    filters?: ListSubmissionsQueryDto
  ): Promise<Result<Submission[], never>> {
    if (role === UserRole.CODER) {
      const submissions = await this.submissionRepo.findAll({
        userId: requestingUserId,
        ...(filters?.problemId !== undefined ? { problemId: filters.problemId } : {}),
      });
      return Result.ok(submissions);
    }

    const submissions = await this.submissionRepo.findAll(
      filters
        ? {
            ...(filters.userId !== undefined ? { userId: filters.userId } : {}),
            ...(filters.problemId !== undefined ? { problemId: filters.problemId } : {}),
          }
        : undefined
    );
    return Result.ok(submissions);
  }

  async getById(
    id: string,
    requestingUserId: string,
    role: UserRole
  ): Promise<Result<SubmissionWithResults, NotFoundError | ForbiddenError>> {
    const submission = await this.submissionRepo.findById(id);

    if (!submission) {
      return Result.error(new NotFoundError('Submission', id));
    }

    if (role === UserRole.CODER && submission.userId !== requestingUserId) {
      return Result.error(new ForbiddenError('Access denied'));
    }

    return Result.ok(submission);
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Result<Submission, NotFoundError>> {
    const submission = await this.submissionRepo.findById(id);

    if (!submission) {
      return Result.error(new NotFoundError('Submission', id));
    }

    const updated = await this.submissionRepo.updateStatus(id, status);

    submissionEvents.emitLifecycle({
      type: 'status',
      submissionId: updated.id,
      userId: updated.userId,
      status: updated.status,
    });

    return Result.ok(updated);
  }

  async getExecutionContext(
    submissionId: string
  ): Promise<Result<SubmissionExecutionContext, NotFoundError>> {
    const submission = await this.submissionRepo.findByIdWithContext(submissionId);

    if (!submission) {
      return Result.error(new NotFoundError('Submission', submissionId));
    }

    return Result.ok({
      submissionId: submission.id,
      userId: submission.userId,
      sourceCode: submission.sourceCode,
      language: submission.language,
      timeLimitMs: submission.problem.timeLimitMs,
      memoryLimitMb: submission.problem.memoryLimitMb,
      testCases: submission.problem.testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    });
  }

  async finalizeResults(
    submissionId: string,
    results: TestCaseResult[]
  ): Promise<Result<void, NotFoundError>> {
    const exists = await this.submissionRepo.findById(submissionId);

    if (!exists) {
      return Result.error(new NotFoundError('Submission', submissionId));
    }

    for (const result of results) {
      await this.appendResult(submissionId, exists.userId, result);
    }

    await this.completeEvaluation(submissionId, results);

    return Result.ok(undefined);
  }

  async appendResult(submissionId: string, userId: string, result: TestCaseResult): Promise<void> {
    const storedResult = await this.submissionRepo.addResult({
      submissionId,
      testCaseId: result.testCaseId,
      status: result.status,
      actualOutput: result.actualOutput,
      executionTimeMs: result.executionTimeMs,
      memoryUsedMb: result.memoryUsageMb,
    });

    submissionEvents.emitLifecycle({
      type: 'result',
      submissionId,
      userId,
      result: storedResult,
    });
  }

  emitProgress(submissionId: string, userId: string, completed: number, total: number): void {
    submissionEvents.emitLifecycle({
      type: 'progress',
      submissionId,
      userId,
      completed,
      total,
    });
  }

  async completeEvaluation(
    submissionId: string,
    results: TestCaseResult[]
  ): Promise<Result<void, NotFoundError>> {
    const finalStatus = this.determineFinalStatus(results);
    const statusResult = await this.updateStatus(submissionId, finalStatus);

    if (statusResult.isError()) {
      return Result.error(statusResult.getError());
    }

    return Result.ok(undefined);
  }

  private determineFinalStatus(results: TestCaseResult[]): SubmissionStatus {
    const statuses = results.map((r) => r.status);

    const priority: SubmissionStatus[] = [
      SubmissionStatus.COMPILATION_ERROR,
      SubmissionStatus.TIME_LIMIT_EXCEEDED,
      SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
      SubmissionStatus.RUNTIME_ERROR,
      SubmissionStatus.WRONG_ANSWER,
      SubmissionStatus.ACCEPTED,
    ];

    for (const status of priority) {
      if (statuses.includes(status)) {
        return status;
      }
    }

    return SubmissionStatus.ACCEPTED;
  }
}
