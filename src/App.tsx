import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from '@/pages/auth/LoginPage';
import Register from '@/pages/Register/Register';
import Landing from '@/pages/Landing/Landing';
import CustomerOrderPage from '@/pages/CustomerOrder/CustomerOrderPage';
import { contentRouters } from '@/routes/appRoutes';
import { GenericModulePage } from '@/pages/modules/GenericModulePage';
import { KeyRound } from 'lucide-react';

function ForgotPasswordPage() {
  return (
    <GenericModulePage
      module={{
        title: 'Forgot Password',
        description: 'Reset your password via email or phone OTP.',
        icon: KeyRound,
        status: 'beta',
        features: ['Email reset link', 'Phone OTP reset', '2FA verification'],
      }}
    />
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const routes: RouteObject[] = [
    { path: '/', element: <Landing /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/:companySlug/table/:tableKey', element: <CustomerOrderPage /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> },
  ];

  return useRoutes(routes);
}

export default App;
