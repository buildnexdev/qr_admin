import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Crown,
  FileText,
  TrendingUp,
  Headphones,
  TicketPercent,
  Tag,
  Globe,
  Megaphone,
  Settings,
  Percent,
  Wallet,
  Flag,
  ScrollText,
  Shield,
  ClipboardList,
  ChefHat,
  Monitor,
  Grid3X3,
  UtensilsCrossed,
  Tags,
  Layers,
  PackagePlus,
  Gift,
  Boxes,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  CalendarCheck,
  Banknote,
  UserCircle,
  BarChart3,
  Star,
  QrCode,
  Printer,
  MapPin,
  Receipt,
  Undo2,
  Bell,
  Heart,
  WalletCards,
  UserCheck,
} from 'lucide-react';

export type AppRole =
  | 'super_admin'
  | 'owner'
  | 'admin'
  | 'manager'
  | 'cashier'
  | 'waiter'
  | 'kitchen'
  | 'delivery'
  | 'accountant'
  | 'inventory_manager'
  | 'support';

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  section?: string;
  /** Permission key — hidden if user lacks permission */
  permission?: string;
  badge?: string;
};

export const SUPER_ADMIN_NAV: NavItem[] = [
  { path: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'super.dashboard' },
  { section: 'Tenants', path: '/super-admin/restaurants', label: 'Restaurants', icon: Building2, permission: 'super.restaurants' },
  { section: 'Tenants', path: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard, permission: 'super.subscriptions' },
  { section: 'Tenants', path: '/super-admin/plans', label: 'Plans', icon: Crown, permission: 'super.plans' },
  { section: 'Billing', path: '/super-admin/invoices', label: 'Invoices', icon: FileText, permission: 'super.invoices' },
  { section: 'Billing', path: '/super-admin/revenue', label: 'Revenue Analytics', icon: TrendingUp, permission: 'super.revenue' },
  { section: 'Support', path: '/super-admin/tickets', label: 'Support Tickets', icon: Headphones, permission: 'super.tickets' },
  { section: 'Marketing', path: '/super-admin/coupons', label: 'Coupons', icon: TicketPercent, permission: 'super.coupons' },
  { section: 'Marketing', path: '/super-admin/promo-codes', label: 'Promo Codes', icon: Tag, permission: 'super.promo' },
  { section: 'Content', path: '/super-admin/cms', label: 'CMS', icon: Globe, permission: 'super.cms' },
  { section: 'Content', path: '/super-admin/announcements', label: 'Announcements', icon: Megaphone, permission: 'super.announcements' },
  { section: 'System', path: '/super-admin/settings', label: 'System Settings', icon: Settings, permission: 'super.settings' },
  { section: 'System', path: '/super-admin/taxes', label: 'Global Taxes', icon: Percent, permission: 'super.taxes' },
  { section: 'System', path: '/super-admin/payment-gateway', label: 'Payment Gateway', icon: Wallet, permission: 'super.payment' },
  { section: 'System', path: '/super-admin/feature-flags', label: 'Feature Flags', icon: Flag, permission: 'super.features' },
  { section: 'System', path: '/super-admin/audit-logs', label: 'Audit Logs', icon: ScrollText, permission: 'super.audit' },
  { section: 'System', path: '/super-admin/roles', label: 'Role Permissions', icon: Shield, permission: 'super.roles' },
];

