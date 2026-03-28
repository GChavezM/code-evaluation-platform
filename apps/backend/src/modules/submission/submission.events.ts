import { EventEmitter } from 'node:events';
import type {
  ProgramingLanguage,
  SubmissionResult,
  SubmissionStatus,
} from '../../generated/prisma/client.js';

export type SubmissionLifecycleEvent =
  | {
      type: 'queued';
      submissionId: string;
      userId: string;
      language: ProgramingLanguage;
      queueJobId: string;
    }
  | {
      type: 'status';
      submissionId: string;
      userId: string;
      status: SubmissionStatus;
    }
  | {
      type: 'result';
      submissionId: string;
      userId: string;
      result: SubmissionResult;
    }
  | {
      type: 'progress';
      submissionId: string;
      userId: string;
      completed: number;
      total: number;
    };

class SubmissionEvents extends EventEmitter {
  emitLifecycle(event: SubmissionLifecycleEvent): boolean {
    return this.emit('submission:lifecycle', event);
  }

  onLifecycle(listener: (event: SubmissionLifecycleEvent) => void): () => void {
    this.on('submission:lifecycle', listener);
    return () => this.off('submission:lifecycle', listener);
  }
}

export const submissionEvents = new SubmissionEvents();
