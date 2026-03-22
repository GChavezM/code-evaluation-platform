import type { Prisma, PrismaClient, TestCase } from '../../generated/prisma/client.js';

export interface ITestCaseRepository {
  findAllByProblemId(problemId: string, onlySamples?: boolean): Promise<TestCase[]>;
  findByIdAndProblemId(id: string, problemId: string): Promise<TestCase | null>;
  create(data: Prisma.TestCaseUncheckedCreateInput): Promise<TestCase>;
  update(
    id: string,
    problemId: string,
    data: Prisma.TestCaseUncheckedUpdateInput
  ): Promise<TestCase>;
  delete(id: string): Promise<void>;
  existsByIdAndProblemId(id: string, problemId: string): Promise<boolean>;
}

export class TestCaseRepository implements ITestCaseRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findAllByProblemId(problemId: string, onlySamples?: boolean): Promise<TestCase[]> {
    return this.db.testCase.findMany({
      where: {
        problemId,
        ...(onlySamples ? { isSample: true } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByIdAndProblemId(id: string, problemId: string): Promise<TestCase | null> {
    return this.db.testCase.findFirst({ where: { id, problemId } });
  }

  async create(data: Prisma.TestCaseUncheckedCreateInput): Promise<TestCase> {
    return this.db.testCase.create({ data });
  }
  async update(
    id: string,
    problemId: string,
    data: Prisma.TestCaseUncheckedUpdateInput
  ): Promise<TestCase> {
    return this.db.testCase.update({
      where: { id, problemId },
      data,
    });
  }
  async delete(id: string): Promise<void> {
    await this.db.testCase.delete({ where: { id } });
  }
  async existsByIdAndProblemId(id: string, problemId: string): Promise<boolean> {
    const count = await this.db.testCase.count({ where: { id, problemId } });
    return count > 0;
  }
}
