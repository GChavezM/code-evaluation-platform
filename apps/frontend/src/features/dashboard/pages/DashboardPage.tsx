import { AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { CoderDashboard } from '../components/CoderDashboard';
import { EvaluatorDashboard } from '../components/EvaluatorDashboard';
import { AdminDashboard } from '../components/AdminDashboard';

export function DashboardPage() {
  const { problems, submissions, user, coderStats, evaluatorStats, adminStats, isLoading, error } =
    useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
        <AlertCircle className="size-6" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <AdminDashboard problems={problems} submissions={submissions} stats={adminStats} />;
  }

  if (user?.role === 'EVALUATOR') {
    return (
      <EvaluatorDashboard problems={problems} submissions={submissions} stats={evaluatorStats} />
    );
  }

  // Default: CODER
  return <CoderDashboard problems={problems} submissions={submissions} stats={coderStats} />;
}
