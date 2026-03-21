import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore';

const API_BASE_URL = String(import.meta.env['VITE_API_URL'] ?? '/api');
const REFRESH_ENDPOINT = '/auth/refresh-token';

export const AUTH_LOGOUT_EVENT = 'auth:logout' as const;

type RefreshTokenApiResponse = {
  data: {
    accessToken: string;
  };
};

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unknown request error');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

function resolveQueue(newToken: string): void {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
}

function rejectQueue(error: Error): void {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError) || !error.config) {
      return Promise.reject(toError(error));
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const is401 = error.response?.status === 401;
    const isRefreshCall = originalRequest.url?.includes(REFRESH_ENDPOINT);
    const alreadyRetried = originalRequest._retry === true;

    if (!is401 || alreadyRetried || isRefreshCall) {
      return Promise.reject(toError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshTokenApiResponse>(
        `${API_BASE_URL}${REFRESH_ENDPOINT}`,
        null,
        {
          withCredentials: true,
        }
      );

      const newToken = data.data.accessToken;
      setAccessToken(newToken);
      resolveQueue(newToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      const error = toError(refreshError);
      rejectQueue(error);
      clearAccessToken();
      window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
