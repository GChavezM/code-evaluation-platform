import type { TestCase } from '../../generated/prisma/client.js';
import type { TestCaseUncheckedUpdateInput } from '../../generated/prisma/models.js';
import { NotFoundError } from '../../lib/errors.js';
import { Result } from '../../lib/result.js';
import type { ITestCaseRepository } from './test-case.repository.js';
import type { CreateTestCaseDto, UpdateTestCaseDto } from './test-case.schema.js';

export class TestCaseService {
  private readonly testCaseRepo: ITestCaseRepository;

  constructor(testCaseRepo: ITestCaseRepository) {
    this.testCaseRepo = testCaseRepo;
  }

  async getAllByProblemId(
    problemId: string,
    onlySamples?: boolean
  ): Promise<Result<TestCase[], never>> {
    const testCases = await this.testCaseRepo.findAllByProblemId(problemId, onlySamples);
    return Result.ok(testCases);
  }

  async getById(id: string, problemId: string): Promise<Result<TestCase, NotFoundError>> {
    const testCase = await this.testCaseRepo.findByIdAndProblemId(id, problemId);

    if (!testCase) {
      return Result.error(new NotFoundError('Test case not found', id));
    }

    return Result.ok(testCase);
  }

  async create(dto: CreateTestCaseDto, problemId: string): Promise<Result<TestCase, never>> {
    const testCase = await this.testCaseRepo.create({
      ...dto,
      problemId: problemId,
    });

    return Result.ok(testCase);
  }

  async update(
    id: string,
    problemId: string,
    dto: UpdateTestCaseDto
  ): Promise<Result<TestCase, NotFoundError>> {
    const exists = await this.testCaseRepo.existsByIdAndProblemId(id, problemId);

    if (!exists) {
      return Result.error(new NotFoundError('Test case not found', id));
    }

    const testCaseData = { ...dto } as TestCaseUncheckedUpdateInput;
    const updatedTestCase = await this.testCaseRepo.update(id, problemId, testCaseData);
    return Result.ok(updatedTestCase);
  }

  async delete(id: string, problemId: string): Promise<Result<void, NotFoundError>> {
    const exists = await this.testCaseRepo.existsByIdAndProblemId(id, problemId);

    if (!exists) {
      return Result.error(new NotFoundError('Test case not found', id));
    }

    await this.testCaseRepo.delete(id);
    return Result.ok(undefined);
  }
}
