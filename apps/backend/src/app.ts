import express, { type Express } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  })
);

export default app;
