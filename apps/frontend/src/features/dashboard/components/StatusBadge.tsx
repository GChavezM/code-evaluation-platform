import { cn } from '@/lib/utils';
import type { SubmissionStatus } from '../hooks/useDashboardStats';

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; className: string }> = {
  ACCEPTED: {
    label: 'Accepted',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-400/20',
  },
  PENDING: {
    label: 'Pending',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-400/20',
  },
  RUNNING: {
    label: 'Running',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-400/20',
  },
  WRONG_ANSWER: {
    label: 'Wrong Answer',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 ring-red-600/20 dark:ring-red-400/20',
  },
  TIME_LIMIT_EXCEEDED: {
    label: 'Time Limit',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20',
  },
  MEMORY_LIMIT_EXCEEDED: {
    label: 'Memory Limit',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20',
  },
  RUNTIME_ERROR: {
    label: 'Runtime Error',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 ring-red-600/20 dark:ring-red-400/20',
  },
  COMPILATION_ERROR: {
    label: 'Compile Error',
    className:
      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 ring-rose-600/20 dark:ring-rose-400/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
