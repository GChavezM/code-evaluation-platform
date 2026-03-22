import { randomUUID } from 'crypto';
import type { ProgramingLanguage } from '../generated/prisma/enums.js';

export interface EvaluationJobData {
  submissionId: string;
  sourceCode: string;
  language: ProgramingLanguage;
  problemId: string;
}

export interface IEvaluationQueue {
  add(jobData: EvaluationJobData): Promise<string>;
}

export class EvaluationQueue implements IEvaluationQueue {
  async add(jobData: EvaluationJobData): Promise<string> {
    // TODO
    console.log('Adding job to evaluation queue:', jobData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return randomUUID();
  }
}

export const evaluationQueue = new EvaluationQueue();
