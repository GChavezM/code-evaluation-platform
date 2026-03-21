const API_BASE_URL = String(import.meta.env['VITE_API_URL'] ?? '/api');

type RefreshTokenApiResponse = {
  data: {
    accessToken: string;
  };
};

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export async function initAuth(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      clearAccessToken();
      return;
    }

    const json = (await response.json()) as RefreshTokenApiResponse;
    setAccessToken(json.data.accessToken);
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    clearAccessToken();
  }
}
