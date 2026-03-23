import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: Variant;
}

const variantStyles: Record<Variant, { wrapper: string; icon: string; value: string }> = {
  default: {
    wrapper: 'border-border',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  success: {
    wrapper: 'border-emerald-200 dark:border-emerald-900',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    wrapper: 'border-amber-200 dark:border-amber-900',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-400',
  },
  danger: {
    wrapper: 'border-red-200 dark:border-red-900',
    icon: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    value: 'text-red-700 dark:text-red-400',
  },
  info: {
    wrapper: 'border-blue-200 dark:border-blue-900',
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    value: 'text-blue-700 dark:text-blue-400',
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn('gap-3', styles.wrapper)}>
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-lg', styles.icon)}>
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <p className={cn('text-3xl font-bold tracking-tight', styles.value)}>{value}</p>
        {description !== undefined && description !== '' && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
