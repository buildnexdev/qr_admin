import {
  UserCircle,
  Building2,
  Tags,
  Utensils,
  Grid,
  ChefHat,
  ClipboardList,
  Receipt,
  Package,
  BarChart3
} from 'lucide-react';

export const ADMIN_MENU = [
  {
    path: '/branch',
    name: 'Branch',
    icon: Building2,
  },
  {
    path: '/staff',
    name: 'Staff',
    icon: UserCircle,
  },
  {
    path: '/categories',
    name: 'Categories',
    icon: Tags,
  },
  {
    path: '/menu',
    name: 'Menu',
    icon: Utensils,
  },
  {
    path: '/tables',
    name: 'Tables',
    icon: Grid,
  },
  {
    path: '/kitchen',
    name: 'Kitchen',
    icon: ChefHat,
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: ClipboardList,
  },
  {
    path: '/bills',
    name: 'Bills',
    icon: Receipt,
  },
  {
    path: '/stocks',
    name: 'Stocks',
    icon: Package,
  },
  {
    path: '/reports',
    name: 'Reports',
    icon: BarChart3,
  }
];
