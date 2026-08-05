import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { AppHeader } from '@/components/organisms/AppHeader';

export function AppShell() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="min-h-screen pl-[260px] transition-all duration-200 max-lg:pl-[72px]">
        <AppHeader />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 admin-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
