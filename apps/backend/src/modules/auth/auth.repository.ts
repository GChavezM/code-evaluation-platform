import type { PrismaClient, RefreshToken, User } from '../../generated/prisma/client.js';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: {
    name?: string | undefined;
    lastName?: string | undefined;
    email: string;
    password: string;
  }): Promise<User>;
  createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(id: string): Promise<void>;
  deleteAllUserRefreshTokens(userId: string): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    name?: string;
    lastName?: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.db.user.create({
      data,
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.db.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.db.refreshToken.delete({
      where: { id },
    });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
