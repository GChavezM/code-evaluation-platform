import { CheckCircle2, ChartBar, Trophy, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './StatCard';
import { SubmissionsTable } from './SubmissionsTable';
import { ProblemsTable } from './ProblemsTable';
import type { CoderStats, Problem, Submission } from '../hooks/useDashboardStats';

interface CoderDashboardProps {
  problems: Problem[];
  submissions: Submission[];
  stats: CoderStats;
}

export function CoderDashboard({ problems, submissions, stats }: CoderDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress and keep practicing.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          description="All time"
          icon={Layers}
          variant="default"
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          description={`${stats.acceptanceRate}% acceptance rate`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Problems Attempted"
          value={stats.problemsAttempted}
          description={`Out of ${problems.length} available`}
          icon={ChartBar}
          variant="info"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          description={
            stats.accepted > 0 ? `${stats.accepted} accepted submissions` : 'Keep going!'
          }
          icon={Trophy}
          variant={stats.acceptanceRate >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Submissions</CardTitle>
            <CardDescription>
              Your latest {Math.min(8, submissions.length)} attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionsTable submissions={submissions} problems={problems} showUser={false} />
          </CardContent>
        </Card>

        {/* Available Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Problems</CardTitle>
            <CardDescription>
              {problems.length} problem{problems.length !== 1 ? 's' : ''} to solve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProblemsTable
              problems={problems}
              submissions={submissions}
              showPublishStatus={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
