import api from '@/lib/axios';

export interface AuthUser {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse<T> {
  data: T;
}

export const signIn = async (
  payload: SignInPayload
): Promise<AuthResponse<{ user: AuthUser; accessToken: string }>> => {
  const response = await api.post<AuthResponse<{ user: AuthUser; accessToken: string }>>(
    '/auth/sign-in',
    payload
  );
  return response.data;
};

export const signUp = async (
  payload: SignUpPayload
): Promise<AuthResponse<{ user: AuthUser; accessToken: string }>> => {
  const response = await api.post<AuthResponse<{ user: AuthUser; accessToken: string }>>(
    '/auth/sign-up',
    payload
  );
  return response.data;
};

export const signOut = async (): Promise<void> => {
  await api.post('/auth/sign-out', null, { withCredentials: true });
};

export const refreshToken = async (): Promise<AuthResponse<{ accessToken: string }>> => {
  const response = await api.post<AuthResponse<{ accessToken: string }>>('/auth/refresh-token');
  return response.data;
};
