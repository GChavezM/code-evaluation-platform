import { getAccessToken, getCurrentUser, initAuth } from '@/lib/tokenStore';
import { redirect, type LoaderFunctionArgs } from 'react-router';

export function createRoleLoader(allowedRoles: string[]) {
  return async ({ request }: LoaderFunctionArgs) => {
    await initAuth();

    if (!getAccessToken()) {
      const url = new URL(request.url);
      return redirect(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
    }

    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return redirect('/dashboard');
    }

    return null;
  };
}
