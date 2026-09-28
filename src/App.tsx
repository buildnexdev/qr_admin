import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { KeyRound } from 'lucide-react';
import type { RootState } from '@/store';
import LoginPage from '@/pages/auth/LoginPage';
import Register from '@/pages/Register/Register';
import CustomerOrderPage from '@/pages/CustomerOrder/CustomerOrderPage';
import { GenericModulePage } from '@/pages/modules/GenericModulePage';
import { contentRouters } from '@/routes/appRoutes';
import { getHomePathForRole } from '@/components/templates/RoleGuard';

function ForgotPasswordPage() {
  return (
    <GenericModulePage
      module={{
        title: 'Forgot Password',
        description: 'Reset your password via phone OTP.',
        icon: KeyRound,
        status: 'beta',
        features: ['Phone OTP reset', 'Secure password update'],
      }}
    />
  );
}

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
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/:companySlug/table/:tableKey', element: <CustomerOrderPage /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> },
  ];

  return useRoutes(routes);
}

export default App;
