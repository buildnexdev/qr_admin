import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { AppHeader } from '@/components/organisms/AppHeader';
import { AppFooter } from '@/components/organisms/AppFooter';

export function AppShell() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const sidebarWidth = sidebarCollapsed ? 72 : 268;
  /* 8px inset matches aside left offset */
  const contentPad = sidebarWidth + 8;

  return (
    <div className="min-h-screen bg-[#F4F8F5]">
      <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div
        className="flex min-h-screen flex-col transition-[padding] duration-200 max-lg:!pl-[72px]"
        style={{ paddingLeft: contentPad }}
      >
        <AppHeader />
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8 admin-page">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

export default AppShell;
