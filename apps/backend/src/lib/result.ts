export class Result<T, E = Error> {
  private readonly _success: boolean;
  private readonly _value: T | undefined;
  private readonly _error: E | undefined;

  private constructor(success: boolean, value?: T, error?: E) {
    this._success = success;
    this._value = value;
    this._error = error;
  }

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static error<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  isOk(): this is Result<T, never> {
    return this._success;
  }

  isError(): this is Result<never, E> {
    return !this._success;
  }

  unwrap(): T {
    if (this._success) return this._value as T;
    if (this._error instanceof Error) throw this._error;
    throw new Error(String(this._error));
  }

  unwrapOr(fallback: T): T {
    return this._success ? (this._value as T) : fallback;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._success ? Result.ok(fn(this._value as T)) : Result.error(this._error as E);
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return this._success ? Result.ok(this._value as T) : Result.error(fn(this._error as E));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._success ? fn(this._value as T) : Result.error(this._error as E);
  }

  getValue(): T | undefined {
    return this._success ? this._value : undefined;
  }

  getError(): E | undefined {
    return !this._success ? this._error : undefined;
  }
}
