import type { AppRole } from './navigation';

/** Permission keys mapped to roles that can access them */
const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: ['*'],
  owner: ['*'],
  admin: [
    'admin.dashboard', 'admin.orders', 'admin.kitchen', 'admin.pos', 'admin.tables',
    'admin.menu', 'admin.categories', 'admin.variants', 'admin.addons', 'admin.combos',
    'admin.inventory', 'admin.stock', 'admin.purchase', 'admin.suppliers',
    'admin.expenses', 'admin.bills', 'admin.customers', 'admin.reservations',
    'admin.delivery', 'admin.takeaway', 'admin.staff', 'admin.attendance', 'admin.payroll',
    'admin.reports', 'admin.analytics', 'admin.offers', 'admin.coupons', 'admin.loyalty',
    'admin.wallet', 'admin.membership', 'admin.reviews', 'admin.company', 'admin.branch',
    'admin.settings', 'admin.printer', 'admin.taxes', 'admin.notifications', 'admin.refunds',
    'admin.invoices', 'admin.audit',
  ],
  manager: [
    'admin.dashboard', 'admin.orders', 'admin.kitchen', 'admin.tables', 'admin.menu',
    'admin.categories', 'admin.customers', 'admin.reservations', 'admin.delivery',
    'admin.takeaway', 'admin.staff', 'admin.attendance', 'admin.reports', 'admin.reviews',
  ],
  cashier: ['admin.dashboard', 'admin.orders', 'admin.pos', 'admin.bills', 'admin.customers', 'admin.takeaway'],
  waiter: ['admin.dashboard', 'admin.orders', 'admin.tables', 'admin.reservations', 'admin.takeaway'],
  kitchen: ['admin.dashboard', 'admin.kitchen', 'admin.orders'],
  delivery: ['admin.dashboard', 'admin.delivery', 'admin.orders'],
  accountant: ['admin.dashboard', 'admin.bills', 'admin.expenses', 'admin.reports', 'admin.analytics', 'admin.payroll', 'admin.taxes', 'admin.invoices'],
  inventory_manager: ['admin.dashboard', 'admin.inventory', 'admin.stock', 'admin.purchase', 'admin.suppliers', 'admin.reports'],
  support: ['admin.dashboard', 'admin.customers', 'admin.orders', 'admin.reviews'],
};

const ROLE_ID_MAP: Record<number, AppRole> = {
  0: 'super_admin',
  1: 'owner',
  2: 'admin',
  3: 'manager',
  4: 'cashier',
  5: 'waiter',
  6: 'kitchen',
  7: 'delivery',
  8: 'accountant',
  9: 'inventory_manager',
  10: 'support',
};

export function resolveAppRole(role: string | number | null | undefined): AppRole {
  if (role === 'super_admin') return 'super_admin';
  if (typeof role === 'number') return ROLE_ID_MAP[role] ?? 'admin';
  if (typeof role === 'string') {
    const num = parseInt(role, 10);
    if (!Number.isNaN(num) && ROLE_ID_MAP[num]) return ROLE_ID_MAP[num];
    if (role in ROLE_PERMISSIONS) return role as AppRole;
  }
  return 'owner';
}

export function hasPermission(role: AppRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(permission);
}

export function filterNavByPermissions<T extends { permission?: string }>(
  items: T[],
  role: AppRole
): T[] {
  return items.filter((item) => !item.permission || hasPermission(role, item.permission));
}
