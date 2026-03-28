import { createBrowserRouter, Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { LoginPage, RegisterPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { SolveProblemPage, SubmissionDetailPage, SubmissionsPage } from '@/features/submissions';
import { ProblemsPage } from '@/features/problems/pages/ProblemsPage';
import { CreateProblemPage } from '@/features/problems/pages/CreateProblemPage';
import { ProblemDetailPage } from '@/features/problems/pages/ProblemDetailPage';
import { EditProblemPage } from '@/features/problems/pages/EditProblemPage';
import { RouteErrorPage } from './RouteErrorPage';
import { RouteHydrateFallback } from './RouteHydrateFallback';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { protectedLoader } from './loaders/protectedLoader';
import { publicLoader } from './loaders/publicLoader';
import { createRoleLoader } from './loaders/roleLoader';

const hydrateFallbackElement = <RouteHydrateFallback />;
const errorElement = <RouteErrorPage />;

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement,
  },
  {
    Component: AuthLayout,
    loader: publicLoader,
    hydrateFallbackElement,
    errorElement,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ],
  },
  {
    Component: AppLayout,
    loader: protectedLoader,
    hydrateFallbackElement,
    errorElement,
    children: [
      { path: '/dashboard', Component: DashboardPage },
      {
        path: '/problems',
        loader: createRoleLoader(['EVALUATOR']),
        Component: ProblemsPage,
      },
      {
        path: '/problems/new',
        loader: createRoleLoader(['EVALUATOR']),
        Component: CreateProblemPage,
      },
      {
        path: '/problems/:id',
        loader: createRoleLoader(['EVALUATOR']),
        Component: ProblemDetailPage,
      },
      {
        path: '/problems/:id/edit',
        loader: createRoleLoader(['EVALUATOR']),
        Component: EditProblemPage,
      },
      {
        path: '/submissions',
        loader: createRoleLoader(['CODER']),
        Component: SubmissionsPage,
      },
      {
        path: '/submissions/:id',
        loader: createRoleLoader(['CODER']),
        Component: SubmissionDetailPage,
      },
      {
        path: '/solve/:problemId',
        loader: createRoleLoader(['CODER']),
        Component: SolveProblemPage,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
