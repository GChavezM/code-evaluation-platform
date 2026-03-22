import 'dotenv/config';
import { Difficulty, PrismaClient, Problem, UserRole } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});

const prisma = new PrismaClient({ adapter });

type SeedUser = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

type SeedProblem = {
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished: boolean;
};

type SeedTestCase = {
  input: string;
  expectedOutput: string;
  orderIndex: number;
  isSample: boolean;
};

const users: SeedUser[] = [
  {
    name: 'Super',
    lastName: 'Admin',
    email: 'super.admin@example.com',
    password: 'password123',
    role: UserRole.ADMIN,
  },
  {
    name: 'Alan',
    lastName: 'Turing',
    email: 'alan.turing@example.com',
    password: 'password123',
    role: UserRole.EVALUATOR,
  },
];

const problems: SeedProblem[] = [
  {
    title: 'Two Sum',
    description:
      'Write a program that reads two integers from standard input and prints their sum.',
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    isPublished: true,
  },
  {
    title: 'Palindrome Checker',
    description:
      'Write a program that reads a string from standard input and checks if it is a palindrome.',
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    isPublished: true,
  },
];

const testCases: SeedTestCase[][] = [];
testCases[0] = [
  {
    input: '1 2',
    expectedOutput: '3',
    orderIndex: 1,
    isSample: true,
  },
  {
    input: '10 20',
    expectedOutput: '30',
    orderIndex: 2,
    isSample: false,
  },
  {
    input: '-5 5',
    expectedOutput: '0',
    orderIndex: 3,
    isSample: false,
  },
];
testCases[1] = [
  {
    input: 'racecar',
    expectedOutput: 'True',
    orderIndex: 1,
    isSample: true,
  },
  {
    input: 'hello',
    expectedOutput: 'False',
    orderIndex: 2,
    isSample: true,
  },
  {
    input: 'madam',
    expectedOutput: 'True',
    orderIndex: 3,
    isSample: false,
  },
];

export async function main() {
  console.log('Start seeding...');

  let userEvaluator: { id: string } | null = null;
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

    const seedUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
      update: {},
    });

    if (user.email === 'alan.turing@example.com') {
      userEvaluator = { id: seedUser.id };
    }
  }

  if (userEvaluator === null) {
    throw new Error('Evaluator user not found in seed data');
  }

  const seedProblems: Problem[] = [];
  for (const problem of problems) {
    const seedProblem = await prisma.problem.create({
      data: {
        ...problem,
        createdBy: userEvaluator.id,
      },
    });
    seedProblems.push(seedProblem);
  }

  for (let i = 0; i < seedProblems.length; i++) {
    const problem = seedProblems[i];
    await prisma.testCase.createMany({
      data: testCases[i].map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        order: tc.orderIndex,
        isSample: tc.isSample,
        problemId: problem.id,
      })),
    });
  }

  console.log('Seeding finished.');
  console.log(`Users seeded: ${users.length}`);
  console.log(`Problems seeded: ${seedProblems.length}`);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
