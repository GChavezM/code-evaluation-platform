import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { LoginPage, RegisterPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';

const routes: RouteObject[] = [
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ],
  },
  {
    Component: AppLayout,
    children: [{ path: '/dashboard', Component: DashboardPage }],
  },
];

export const router = createBrowserRouter(routes);
