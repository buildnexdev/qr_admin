import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import LoginPage from '@/pages/auth/LoginPage';
import CustomerOrderPage from '@/pages/CustomerOrder/CustomerOrderPage';
import { contentRouters } from '@/routes/appRoutes';
import { getHomePathForRole } from '@/components/templates/RoleGuard';

function RootRedirect() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }
  return <LoginPage />;
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const routes: RouteObject[] = [
    { path: '/', element: <RootRedirect /> },
    { path: '/login', element: <RootRedirect /> },
    { path: '/:companySlug/table/:tableKey', element: <CustomerOrderPage /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> },
  ];

  return useRoutes(routes);
}

export default App;
