import bcrypt from 'bcryptjs';
import type { SignInDto, SignUpDto } from './auth.schema.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import type { IAuthRepository } from './auth.repository.js';
import { Result } from '../../lib/result.js';
import { ConflictError, InvalidCredentialsError, UnauthorizedError } from '../../lib/errors.js';
import type { User } from '../../generated/prisma/client.js';
import { randomUUID } from 'crypto';
import config from '../../config/config.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
}

const SALT_ROUNDS = 12;

export class AuthService {
  private readonly authRepo: IAuthRepository;

  constructor(authRepo: IAuthRepository) {
    this.authRepo = authRepo;
  }

  async signUp(
    dto: SignUpDto
  ): Promise<Result<{ user: AuthUser; tokens: AuthTokens }, ConflictError>> {
    const existingUser = await this.authRepo.findUserByEmail(dto.email);

    if (existingUser) {
      return Result.error(new ConflictError('User already exists'));
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const { email, name, lastName } = dto;
    const user = await this.authRepo.createUser({
      email,
      name: name ?? null,
      lastName: lastName ?? null,
      password: hashedPassword,
    });
    const tokens = await this.issueTokens(user);

    return Result.ok({ user: this.toAuthUser(user), tokens });
  }

  async signIn(
    dto: SignInDto
  ): Promise<Result<{ user: AuthUser; tokens: AuthTokens }, InvalidCredentialsError>> {
    const user = await this.authRepo.findUserByEmail(dto.email);

    if (user === null) {
      return Result.error(new InvalidCredentialsError());
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      return Result.error(new InvalidCredentialsError());
    }

    const tokens = await this.issueTokens(user);
    return Result.ok({ user: this.toAuthUser(user), tokens });
  }

  async refreshToken(rawToken: string): Promise<Result<AuthTokens, UnauthorizedError>> {
    let payload: { sub: string; jti: string };

    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      return Result.error(new UnauthorizedError('Invalid refresh token'));
    }

    const stored = await this.authRepo.findRefreshToken(rawToken);
    if (!stored || stored.userId !== payload.sub) {
      await this.authRepo.deleteAllUserRefreshTokens(payload.sub);
      return Result.error(new UnauthorizedError('Refresh token reuse detected'));
    }

    if (stored.expiresAt < new Date()) {
      await this.authRepo.deleteRefreshToken(stored.id);
      return Result.error(new UnauthorizedError('Refresh token expired'));
    }

    const user = await this.authRepo.findUserById(payload.sub);
    if (!user) {
      return Result.error(new UnauthorizedError('User not found'));
    }

    await this.authRepo.deleteRefreshToken(stored.id);

    const tokens = await this.issueTokens(user);
    return Result.ok(tokens);
  }

  async signOut(refreshToken: string): Promise<void> {
    const stored = await this.authRepo.findRefreshToken(refreshToken);
    if (stored) {
      await this.authRepo.deleteAllUserRefreshTokens(stored.userId);
    }
  }

  async validateSession(userId: string): Promise<boolean> {
    return await this.authRepo.hasActiveRefreshToken(userId);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const expiresAt = new Date(Date.now() + config.jwtRefreshExpiresIn * 1000); // 7 days

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, jti: randomUUID() });

    await this.authRepo.createRefreshToken({ token: refreshToken, userId: user.id, expiresAt });

    return { accessToken, refreshToken };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
