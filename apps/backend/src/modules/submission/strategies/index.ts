import type { ProgramingLanguage } from '../../../generated/prisma/enums.js';
import type { IEvaluationStrategy } from './evaluation.strategy.js';

export type {
  EvaluationExecutionHooks,
  IEvaluationStrategy,
  SubmissionExcecutionContext,
  TestCaseResult,
} from './evaluation.strategy.js';

export interface IEvaluationStrategyRegistry {
  get(language: ProgramingLanguage): IEvaluationStrategy | undefined;
  register(strategy: IEvaluationStrategy): void;
}

export class EvaluationStrategyRegistry implements IEvaluationStrategyRegistry {
  private readonly strategies = new Map<ProgramingLanguage, IEvaluationStrategy>();

  register(strategy: IEvaluationStrategy): void {
    this.strategies.set(strategy.language, strategy);
  }

  get(language: ProgramingLanguage): IEvaluationStrategy | undefined {
    return this.strategies.get(language);
  }
}
