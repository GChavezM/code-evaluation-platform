import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { LoginPage, RegisterPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { publicLoader } from './loaders/publicLoader';
import { protectedLoader } from './loaders/protectedLoader';

const hydrateFallbackElement = <div>Loading...</div>;

const routes: RouteObject[] = [
  {
    Component: AuthLayout,
    loader: publicLoader,
    hydrateFallbackElement,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ],
  },
  {
    Component: AppLayout,
    loader: protectedLoader,
    hydrateFallbackElement,
    children: [{ path: '/dashboard', Component: DashboardPage }],
  },
];

export const router = createBrowserRouter(routes);
