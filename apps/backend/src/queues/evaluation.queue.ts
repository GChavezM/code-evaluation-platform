import type { ProgramingLanguage } from '../generated/prisma/enums.js';
import { Queue } from 'bullmq';

export const EVALUATION_QUEUE_NAME = 'evaluation';
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
  private readonly queue: Queue<EvaluationJobData>;

  constructor() {
    this.queue = new Queue<EvaluationJobData>(EVALUATION_QUEUE_NAME);
  }

  async add(jobData: EvaluationJobData): Promise<string> {
    const job = await this.queue.add(EVALUATION_QUEUE_NAME, jobData, {
      jobId: jobData.submissionId,
    });

    return job.id ?? jobData.submissionId;
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

export const evaluationQueue = new EvaluationQueue();
