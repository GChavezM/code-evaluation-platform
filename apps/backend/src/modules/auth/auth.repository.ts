import type { Prisma, PrismaClient, RefreshToken, User } from '../../generated/prisma/client.js';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  createRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(id: string): Promise<void>;
  deleteAllUserRefreshTokens(userId: string): Promise<void>;
  hasActiveRefreshToken(userId: string): Promise<boolean>;
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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({
      data,
    });
  }

  async createRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
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

  async hasActiveRefreshToken(userId: string): Promise<boolean> {
    const token = await this.db.refreshToken.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    return !!token;
  }
}
