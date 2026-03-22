import type { Problem } from '../../generated/prisma/client.js';
import type { ProblemUncheckedUpdateInput } from '../../generated/prisma/models.js';
import { NotFoundError } from '../../lib/errors.js';
import { Result } from '../../lib/result.js';
import type { IProblemRepository } from './problem.repository.js';
import type { CreateProblemDto, UpdateProblemDto } from './problem.schema.js';

export class ProblemService {
  private readonly problemRepo: IProblemRepository;

  constructor(problemRepo: IProblemRepository) {
    this.problemRepo = problemRepo;
  }

  async getAll(onlyPublished: boolean = false): Promise<Result<Problem[], never>> {
    const problems = await this.problemRepo.findAll(onlyPublished);
    return Result.ok(problems);
  }

  async getById(id: string): Promise<Result<Problem, NotFoundError>> {
    const problem = await this.problemRepo.findById(id);

    if (!problem) {
      return Result.error(new NotFoundError('Problem not found', id));
    }

    return Result.ok(problem);
  }

  async create(dto: CreateProblemDto, createdBy: string): Promise<Result<Problem, never>> {
    const problem = await this.problemRepo.create({
      ...dto,
      createdBy,
    });

    return Result.ok(problem);
  }

  async update(
    id: string,
    dto: Partial<UpdateProblemDto>
  ): Promise<Result<Problem, NotFoundError>> {
    const exists = await this.problemRepo.existsById(id);

    if (!exists) {
      return Result.error(new NotFoundError('Problem not found', id));
    }

    const problemData = { ...dto } as ProblemUncheckedUpdateInput;
    const updatedProblem = await this.problemRepo.update(id, problemData);
    return Result.ok(updatedProblem);
  }

  async delete(id: string): Promise<Result<void, NotFoundError>> {
    const exists = await this.problemRepo.existsById(id);

    if (!exists) {
      return Result.error(new NotFoundError('Problem not found', id));
    }

    await this.problemRepo.delete(id);
    return Result.ok(undefined);
  }
}
