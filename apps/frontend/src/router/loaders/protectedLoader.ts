import { getAccessToken, initAuth } from '@/lib/tokenStore';
import { redirect, type LoaderFunctionArgs } from 'react-router';

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  await initAuth();

  if (!getAccessToken()) {
    const url = new URL(request.url);
    return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return null;
}
