import { FileX2 } from 'lucide-react';
import type { Problem, Submission } from '../hooks/useDashboardStats';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router';

interface SubmissionsTableProps {
  submissions: Submission[];
  problems: Problem[];
  /** Show the userId column — used for EVALUATOR / ADMIN views */
  showUser?: boolean;
  /** Max rows to display */
  limit?: number;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatLanguage(lang: string): string {
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
}

function shortId(id: string): string {
  return id.slice(0, 8) + '…';
}

export function SubmissionsTable({
  submissions,
  problems,
  showUser = false,
  limit = 8,
}: SubmissionsTableProps) {
  const problemMap = new Map(problems.map((p) => [p.id, p]));
  const rows = submissions.slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <FileX2 className="size-8 opacity-40" />
        <p className="text-sm">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {showUser && (
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                User
              </th>
            )}
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Problem
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Language
            </th>
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((sub) => {
            const problem = problemMap.get(sub.problemId);
            return (
              <tr key={sub.id} className="group transition-colors hover:bg-muted/40">
                {showUser && (
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {shortId(sub.userId)}
                  </td>
                )}
                <td className="py-3 pr-4 font-medium text-foreground">
                  <Link to={`/submissions/${sub.id}`} className="hover:underline">
                    {problem?.title ?? (
                      <span className="text-muted-foreground italic">Unknown</span>
                    )}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{formatLanguage(sub.language)}</td>
                <td className="py-3 text-muted-foreground">{formatDate(sub.submittedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {submissions.length > limit && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Showing {limit} of {submissions.length} submissions
        </p>
      )}
    </div>
  );
}
