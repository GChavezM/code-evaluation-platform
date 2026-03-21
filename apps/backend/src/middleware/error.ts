import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
} from '../lib/errors.js';

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof NotFoundError) {
    return new AppError(error.message, 404, error.code);
  }

  if (error instanceof UnauthorizedError || error instanceof InvalidCredentialsError) {
    return new AppError(error.message, 401, error.code);
  }

  if (error instanceof ConflictError) {
    return new AppError(error.message, 409, error.code);
  }

  if (error instanceof ForbiddenError) {
    return new AppError(error.message, 403, error.code);
  }

  if (error instanceof Error) {
    return new AppError('An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR');
  }

  return new AppError('An unknown error occurred', 500, 'UNKNOWN_ERROR');
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const appError = normalizeError(error);

  const isServerError = appError.statusCode >= 500;

  const body = {
    error:
      isServerError && config.nodeEnv === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : appError.message,
    code: appError.code,
    ...(config.nodeEnv === 'development' ? { stack: appError.stack } : {}),
  };
  res.status(appError.statusCode).json(body);
};
