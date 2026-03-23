import type {
  Prisma,
  PrismaClient,
  Submission,
  SubmissionResult,
  SubmissionStatus,
} from '../../generated/prisma/client.js';

export type SubmissionWithResults = Prisma.SubmissionGetPayload<{
  include: {
    submissionResults: {
      include: {
        testCase: true;
      };
    };
  };
}>;

export type SubmissionWithContext = Prisma.SubmissionGetPayload<{
  include: {
    problem: {
      include: {
        testCases: true;
      };
    };
  };
}>;

export interface ISubmissionRepository {
  findAll(filters?: { userId?: string; problemId?: string }): Promise<Submission[]>;
  findById(id: string): Promise<SubmissionWithResults | null>;
  findByIdWithContext(id: string): Promise<SubmissionWithContext | null>;
  create(data: Prisma.SubmissionUncheckedCreateInput): Promise<Submission>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;
  setQueueJobId(id: string, queueJobId: string): Promise<Submission>;
  addResult(data: Prisma.SubmissionResultUncheckedCreateInput): Promise<SubmissionResult>;
}

export class SubmissionRepository implements ISubmissionRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findAll(filters?: { userId?: string; problemId?: string }): Promise<Submission[]> {
    return this.db.submission.findMany({
      where: {
        ...(filters?.userId !== undefined ? { userId: filters.userId } : {}),
        ...(filters?.problemId !== undefined ? { problemId: filters.problemId } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<SubmissionWithResults | null> {
    return this.db.submission.findUnique({
      where: { id },
      include: {
        submissionResults: {
          include: {
            testCase: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByIdWithContext(id: string): Promise<SubmissionWithContext | null> {
    return this.db.submission.findUnique({
      where: { id },
      include: {
        problem: {
          include: {
            testCases: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  async create(data: Prisma.SubmissionUncheckedCreateInput): Promise<Submission> {
    return this.db.submission.create({ data });
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    return this.db.submission.update({
      where: { id },
      data: { status },
    });
  }

  async setQueueJobId(id: string, queueJobId: string): Promise<Submission> {
    return this.db.submission.update({
      where: { id },
      data: { queueJobId },
    });
  }

  async addResult(data: Prisma.SubmissionResultUncheckedCreateInput): Promise<SubmissionResult> {
    return this.db.submissionResult.create({ data });
  }
}
