import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { filterNavByPermissions, hasPermission, resolveAppRole } from '@/config/permissions';
import type { AppRole, NavItem } from '@/config/navigation';

export function useAppRole(): AppRole {
  const user = useSelector((state: RootState) => state.auth.user);
  return resolveAppRole(user?.role ?? 1);
}

export function usePermissions() {
  const role = useAppRole();

  return {
    role,
    can: (permission: string) => hasPermission(role, permission),
    filterNav: (items: NavItem[]) => filterNavByPermissions(items, role),
  };
}

export function useThemeMode() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const setTheme = (mode: 'light' | 'dark') => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  };

  return { toggle, setTheme };
}
