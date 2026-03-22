import express, { type Express } from 'express';
import cors, { type CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import { authRouter } from './modules/auth/index.js';
import { errorHandler } from './middleware/error.js';
import { prisma } from './lib/prisma.js';

const allowedOrigins: string[] = [config.frontendUrl];

export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ): void => {
    if (origin === undefined) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },

  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600,
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

export const createApp = (): Express => {
  const app = express();

  app.use(cors(corsOptions));

  app.use(express.json());

  app.use(cookieParser());

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: 'error', timestamp: new Date().toISOString() });
    }
  });

  app.use('/api/auth', authRouter);

  app.use(errorHandler);

  return app;
};
