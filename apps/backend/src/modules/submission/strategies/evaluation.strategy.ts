import type { Submission } from '../../../generated/prisma/client.js';
import type { ProgramingLanguage, SubmissionStatus } from '../../../generated/prisma/enums.js';

export interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface TestCaseResult {
  testCaseId: string;
  status: SubmissionStatus;
  actualOutput: string | null;
  executionTimeMs: number | null;
  memoryUsageMb: number | null;
}

export interface EvaluationExecutionHooks {
  onTestCaseResult?: (result: TestCaseResult, index: number, total: number) => Promise<void> | void;
}

export interface SubmissionExcecutionContext {
  submissionId: string;
  sourceCode: string;
  language: ProgramingLanguage;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases: TestCaseInput[];
}

export interface IEvaluationStrategy {
  readonly language: ProgramingLanguage;

  enqueue(submission: Submission): Promise<string>;
  execute(
    context: SubmissionExcecutionContext,
    hooks?: EvaluationExecutionHooks
  ): Promise<TestCaseResult[]>;
}
