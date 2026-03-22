import { z } from 'zod';

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const createProblemSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10),
  difficulty: difficultyEnum,
  timeLimitMs: z.number().int().positive().max(10000),
  memoryLimitMb: z.number().int().positive().max(512),
  isPublished: z.boolean().default(false),
});

export const updateProblemSchema = createProblemSchema.partial();

export const problemIdSchema = z.object({
  id: z.uuid(),
});

export type CreateProblemDto = z.infer<typeof createProblemSchema>;
export type UpdateProblemDto = z.infer<typeof updateProblemSchema>;
export type ProblemIdDto = z.infer<typeof problemIdSchema>;
