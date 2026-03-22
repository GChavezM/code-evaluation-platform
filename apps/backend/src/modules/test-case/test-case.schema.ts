import { z } from 'zod';

export const createTestCaseSchema = z.object({
  input: z.string().trim().min(1),
  expectedOutput: z.string().trim().min(1),
  order: z.number().int().positive(),
  isSample: z.boolean().default(false),
});

export const updateTestCaseSchema = createTestCaseSchema.partial();

export const problemIdParamsSchema = z.object({
  problemId: z.uuid(),
});

export const testCaseParamsSchema = z.object({
  problemId: z.uuid(),
  id: z.uuid(),
});

export type CreateTestCaseDto = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseDto = z.infer<typeof updateTestCaseSchema>;
export type ProblemIdParamDto = z.infer<typeof problemIdParamsSchema>;
export type TestCaseParamDto = z.infer<typeof testCaseParamsSchema>;
