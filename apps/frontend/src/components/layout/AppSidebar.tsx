import { signOut } from '@/api';
import { clearAccessToken, getCurrentUser } from '@/lib/tokenStore';
import { Code2, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
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
  { title: 'Problems', href: '/problems', icon: Code2 },
  { title: 'Profile', href: '/profile', icon: User },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = getCurrentUser();

  const initials = user?.email[0]?.toUpperCase() ?? 'U';
  const displayEmail = user?.email ?? '';

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
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-4" />
          </div>

          <div className="flex flex-col overflow-hidden">
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
              {NAV_ITEMS.map(({ title, href, icon: Icon }) => (
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

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
            {initials}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 outline-hidden">
            <span className="truncate text-xs font-medium leading-none text-foreground">
              {displayEmail}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Log out"
          className="shrink-0"
          onClick={() => void handleLogout()}
        >
          <LogOut />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
