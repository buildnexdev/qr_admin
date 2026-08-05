import type { LucideIcon } from 'lucide-react';
import {
  UserCircle,
  Users,
  Building2,
  Tags,
  Utensils,
  Grid,
  ChefHat,
  ClipboardList,
  Receipt,
  Package,
  BarChart3,
  Layout,
  Layers,
  Truck,
  MapPinned,
  ShoppingCart,
  Factory,
  CalendarCheck2,
  Wallet,
  FileText,
  Printer,
  Undo2,
  TicketPercent,
  ScrollText,
  Bell,
  TrendingUp,
  ListOrdered,
  List,
  PieChart,
  UserRoundCog,
  Boxes,
  Percent,
  Crown,
} from 'lucide-react';

export type AdminMenuItem = {
  path: string;
  name: string;
  icon: LucideIcon;
  /** Shown as a small heading when it changes from the previous item */
  section?: string;
};

export const ADMIN_MENU: AdminMenuItem[] = [
  {
    path: '/admin/company',
    name: 'Company',
    icon: Layout,
  },
  {
    path: '/admin/branch',
    name: 'Branch',
    icon: Building2,
  },
  {
    path: '/admin/staff',
    name: 'Staff',
    icon: UserCircle,
  },
  {
    path: '/admin/customers',
    name: 'Customers',
    icon: Users,
  },
  {
    path: '/admin/categories',
    name: 'Categories',
    icon: Tags,
  },
  {
    path: '/admin/menu',
    name: 'Menu',
    icon: Utensils,
  },
  {
    path: '/admin/tables',
    name: 'Tables',
    icon: Grid,
  },
  {
    path: '/admin/kitchen',
    name: 'Kitchen',
    icon: ChefHat,
  },
  {
    path: '/admin/orders',
    name: 'Orders',
    icon: ClipboardList,
  },
  {
    path: '/admin/bills',
    name: 'Bills',
    icon: Receipt,
  },
  {
    path: '/admin/stocks',
    name: 'Stocks',
    icon: Package,
  },
  {
    section: 'More modules',
    path: '/admin/workspace',
    name: 'Module hub',
    icon: Layers,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/delivery',
    name: 'Delivery',
    icon: Truck,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/workspace/delivery-management',
    name: 'Delivery management',
    icon: MapPinned,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/workspace/purchase',
    name: 'Purchase',
    icon: ShoppingCart,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/workspace/suppliers',
    name: 'Suppliers',
    icon: Factory,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/workspace/attendance',
    name: 'Attendance',
    icon: CalendarCheck2,
  },
  {
    section: 'Operations & logistics',
    path: '/admin/workspace/expenses',
    name: 'Expenses',
    icon: Wallet,
  },
  {
    section: 'Billing & documents',
    path: '/admin/workspace/invoices',
    name: 'Invoices',
    icon: FileText,
  },
  {
    section: 'Billing & documents',
    path: '/admin/workspace/invoice-templates',
    name: 'Invoice / print templates',
    icon: Printer,
  },
  {
    section: 'Billing & documents',
    path: '/admin/workspace/refunds',
    name: 'Refunds & returns',
    icon: Undo2,
  },
  {
    section: 'Billing & documents',
    path: '/admin/workspace/coupons',
    name: 'Coupons & offers',
    icon: TicketPercent,
  },
  {
    section: 'Compliance',
    path: '/admin/workspace/audit-logs',
    name: 'Audit logs',
    icon: ScrollText,
  },
  {
    section: 'Compliance',
    path: '/admin/workspace/notifications',
    name: 'Notifications',
    icon: Bell,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-sales',
    name: 'Sales report',
    icon: TrendingUp,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-orders',
    name: 'Order report',
    icon: ListOrdered,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-items',
    name: 'Item-wise report',
    icon: List,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-categories',
    name: 'Category-wise report',
    icon: PieChart,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-staff',
    name: 'Staff performance',
    icon: UserRoundCog,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-inventory',
    name: 'Inventory report',
    icon: Boxes,
  },
  {
    section: 'Reports',
    path: '/admin/workspace/report-tax',
    name: 'Tax / GST report',
    icon: Percent,
  },
  {
    section: 'Subscriptions',
    path: '/admin/workspace/subscription-plans',
    name: 'Subscription plans',
    icon: Crown,
  },
  {
    path: '/admin/reports',
    name: 'Reports',
    icon: BarChart3,
  },
];
