import { getAccessToken, initAuth } from '@/lib/tokenStore';
import { redirect } from 'react-router';

export async function publicLoader() {
  await initAuth();

  if (getAccessToken()) {
    return redirect('/dashboard');
  }

  return null;
}
