import { Worker, type Job } from 'bullmq';
import { EVALUATION_QUEUE_NAME, type EvaluationJobData } from '../queues/evaluation.queue.js';
import { strategyRegistry, submissionService } from '../modules/submission/index.js';
import { SubmissionStatus } from '../generated/prisma/enums.js';
import config from '../config/config.js';

async function processEvaluationJob(job: Job<EvaluationJobData>): Promise<void> {
  const { submissionId, language } = job.data;

  console.log(`[Worker] Processing submission ${submissionId} (${language})`);

  await submissionService.updateStatus(submissionId, SubmissionStatus.RUNNING);

  const contextResult = await submissionService.getExecutionContext(submissionId);
  if (contextResult.isError()) {
    throw new Error(
      `Execution context not found for submission ${submissionId}: ${contextResult.getError().message}`
    );
  }

  const context = contextResult.unwrap();

  const strategy = strategyRegistry.get(context.language);
  if (!strategy) {
    throw new Error(`No evaluation strategy found for language ${context.language}`);
  }

  const results = await strategy.execute(context, {
    onTestCaseResult: async (result, completed, total) => {
      await submissionService.appendResult(submissionId, context.userId, result);
      submissionService.emitProgress(submissionId, context.userId, completed, total);
    },
  });

  const finalizeResult = await submissionService.completeEvaluation(submissionId, results);
  if (finalizeResult.isError()) {
    throw new Error(
      `Failed to persist results for submission ${submissionId}: ${finalizeResult.getError().message}`
    );
  }

  console.log(`[Worker] Submission ${submissionId} complete`);
}

export function createEvaluationWorker() {
  const worker = new Worker<EvaluationJobData>(EVALUATION_QUEUE_NAME, processEvaluationJob, {
    connection: { url: config.redisUrl },
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Job ${job?.id ?? 'unknown'} failed: ${error.message}`);

    if (job?.data.submissionId) {
      void submissionService
        .updateStatus(job.data.submissionId, SubmissionStatus.RUNTIME_ERROR)
        .catch((err: unknown) => console.error('[Worker] Could not update status:', err));
    }
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err);
  });

  return worker;
}
