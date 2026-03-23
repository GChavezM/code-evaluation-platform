import { createApp } from './app.js';
import config from './config/config.js';
import { evaluationQueue } from './queues/evaluation.queue.js';
import { createEvaluationWorker } from './workers/evaluation.worker.js';

const app = createApp();

const worker = createEvaluationWorker();

app.listen(config.port, () => {
  console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
  console.log(`[Worker] Evaluation worker started`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);

  await worker.close();
  await evaluationQueue.close();

  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
