import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { resolveAppRole } from '@/config/permissions';
import type { AppRole } from '@/config/navigation';
import type { ReactNode } from 'react';

type RoleGuardProps = {
  children: ReactNode;
  /** Roles allowed to view this area */
  allow: AppRole[];
  /** Where to send unauthorized users */
  fallback?: string;
};

/**
 * Blocks routes by app role. Super admin → platform; owner/admin → restaurant app.
 */
export function RoleGuard({ children, allow, fallback }: RoleGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = resolveAppRole(user?.role);
  if (!allow.includes(role)) {
    const dest =
      fallback ??
      (role === 'super_admin' ? '/super-admin/companies' : '/admin');
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}

/** Post-login home path by role */
export function getHomePathForRole(roleRaw: string | number | null | undefined): string {
  const role = resolveAppRole(roleRaw);
  if (role === 'super_admin') return '/super-admin/companies';
  return '/admin';
}

export default RoleGuard;