export const RESTAURANT_ADMIN_NAV: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'admin.dashboard' },
  { section: 'Operations', path: '/admin/orders', label: 'Orders', icon: ClipboardList, permission: 'admin.orders' },
  { section: 'Operations', path: '/admin/kitchen', label: 'Kitchen Display', icon: ChefHat, permission: 'admin.kitchen' },
  { section: 'Operations', path: '/admin/pos', label: 'POS Billing', icon: Monitor, permission: 'admin.pos' },
  { section: 'Operations', path: '/admin/tables', label: 'QR Tables', icon: Grid3X3, permission: 'admin.tables' },
  { section: 'Menu', path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, permission: 'admin.menu' },
  { section: 'Menu', path: '/admin/categories', label: 'Categories', icon: Tags, permission: 'admin.categories' },
  { section: 'Menu', path: '/admin/variants', label: 'Variants', icon: Layers, permission: 'admin.variants' },
  { section: 'Menu', path: '/admin/addons', label: 'Addons', icon: PackagePlus, permission: 'admin.addons' },
  { section: 'Menu', path: '/admin/combos', label: 'Combos', icon: Gift, permission: 'admin.combos' },
  { section: 'Inventory', path: '/admin/stocks', label: 'Inventory', icon: Boxes, permission: 'admin.inventory' },
  { section: 'Inventory', path: '/admin/stock', label: 'Stock', icon: Warehouse, permission: 'admin.stock' },
  { section: 'Inventory', path: '/admin/purchase', label: 'Purchase', icon: ShoppingCart, permission: 'admin.purchase' },
  { section: 'Inventory', path: '/admin/suppliers', label: 'Suppliers', icon: Truck, permission: 'admin.suppliers' },
  { section: 'Finance', path: '/admin/expenses', label: 'Expenses', icon: Banknote, permission: 'admin.expenses' },
  { section: 'Finance', path: '/admin/bills', label: 'Bills', icon: Receipt, permission: 'admin.bills' },
  { section: 'Customers', path: '/admin/customers', label: 'Customers', icon: Users, permission: 'admin.customers' },
  { section: 'Customers', path: '/admin/reservations', label: 'Reservations', icon: CalendarCheck, permission: 'admin.reservations' },
  { section: 'Customers', path: '/admin/delivery', label: 'Delivery Orders', icon: Truck, permission: 'admin.delivery' },
  { section: 'Customers', path: '/admin/takeaway', label: 'Take Away', icon: ShoppingCart, permission: 'admin.takeaway' },
  { section: 'Staff', path: '/admin/staff', label: 'Staff', icon: UserCircle, permission: 'admin.staff' },
  { section: 'Staff', path: '/admin/attendance', label: 'Attendance', icon: UserCheck, permission: 'admin.attendance' },
  { section: 'Staff', path: '/admin/payroll', label: 'Payroll', icon: WalletCards, permission: 'admin.payroll' },
  { section: 'Analytics', path: '/admin/reports', label: 'Reports', icon: BarChart3, permission: 'admin.reports' },
  { section: 'Analytics', path: '/admin/analytics', label: 'Analytics', icon: TrendingUp, permission: 'admin.analytics' },
  { section: 'Marketing', path: '/admin/offers', label: 'Offers', icon: TicketPercent, permission: 'admin.offers' },
  { section: 'Marketing', path: '/admin/coupons', label: 'Coupons', icon: Tag, permission: 'admin.coupons' },
  { section: 'Marketing', path: '/admin/loyalty', label: 'Loyalty', icon: Heart, permission: 'admin.loyalty' },
  { section: 'Marketing', path: '/admin/wallet', label: 'Wallet', icon: Wallet, permission: 'admin.wallet' },
  { section: 'Marketing', path: '/admin/membership', label: 'Membership', icon: Crown, permission: 'admin.membership' },
  { section: 'Feedback', path: '/admin/reviews', label: 'Reviews', icon: Star, permission: 'admin.reviews' },
  { section: 'Setup', path: '/admin/company', label: 'Company', icon: Building2, permission: 'admin.company' },
  { section: 'Setup', path: '/admin/branch', label: 'Branches', icon: MapPin, permission: 'admin.branch' },
  { section: 'Setup', path: '/admin/settings', label: 'Settings', icon: Settings, permission: 'admin.settings' },
  { section: 'Setup', path: '/admin/printer', label: 'Printer', icon: Printer, permission: 'admin.printer' },
  { section: 'Setup', path: '/admin/taxes', label: 'Taxes', icon: Percent, permission: 'admin.taxes' },
  { section: 'Setup', path: '/admin/notifications', label: 'Notifications', icon: Bell, permission: 'admin.notifications' },
  { section: 'Setup', path: '/admin/refunds', label: 'Refunds', icon: Undo2, permission: 'admin.refunds' },
  { section: 'Setup', path: '/admin/invoices', label: 'Invoices', icon: FileText, permission: 'admin.invoices' },
  { section: 'Setup', path: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, permission: 'admin.audit' },
];

export type ModuleMeta = {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  status: 'live' | 'beta' | 'coming_soon';
};

export const MODULE_META: Record<string, ModuleMeta> = {
  'super-admin/restaurants': { title: 'Restaurants', description: 'Manage all tenant restaurants on the platform.', icon: Building2, features: ['Tenant onboarding', 'Status control', 'Module toggles'], status: 'live' },
  'admin/pos': { title: 'POS Billing', description: 'Point of sale for in-store order entry and billing.', icon: Monitor, features: ['Quick billing', 'Split payments', 'Receipt print'], status: 'coming_soon' },
  'admin/variants': { title: 'Variants', description: 'Size, spice level, and custom item variants.', icon: Layers, features: ['Variant groups', 'Price modifiers'], status: 'coming_soon' },
  'admin/addons': { title: 'Addons', description: 'Extra toppings and add-on items.', icon: PackagePlus, features: ['Addon groups', 'Mandatory rules'], status: 'coming_soon' },
  'admin/combos': { title: 'Combos', description: 'Meal combos and bundled offers.', icon: Gift, features: ['Combo builder', 'Discount rules'], status: 'coming_soon' },
};

export function getNavForRole(role: AppRole): NavItem[] {
  if (role === 'super_admin') return SUPER_ADMIN_NAV;
  return RESTAURANT_ADMIN_NAV;
}

export function isSuperAdmin(role: AppRole | string | number | null | undefined): boolean {
  return role === 'super_admin' || role === 0 || role === '0';
}
