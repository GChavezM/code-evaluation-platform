import { z } from 'zod';

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    lastName: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase(),
    password: z.string().trim().min(8).max(128),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().trim().min(1),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
export type SignInDto = z.infer<typeof signInSchema>;
