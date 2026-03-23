import { AppSidebar } from '@/components/layout/AppSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Outlet, useNavigate } from 'react-router';
import { signOut } from '@/api/auth.api';
import { clearAccessToken } from '@/lib/tokenStore';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppLayout() {
  const breadcrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      clearAccessToken();
      void navigate('/login', { replace: true });
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="ml-1" />
            <Separator orientation="vertical" className="h-6" />

            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb) => (
                  <BreadcrumbItem key={crumb.href}>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                    {!crumb.isLast ? <BreadcrumbSeparator /> : null}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <Button
              className="ml-auto"
              size="sm"
              aria-label="Log out"
              onClick={() => void handleLogout()}
            >
              <LogOut data-icon="inline-start" />
              Log out
            </Button>
          </header>

          <main className="flex flex-1 flex-col p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
