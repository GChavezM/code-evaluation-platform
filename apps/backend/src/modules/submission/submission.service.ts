import type { Submission } from '../../generated/prisma/client.js';
import { SubmissionStatus, UserRole } from '../../generated/prisma/enums.js';
import { ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { Result } from '../../lib/result.js';
import type { IEvaluationQueue } from '../../queues/evaluation.queue.js';
import type { ISubmissionRepository, SubmissionWithResults } from './submission.repository.js';
import type { CreateSubmissionDto, ListSubmissionsQueryDto } from './submission.shema.js';

export class SubmissionService {
  private readonly submissionRepo: ISubmissionRepository;
  private readonly evaluationQueue: IEvaluationQueue;

  constructor(submissionRepo: ISubmissionRepository, evaluationQueue: IEvaluationQueue) {
    this.submissionRepo = submissionRepo;
    this.evaluationQueue = evaluationQueue;
  }

  async create(dto: CreateSubmissionDto, userId: string): Promise<Result<Submission, never>> {
    const submission = await this.submissionRepo.create({
      sourceCode: dto.sourceCode,
      language: dto.language,
      problemId: dto.problemId,
      userId,
    });

    const jobId = await this.evaluationQueue.add({
      submissionId: submission.id,
      sourceCode: submission.sourceCode,
      language: submission.language,
      problemId: submission.problemId,
    });

    const queued = await this.submissionRepo.setQueueJobId(submission.id, jobId);

    return Result.ok(queued);
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
    return Result.ok(updated);
  }
}
