let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function initAuth(): Promise<void> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = (await response.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
    }
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
  }
}
