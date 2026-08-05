import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Moon, Search, Sun, User, ChevronDown } from 'lucide-react';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeMode } from '@/hooks/usePermissions';

export function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle } = useThemeMode();
  const user = useSelector((state: RootState) => state.auth.user);
  const isDark = document.documentElement.classList.contains('dark');

  const pageTitle = location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Dashboard';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="hidden sm:block min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">NammaQR</p>
          <h2 className="truncate text-sm font-semibold capitalize">{pageTitle}</h2>
        </div>

        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders, menu, customers..."
            className="pl-9 h-9 bg-muted/50 border-border/50 text-sm"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggle}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-border">
            <Link
              to="/admin/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left max-w-[120px]">
                <p className="truncate text-sm font-medium leading-none">{user?.name ?? user?.username ?? 'User'}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.company_name ?? 'Restaurant'}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>

            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
