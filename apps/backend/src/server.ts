import { createServer } from 'node:http';
import { createApp } from './app.js';
import config from './config/config.js';
import { evaluationQueue } from './queues/evaluation.queue.js';
import { createEvaluationWorker } from './workers/evaluation.worker.js';
import { createSubmissionSocketServer } from './realtime/submission.socket.js';

const app = createApp();
const httpServer = createServer(app);

const worker = createEvaluationWorker();
const socketServer = createSubmissionSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
  console.log(`[Worker] Evaluation worker started`);
  console.log('[Socket] Submission realtime server started');
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);

  await socketServer.close();
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  await worker.close();
  await evaluationQueue.close();

  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
