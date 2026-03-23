const API_BASE_URL = String(import.meta.env['VITE_API_URL'] ?? '/api');

type RefreshTokenApiResponse = {
  data: {
    accessToken: string;
  };
};

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

let accessToken: string | null = null;

let initPromise: Promise<void> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
  initPromise = null;
}

export async function initAuth(): Promise<void> {
  if (accessToken) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setAccessToken(null);
        return;
      }

      const json = (await response.json()) as RefreshTokenApiResponse;
      setAccessToken(json.data.accessToken);
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      setAccessToken(null);
    }
  })();

  return initPromise;
}

export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): TokenPayload | null {
  const token = getAccessToken();
  return token ? decodeTokenPayload(token) : null;
}
