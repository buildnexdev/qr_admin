import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Home, LogOut } from 'lucide-react';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';

function formatClock(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function AppHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const segments = location.pathname.split('/').filter(Boolean);
  const raw = segments[segments.length - 1]?.replace(/-/g, ' ') ?? 'Dashboard';
  const isHome =
    location.pathname === '/admin' ||
    location.pathname === '/super-admin' ||
    raw === 'admin' ||
    raw === 'super admin';
  const pageTitle = isHome ? 'Admin dashboard' : raw;
  const homePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const initial = (user?.name ?? user?.username ?? 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E8EEEA] bg-white">
      <div className="flex h-[58px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: home chip + title */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={homePath}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition hover:bg-[#F9FAFB]"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <h2 className="truncate text-[15px] font-semibold capitalize tracking-tight text-[#111827]">
            {pageTitle}
          </h2>
        </div>

        {/* Right: clock pill + bell + avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden items-center rounded-full bg-[#F3F4F6] px-3.5 py-1.5 sm:flex">
            <span className="text-xs tabular-nums text-[#6B7280]">{formatClock(now)}</span>
          </div>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A5D3B] text-sm font-semibold text-white shadow-sm transition hover:bg-[#086B44]"
              aria-label="Account menu"
            >
              {initial}
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  <Link
                    to="/admin/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-[#374151] hover:bg-[#F4F8F5]"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#F4F8F5]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
