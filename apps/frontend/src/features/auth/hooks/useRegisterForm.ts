import { signUp } from '@/api';
import { setAccessToken } from '@/lib/tokenStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: z.email().trim().toLowerCase(),
    password: z.string().trim().min(8).max(128),
    confirmPassword: z.string().trim().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export function useRegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const trimmedName = data.name?.trim() ?? '';
    const trimmedLastName = data.lastName?.trim() ?? '';

    const payload = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      ...(trimmedName ? { name: trimmedName } : {}),
      ...(trimmedLastName ? { lastName: trimmedLastName } : {}),
    };

    try {
      const response = await signUp(payload);
      setAccessToken(response.data.accessToken);
      const from = searchParams.get('redirectTo') ?? '/dashboard';
      void navigate(from, { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const rawError = (error.response?.data as { error?: unknown } | undefined)?.error;
        const message = typeof rawError === 'string' ? rawError : undefined;

        if (status === 409) {
          setServerError(message ?? 'An account with this email already exists.');
        } else if (status === 400) {
          setServerError(message ?? 'Please check your input and try again.');
        } else {
          setServerError('Something went wrong. Please try again later.');
        }
      } else {
        setServerError('Unable to connect. Please check your internet connection and try again.');
      }
    }
  };

  return { form, serverError, onSubmit: form.handleSubmit(onSubmit) };
}
