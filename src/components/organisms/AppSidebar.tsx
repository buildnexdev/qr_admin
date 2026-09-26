import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  Star,
  TicketPercent,
  UserCircle,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import {
  SUPER_ADMIN_NAV,
  RESTAURANT_ADMIN_NAV,
  type NavItem,
} from '@/config/navigation';
import { NammaQrLogo } from '@/components/brand/NammaQrLogo';

type AppSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

type NavGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const SECTION_ICONS: Record<string, LucideIcon> = {
  Operations: ClipboardList,
  Menu: UtensilsCrossed,
  Inventory: Boxes,
  Finance: CreditCard,
  Customers: Users,
  Staff: UserCircle,
  Analytics: BarChart3,
  Marketing: TicketPercent,
  Feedback: Star,
  Setup: Settings,
  Tenants: Building2,
  Billing: CreditCard,
  Support: Headphones,
  Content: Megaphone,
  System: Shield,
};

function groupNav(items: NavItem[]): { top: NavItem[]; groups: NavGroup[] } {
  const top: NavItem[] = [];
  const map = new Map<string, NavItem[]>();

  for (const item of items) {
    if (!item.section) {
      top.push(item);
      continue;
    }
    const list = map.get(item.section) ?? [];
    list.push(item);
    map.set(item.section, list);
  }

  return {
    top,
    groups: [...map.entries()].map(([label, groupItems]) => ({
      key: label,
      label,
      icon: SECTION_ICONS[label] ?? LayoutDashboard,
      items: groupItems,
    })),
  };
}

function isItemActive(pathname: string, path: string) {
  if (path === '/admin' || path === '/super-admin') return pathname === path;
  return pathname.startsWith(path);
}

function LeafLink({
  item,
  collapsed,
  nested,
}: {
  item: NavItem;
  collapsed: boolean;
  nested?: boolean;
}) {
  const location = useLocation();
  const active = isItemActive(location.pathname, item.path);
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn('nq-aside-link', active && 'is-active', nested && 'is-nested', collapsed && 'is-collapsed')}
    >
      <Icon className="nq-aside-link__icon" strokeWidth={1.75} />
      {!collapsed && <span className="nq-aside-link__label">{item.label}</span>}
      {!collapsed && item.badge ? <span className="nq-aside-link__badge">{item.badge}</span> : null}
    </Link>
  );
}

function AccordionSection({
  group,
  collapsed,
  open,
  onToggle,
}: {
  group: NavGroup;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const hasActiveChild = group.items.some((item) => isItemActive(location.pathname, item.path));
  const Icon = group.icon;

  if (collapsed) {
    return (
      <div className="nq-aside-group">
        {group.items.map((item) => (
          <LeafLink key={item.path} item={item} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div className="nq-aside-group">
      <button
        type="button"
        onClick={onToggle}
        className={cn('nq-aside-section', (hasActiveChild || open) && 'is-open')}
      >
        <Icon className="nq-aside-section__icon" strokeWidth={1.75} />
        <span className="nq-aside-section__label">{group.label}</span>
        <ChevronDown className={cn('nq-aside-section__chevron', open && 'is-rotated')} strokeWidth={2} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="nq-aside-group__body"
          >
            <div className="nq-aside-group__items">
              {group.items.map((item) => (
                <LeafLink key={item.path} item={item} collapsed={false} nested />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const { filterNav } = usePermissions();
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');
  const baseNav = isSuperAdminRoute ? SUPER_ADMIN_NAV : RESTAURANT_ADMIN_NAV;
  const nav = filterNav(baseNav);
  const { top, groups } = useMemo(() => groupNav(nav), [nav]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        const hasActive = group.items.some((item) => isItemActive(location.pathname, item.path));
        if (hasActive) next[group.key] = true;
        else if (next[group.key] === undefined) next[group.key] = group.key === 'Operations' || group.key === 'Menu';
      }
      return next;
    });
  }, [groups, location.pathname]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 268 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="nq-aside"
    >
      <div className="nq-aside__brand">
        {collapsed ? (
          <div className="nq-aside__brand-mini">
            <NammaQrLogo size={34} />
          </div>
        ) : (
          <>
            <NammaQrLogo size={34} showWordmark wordmarkClassName="text-[17px]" />
            <p className="nq-aside__subtitle">
              {isSuperAdminRoute ? 'Platform' : 'Restaurant POS'}
            </p>
          </>
        )}
      </div>

      <nav className="nq-aside__nav" aria-label="Main">
        {top.map((item) => (
          <LeafLink key={item.path} item={item} collapsed={collapsed} />
        ))}

        {groups.map((group) => (
          <AccordionSection
            key={group.key}
            group={group}
            collapsed={collapsed}
            open={!!openSections[group.key]}
            onToggle={() =>
              setOpenSections((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
            }
          />
        ))}
      </nav>

      <div className="nq-aside__foot">
        {!collapsed && <p className="nq-aside__status">NammaQR · Live</p>}
        <button
          type="button"
          className="nq-aside__collapse"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
