import { z } from 'zod';

const languagesEnum = z.enum(['PYTHON']);

export const createSubmissionSchema = z.object({
  sourceCode: z.string().trim().min(1).max(50000),
  language: languagesEnum,
  problemId: z.uuid(),
});

export const submissionIdSchema = z.object({
  id: z.uuid(),
});

export const listSubmissionsQuerySchema = z.object({
  problemId: z.uuid().optional(),
  userId: z.uuid().optional(),
});

export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
export type SubmissionIdDto = z.infer<typeof submissionIdSchema>;
export type ListSubmissionsQueryDto = z.infer<typeof listSubmissionsQuerySchema>;
