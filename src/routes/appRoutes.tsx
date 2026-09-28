import { Navigate, type RouteObject } from 'react-router-dom';
import AppShell from '@/components/templates/AppShell';
import { RoleGuard } from '@/components/templates/RoleGuard';
import { GenericModulePage } from '@/pages/modules/GenericModulePage';
import { MODULE_DEFINITIONS } from '@/config/moduleDefinitions';

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
import SuperAdminDashboard from '@/pages/super-admin/SuperAdminDashboard';

import ConfigurationLayout from '@/pages/configuration/ConfigurationLayout';
import ConfigurationHub from '@/pages/configuration/ConfigurationHub';
import {
  RestaurantConfigPage,
  BranchConfigPage,
  PosConfigPage,
  BillingConfigPage,
  TaxConfigPage,
  OrderConfigPage,
  TableConfigPage,
  KotConfigPage,
  MenuConfigPage,
  InventoryConfigPage,
  PaymentConfigPage,
  DiscountConfigPage,
  CustomerConfigPage,
  QrConfigPage,
  PrinterConfigPage,
  ReceiptConfigPage,
  BusinessHoursConfigPage,
  NotificationsConfigPage,
  UsersConfigPage,
  GeneralConfigPage,
} from '@/pages/configuration/sectionPages';

function moduleRoute(key: string) {
  const def = MODULE_DEFINITIONS[key];
  return def ? <GenericModulePage module={def} /> : null;
}

/** Restaurant Admin / Owner — full restaurant access */
export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <RoleGuard allow={['owner', 'admin', 'manager', 'cashier', 'waiter', 'kitchen', 'delivery', 'accountant', 'inventory_manager', 'support']}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
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
      {
        path: 'configuration',
        element: <ConfigurationLayout />,
        children: [
          { index: true, element: <ConfigurationHub /> },
          { path: 'restaurant', element: <RestaurantConfigPage /> },
          { path: 'branch', element: <BranchConfigPage /> },
          { path: 'pos', element: <PosConfigPage /> },
          { path: 'billing', element: <BillingConfigPage /> },
          { path: 'tax', element: <TaxConfigPage /> },
          { path: 'order', element: <OrderConfigPage /> },
          { path: 'table', element: <TableConfigPage /> },
          { path: 'kot', element: <KotConfigPage /> },
          { path: 'menu', element: <MenuConfigPage /> },
          { path: 'inventory', element: <InventoryConfigPage /> },
          { path: 'payment', element: <PaymentConfigPage /> },
          { path: 'discount', element: <DiscountConfigPage /> },
          { path: 'customer', element: <CustomerConfigPage /> },
          { path: 'qr', element: <QrConfigPage /> },
          { path: 'printer', element: <PrinterConfigPage /> },
          { path: 'receipt', element: <ReceiptConfigPage /> },
          { path: 'business-hours', element: <BusinessHoursConfigPage /> },
          { path: 'notifications', element: <NotificationsConfigPage /> },
          { path: 'users', element: <UsersConfigPage /> },
          { path: 'general', element: <GeneralConfigPage /> },
        ],
      },
      { path: 'pos', element: moduleRoute('pos') },
      { path: 'variants', element: moduleRoute('variants') },
      { path: 'addons', element: moduleRoute('addons') },
      { path: 'combos', element: moduleRoute('combos') },
      { path: 'stock', element: <Navigate to="/admin/stocks" replace /> },
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
      { path: 'settings', element: <ConfigurationHub /> },
      { path: 'printer', element: <PrinterConfigPage /> },
      { path: 'taxes', element: <TaxConfigPage /> },
      { path: 'notifications', element: <NotificationsConfigPage /> },
      { path: 'refunds', element: moduleRoute('refunds') },
      { path: 'invoices', element: moduleRoute('invoices') },
      { path: 'audit-logs', element: moduleRoute('audit-logs') },
    ],
  },
];

/** Super Admin — platform companies & system */
export const superAdminRoutes: RouteObject[] = [
  {
    path: '/super-admin',
    element: (
      <RoleGuard allow={['super_admin']}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: 'companies', element: <Company /> },
      { path: 'restaurants', element: <Navigate to="/super-admin/companies" replace /> },
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
