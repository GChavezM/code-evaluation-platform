import { useMemo } from 'react';
import { useLocation } from 'react-router';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  problems: 'Problems',
  submissions: 'Submissions',
  solve: 'Solve',
  new: 'New',
  edit: 'Edit',
};

function humanize(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const { pathname } = useLocation();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = SEGMENT_LABELS[segment] || humanize(segment);
      const isLast = index === segments.length - 1;

      return { label, href, isLast };
    });
  }, [pathname]);
}
