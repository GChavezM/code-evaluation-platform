import { RouterProvider } from 'react-router';
import { router } from '@/router';
import { useEffect } from 'react';
import { clearAccessToken } from './lib/tokenStore';
import { AUTH_LOGOUT_EVENT } from './lib/axios';

function App() {
  useEffect(() => {
    const handleLogout = () => {
      clearAccessToken();
      void router.navigate('/login', { replace: true });
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);

    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
