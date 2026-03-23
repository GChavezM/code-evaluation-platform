import { cn } from '@/lib/utils';
import type { Difficulty } from '../hooks/useDashboardStats';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; className: string }> = {
  EASY: {
    label: 'Easy',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-400/20',
  },
  MEDIUM: {
    label: 'Medium',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-400/20',
  },
  HARD: {
    label: 'Hard',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 ring-red-600/20 dark:ring-red-400/20',
  },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

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
