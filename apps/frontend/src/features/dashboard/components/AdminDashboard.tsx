import { BookOpen, CheckCircle2, Layers, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatCard } from './StatCard';
import { SubmissionsTable } from './SubmissionsTable';
import { StatusBadge } from './StatusBadge';
import type { AdminStats, Problem, Submission, SubmissionStatus } from '../hooks/useDashboardStats';

interface AdminDashboardProps {
  problems: Problem[];
  submissions: Submission[];
  stats: AdminStats;
}

// Ordered for display priority
const STATUS_ORDER: SubmissionStatus[] = [
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
  'RUNNING',
  'PENDING',
];

function StatusBreakdown({
  statusBreakdown,
  total,
}: {
  statusBreakdown: Record<SubmissionStatus, number>;
  total: number;
}) {
  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No submissions recorded yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status) => {
        const count = statusBreakdown[status] ?? 0;
        if (count === 0) return null;
        const pct = Math.round((count / total) * 100);

        return (
          <div key={status} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              <span className="text-xs text-muted-foreground">
                {count} <span className="text-foreground/50">({pct}%)</span>
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboard({ problems, submissions, stats }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide overview and activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          description="In the system"
          icon={BookOpen}
          variant="default"
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          description="Across all users"
          icon={Layers}
          variant="info"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          description="Successful submissions"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          description="Platform-wide average"
          icon={TrendingUp}
          variant={stats.acceptanceRate >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity — wider column */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest submissions across all users and problems</CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionsTable
              submissions={submissions}
              problems={problems}
              showUser={true}
              limit={10}
            />
          </CardContent>
        </Card>

        {/* Submission Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Breakdown</CardTitle>
            <CardDescription>
              Distribution of {stats.totalSubmissions} total submission
              {stats.totalSubmissions !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdown
              statusBreakdown={stats.statusBreakdown}
              total={stats.totalSubmissions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
