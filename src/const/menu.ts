import {
  UserCircle,
  Shield,
  Building2,
  Tags,
  Utensils,
  Grid,
  ChefHat,
  ClipboardList,
  Receipt,
  Package,
  BarChart3,
  Layout
} from 'lucide-react';

export const ADMIN_MENU = [
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
    path: '/admin/roles',
    name: 'Roles',
    icon: Shield,
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
    path: '/admin/reports',
    name: 'Reports',
    icon: BarChart3,
  }
];
