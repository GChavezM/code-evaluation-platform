import type { Prisma, PrismaClient, Problem } from '../../generated/prisma/client.js';

export type ProblemWithTestCases = Prisma.ProblemGetPayload<{
  include: { testCases: true };
}>;

export interface IProblemRepository {
  findAll(onlyPublished?: boolean): Promise<Problem[]>;
  findById(id: string): Promise<ProblemWithTestCases | null>;
  create(data: Prisma.ProblemUncheckedCreateInput): Promise<Problem>;
  update(id: string, data: Prisma.ProblemUncheckedUpdateInput): Promise<Problem>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}

export class ProblemRepository implements IProblemRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findAll(onlyPublished?: boolean): Promise<Problem[]> {
    return this.db.problem.findMany({
      where: {
        ...(onlyPublished ? { isPublished: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ProblemWithTestCases | null> {
    return this.db.problem.findUnique({
      where: { id },
      include: { testCases: { orderBy: { order: 'asc' } } },
    });
  }

  async create(data: Prisma.ProblemUncheckedCreateInput): Promise<Problem> {
    return this.db.problem.create({ data });
  }

  async update(id: string, data: Prisma.ProblemUncheckedUpdateInput): Promise<Problem> {
    return this.db.problem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.problem.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.db.problem.count({ where: { id } });
    return count > 0;
  }
}
