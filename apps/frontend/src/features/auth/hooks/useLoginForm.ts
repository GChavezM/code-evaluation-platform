import { signIn } from '@/api';
import { setAccessToken } from '@/lib/tokenStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await signIn(data);
      setAccessToken(response.data.accessToken);
      const from = searchParams.get('redirectTo') ?? '/dashboard';
      void navigate(from, { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const rawError = (error.response?.data as { error?: unknown } | undefined)?.error;
        const message = typeof rawError === 'string' ? rawError : undefined;
        if (status === 401) {
          setServerError(message ?? 'Invalid email or password. Please try again.');
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
