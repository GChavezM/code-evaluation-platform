export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" was not found.`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  readonly code = 'CONFLICT';
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = 'INVALID_CREDENTIALS';
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class ForbiddenError extends Error {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Access denied.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnsupportedLanguageError extends Error {
  readonly code = 'UNSUPPORTED_LANGUAGE';
  constructor(language: string) {
    super(`The programming language "${language}" is not supported.`);
    this.name = 'UnsupportedLanguageError';
  }
}
