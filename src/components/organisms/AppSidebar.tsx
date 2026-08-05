import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import {
  SUPER_ADMIN_NAV,
  RESTAURANT_ADMIN_NAV,
  type NavItem,
} from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive =
    item.path === '/admin' || item.path === '/super-admin'
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
        isActive
          ? 'bg-sidebar-active text-white shadow-sm'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-sidebar-muted group-hover:text-sidebar-foreground')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, filterNav } = usePermissions();
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');
  const baseNav = isSuperAdminRoute ? SUPER_ADMIN_NAV : RESTAURANT_ADMIN_NAV;
  const nav = filterNav(baseNav);
  let lastSection: string | undefined;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-hover"
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-hover px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-sidebar-foreground">NammaQR</p>
            <p className="truncate text-[11px] text-sidebar-muted">
              {isSuperAdminRoute ? 'Super Admin' : 'Restaurant Admin'}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {nav.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <div key={item.path}>
              {showSection && !collapsed && (
                <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {item.section}
                </p>
              )}
              <NavLink item={item} collapsed={collapsed} />
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-hover p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
