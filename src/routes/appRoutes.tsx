import { type RouteObject } from 'react-router-dom';
import AppShell from '@/components/templates/AppShell';
import { GenericModulePage } from '@/pages/modules/GenericModulePage';
import { MODULE_DEFINITIONS } from '@/config/moduleDefinitions';

// Existing feature pages (legacy — wrapped in new shell)
import Dashboard from '@/pages/Dashboard/Dashboard';
import Company from '@/pages/Company/Company';
import Branch from '@/pages/Branch/Branch';
import Staff from '@/pages/Staff/StaffDetailsPages';
import Categories from '@/pages/Categories/Categories';
import Menu from '@/pages/Menu/Menu';
import Tables from '@/pages/Tables/Tables';
import Kitchen from '@/pages/Kitchen/Kitchen';
import Orders from '@/pages/Orders/Orders';
import Bills from '@/pages/Bill/Bills';
import Stocks from '@/pages/Stocks/Stocks';
import Reports from '@/pages/Reports/Reports';
import Profile from '@/pages/Profile/Profile';
import CustomerPage from '@/pages/customer/CustomerPage';
import Delivery from '@/pages/Delivery/Delivery';

// New pages
import SuperAdminDashboard from '@/pages/super-admin/SuperAdminDashboard';

function moduleRoute(key: string) {
  const def = MODULE_DEFINITIONS[key];
  return def ? <GenericModulePage module={def} /> : null;
}

/** Restaurant Admin routes */
export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'company', element: <Company /> },
      { path: 'branch', element: <Branch /> },
      { path: 'staff', element: <Staff /> },
      { path: 'customers', element: <CustomerPage /> },
      { path: 'categories', element: <Categories /> },
      { path: 'menu', element: <Menu /> },
      { path: 'tables', element: <Tables /> },
      { path: 'kitchen', element: <Kitchen /> },
      { path: 'delivery', element: <Delivery /> },
      { path: 'orders', element: <Orders /> },
      { path: 'bills', element: <Bills /> },
      { path: 'stocks', element: <Stocks /> },
      { path: 'reports', element: <Reports /> },
      { path: 'profile', element: <Profile /> },
      // New module routes
      { path: 'pos', element: moduleRoute('pos') },
      { path: 'variants', element: moduleRoute('variants') },
      { path: 'addons', element: moduleRoute('addons') },
      { path: 'combos', element: moduleRoute('combos') },
      { path: 'stock', element: moduleRoute('stock') },
      { path: 'purchase', element: moduleRoute('purchase') },
      { path: 'suppliers', element: moduleRoute('suppliers') },
      { path: 'expenses', element: moduleRoute('expenses') },
      { path: 'reservations', element: moduleRoute('reservations') },
      { path: 'takeaway', element: moduleRoute('takeaway') },
      { path: 'attendance', element: moduleRoute('attendance') },
      { path: 'payroll', element: moduleRoute('payroll') },
      { path: 'analytics', element: moduleRoute('analytics') },
      { path: 'offers', element: moduleRoute('offers') },
      { path: 'coupons', element: moduleRoute('coupons') },
      { path: 'loyalty', element: moduleRoute('loyalty') },
      { path: 'wallet', element: moduleRoute('wallet') },
      { path: 'membership', element: moduleRoute('membership') },
      { path: 'reviews', element: moduleRoute('reviews') },
      { path: 'settings', element: moduleRoute('settings') },
      { path: 'printer', element: moduleRoute('printer') },
      { path: 'taxes', element: moduleRoute('taxes') },
      { path: 'notifications', element: moduleRoute('notifications') },
      { path: 'refunds', element: moduleRoute('refunds') },
      { path: 'invoices', element: moduleRoute('invoices') },
      { path: 'audit-logs', element: moduleRoute('audit-logs') },
    ],
  },
];

/** Super Admin routes */
export const superAdminRoutes: RouteObject[] = [
  {
    path: '/super-admin',
    element: <AppShell />,
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: 'restaurants', element: moduleRoute('super-restaurants') },
      { path: 'subscriptions', element: moduleRoute('super-subscriptions') },
      { path: 'plans', element: moduleRoute('super-plans') },
      { path: 'invoices', element: moduleRoute('super-invoices') },
      { path: 'revenue', element: moduleRoute('super-revenue') },
      { path: 'tickets', element: moduleRoute('super-tickets') },
      { path: 'coupons', element: moduleRoute('super-coupons') },
      { path: 'promo-codes', element: moduleRoute('super-promo') },
      { path: 'cms', element: moduleRoute('super-cms') },
      { path: 'announcements', element: moduleRoute('super-announcements') },
      { path: 'settings', element: moduleRoute('super-settings') },
      { path: 'taxes', element: moduleRoute('super-taxes') },
      { path: 'payment-gateway', element: moduleRoute('super-payment') },
      { path: 'feature-flags', element: moduleRoute('super-features') },
      { path: 'audit-logs', element: moduleRoute('super-audit') },
      { path: 'roles', element: moduleRoute('super-roles') },
    ],
  },
];

export const contentRouters: RouteObject[] = [...adminRoutes, ...superAdminRoutes];
