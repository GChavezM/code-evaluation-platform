import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

export function RouteHydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <Card className="w-full max-w-xl overflow-hidden border-sidebar-border/60 bg-background/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Spinner className="size-4 text-primary-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle>Preparing your workspace</CardTitle>
              <CardDescription>
                Restoring navigation, authentication, and route data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <Skeleton className="h-28 w-full" />
              <div className="grid gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            <span>One moment while the interface hydrates.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
