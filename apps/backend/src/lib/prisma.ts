import config from '../config/config.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const globalPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalPrisma.prisma ?? createPrismaClient();

if (config.nodeEnv !== 'production') {
  globalPrisma.prisma = prisma;
}
