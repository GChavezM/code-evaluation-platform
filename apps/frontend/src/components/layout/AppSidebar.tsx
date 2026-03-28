import { signOut } from '@/api';
import { clearAccessToken, getCurrentUser } from '@/lib/tokenStore';
import { Code2, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar';
import { Button } from '../ui/button';

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Problems', href: '/problems', icon: Code2, roles: ['EVALUATOR'] },
  { title: 'Submissions', href: '/submissions', icon: User, roles: ['CODER'] },
];

function formatRole(role: string | undefined): string {
  if (!role) {
    return 'User';
  }

  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = getCurrentUser();

  const initials = user?.email[0]?.toUpperCase() ?? 'U';
  const displayEmail = user?.email ?? '';
  const displayRole = formatRole(user?.role);
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? '')
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Ignore errors during sign out
    } finally {
      clearAccessToken();
      void navigate('/login', { replace: true });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/35 px-2.5 py-2 transition-[gap,padding] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-[width,height,border-radius] group-data-[collapsible=icon]:size-7 group-data-[collapsible=icon]:rounded-lg">
            <ShieldCheck className="size-4 group-data-[collapsible=icon]:size-3.5" />
          </div>

          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-heading truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              G-Shield Code
            </span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              Secure code evaluation platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={title}
                    isActive={
                      href === '/dashboard'
                        ? location.pathname === href
                        : location.pathname === href || location.pathname.startsWith(href + '/')
                    }
                  >
                    <Link to={href}>
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 p-2 transition-[padding] group-data-[collapsible=icon]:p-1.5">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary ring-1 ring-sidebar-border transition-[width,height,border-radius] group-data-[collapsible=icon]:size-7 group-data-[collapsible=icon]:rounded-lg">
              {initials}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Account
                </span>
                <span className="rounded-full bg-sidebar-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-primary">
                  {displayRole}
                </span>
              </div>

              <span className="truncate text-sm font-medium text-foreground">{displayEmail}</span>
            </div>
          </div>

          <div className="mt-2 flex gap-2 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 justify-start group-data-[collapsible=icon]:hidden"
              onClick={() => void handleLogout()}
            >
              <LogOut data-icon="inline-start" />
              Sign out
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Log out"
              className={cn('shrink-0', 'hidden group-data-[collapsible=icon]:inline-flex')}
              onClick={() => void handleLogout()}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
