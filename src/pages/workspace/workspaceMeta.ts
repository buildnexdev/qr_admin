export type WorkspaceCategory =
  | 'Operations & logistics'
  | 'Billing & documents'
  | 'Compliance'
  | 'Reports'
  | 'Subscriptions';

export type WorkspacePageDef = {
  key: string;
  title: string;
  blurb: string;
  category: WorkspaceCategory;
  /** When set, hub and deep links open this route instead of the placeholder workspace page */
  appPath?: string;
};

/** All placeholder modules under `/admin/workspace/:key` */
export const WORKSPACE_PAGES: WorkspacePageDef[] = [
  {
    key: 'delivery',
    title: 'Delivery',
    blurb: 'Track delivery orders, riders, and ETAs.',
    category: 'Operations & logistics',
    appPath: '/admin/delivery',
  },
  {
    key: 'delivery-management',
    title: 'Delivery management',
    blurb: 'Zones, fees, partner integrations, and dispatch rules.',
    category: 'Operations & logistics',
  },
  {
    key: 'purchase',
    title: 'Purchase',
    blurb: 'Purchase orders and inward goods.',
    category: 'Operations & logistics',
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    blurb: 'Supplier directory, terms, and purchase history.',
    category: 'Operations & logistics',
  },
  {
    key: 'attendance',
    title: 'Attendance',
    blurb: 'Clock-in/out, shifts, and attendance exports.',
    category: 'Operations & logistics',
  },
  {
    key: 'expenses',
    title: 'Expense management',
    blurb: 'Operational expenses, approvals, and ledgers.',
    category: 'Operations & logistics',
  },
  {
    key: 'invoices',
    title: 'Invoices',
    blurb: 'Issue, search, and export customer invoices.',
    category: 'Billing & documents',
  },
  {
    key: 'invoice-templates',
    title: 'Invoice / print templates',
    blurb: 'Branded layouts for bills, KOT, and receipts.',
    category: 'Billing & documents',
  },
  {
    key: 'refunds',
    title: 'Refunds & returns',
    blurb: 'Credit notes, voids, and return workflows.',
    category: 'Billing & documents',
  },
  {
    key: 'coupons',
    title: 'Coupons & offers',
    blurb: 'Discount codes, promos, and validity windows.',
    category: 'Billing & documents',
  },
  {
    key: 'audit-logs',
    title: 'Audit logs',
    blurb: 'Who changed what — security and compliance trail.',
    category: 'Compliance',
  },
  {
    key: 'notifications',
    title: 'Notifications & communication',
    blurb: 'SMS, email, push templates and delivery logs.',
    category: 'Compliance',
  },
  {
    key: 'report-sales',
    title: 'Sales report',
    blurb: 'Revenue, tenders, and period comparisons.',
    category: 'Reports',
  },
  {
    key: 'report-orders',
    title: 'Order report',
    blurb: 'Order volume, channels, and turnaround.',
    category: 'Reports',
  },
  {
    key: 'report-items',
    title: 'Item-wise report',
    blurb: 'Best sellers, mix, and margin by item.',
    category: 'Reports',
  },
  {
    key: 'report-categories',
    title: 'Category-wise report',
    blurb: 'Sales breakdown by menu category.',
    category: 'Reports',
  },
  {
    key: 'report-staff',
    title: 'Staff performance report',
    blurb: 'Upsell, handling time, and shift metrics.',
    category: 'Reports',
  },
  {
    key: 'report-inventory',
    title: 'Inventory report',
    blurb: 'Stock movement, variance, and valuation.',
    category: 'Reports',
  },
  {
    key: 'report-tax',
    title: 'Tax / GST report',
    blurb: 'Taxable totals, HSN/SAC summaries, and filings.',
    category: 'Reports',
  },
  {
    key: 'subscription-plans',
    title: 'Subscription plans',
    blurb: 'Billing tiers, limits, and renewals for NammaQr.',
    category: 'Subscriptions',
  },
];

const PAGE_MAP = new Map(WORKSPACE_PAGES.map((p) => [p.key, p]));

export function getWorkspacePage(key: string | undefined): WorkspacePageDef | undefined {
  if (!key) return undefined;
  return PAGE_MAP.get(key);
}

export function workspacePagesByCategory(): Record<string, WorkspacePageDef[]> {
  const out: Record<string, WorkspacePageDef[]> = {};
  for (const p of WORKSPACE_PAGES) {
    if (!out[p.category]) out[p.category] = [];
    out[p.category].push(p);
  }
  return out;
}
