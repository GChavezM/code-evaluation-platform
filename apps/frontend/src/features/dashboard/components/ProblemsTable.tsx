import { FileX2 } from 'lucide-react';
import type { Problem, Submission } from '../hooks/useDashboardStats';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';

interface ProblemsTableProps {
  problems: Problem[];
  submissions?: Submission[];
  /** Show publish status column — used for EVALUATOR / ADMIN views */
  showPublishStatus?: boolean;
  /** Max rows to display */
  limit?: number;
}

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        published
          ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-400/20'
          : 'bg-zinc-100 text-zinc-600 ring-zinc-600/20 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-400/20'
      )}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function ProblemsTable({
  problems,
  submissions = [],
  showPublishStatus = false,
  limit = 8,
}: ProblemsTableProps) {
  const rows = problems.slice(0, limit);

  // Build a set of attempted and accepted problem IDs from submissions
  const attemptedIds = new Set(submissions.map((s) => s.problemId));
  const acceptedIds = new Set(
    submissions.filter((s) => s.status === 'ACCEPTED').map((s) => s.problemId)
  );

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <FileX2 className="size-8 opacity-40" />
        <p className="text-sm">No problems available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Title
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Difficulty
            </th>
            {showPublishStatus && (
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
            )}
            {!showPublishStatus && submissions.length > 0 && (
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your Status
              </th>
            )}
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Limits
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((problem) => {
            const isAccepted = acceptedIds.has(problem.id);
            const isAttempted = attemptedIds.has(problem.id);

            return (
              <tr key={problem.id} className="group transition-colors hover:bg-muted/40">
                <td className="py-3 pr-4 font-medium text-foreground">{problem.title}</td>
                <td className="py-3 pr-4">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                {showPublishStatus && (
                  <td className="py-3 pr-4">
                    <PublishedBadge published={problem.isPublished} />
                  </td>
                )}
                {!showPublishStatus && submissions.length > 0 && (
                  <td className="py-3 pr-4">
                    {isAccepted ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        ✓ Solved
                      </span>
                    ) : isAttempted ? (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        ⟳ Attempted
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )}
                <td className="py-3 text-xs text-muted-foreground">
                  {problem.timeLimitMs}ms / {problem.memoryLimitMb}MB
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {problems.length > limit && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Showing {limit} of {problems.length} problems
        </p>
      )}
    </div>
  );
}
