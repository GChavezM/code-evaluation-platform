import { BookOpen, CheckSquare, FileEdit, Layers, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from './StatCard';
import { SubmissionsTable } from './SubmissionsTable';
import { ProblemsTable } from './ProblemsTable';
import type { EvaluatorStats, Problem, Submission } from '../hooks/useDashboardStats';

interface EvaluatorDashboardProps {
  problems: Problem[];
  submissions: Submission[];
  stats: EvaluatorStats;
}

export function EvaluatorDashboard({ problems, submissions, stats }: EvaluatorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage problems and monitor submissions.
          </p>
        </div>
        <Button size="sm" className="shrink-0">
          <PlusCircle data-icon="inline-start" />
          New Problem
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          description="All problems in the system"
          icon={BookOpen}
          variant="default"
        />
        <StatCard
          title="Published"
          value={stats.published}
          description="Visible to coders"
          icon={CheckSquare}
          variant="success"
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          description="Not yet published"
          icon={FileEdit}
          variant="warning"
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          description="Across all users"
          icon={Layers}
          variant="info"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Problems overview — wider column */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Problems Overview</CardTitle>
              <CardDescription className="mt-1">
                All problems including unpublished drafts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ProblemsTable problems={problems} showPublishStatus={true} />
          </CardContent>
        </Card>

        {/* Recent submissions — narrower column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Submissions</CardTitle>
            <CardDescription>Latest activity across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionsTable
              submissions={submissions}
              problems={problems}
              showUser={true}
              limit={6}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
