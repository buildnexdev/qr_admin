import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { CONFIG_SECTIONS } from '@/config/configurationSections';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/routes/const';

export function ConfigurationLayout() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const branchId = params.get('branchId');

  const { data: branches } = useQuery({
    queryKey: ['branches-for-config-nav'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}api/branches`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  let lastGroup = '';

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="sticky top-20 rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="border-b border-border px-4 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Configuration</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Restaurant POS settings</p>
            {branchId && (
              <Badge variant="secondary" className="mt-2">
                Branch override: #{branchId}
              </Badge>
            )}
          </div>
          <nav className="max-h-[calc(100vh-14rem)] overflow-y-auto scrollbar-thin p-2">
            {CONFIG_SECTIONS.map((section) => {
              const showGroup = section.group !== lastGroup;
              lastGroup = section.group;
              const active =
                section.id === 'hub'
                  ? location.pathname === '/admin/configuration'
                  : location.pathname.startsWith(section.path);

              return (
                <div key={section.id}>
                  {showGroup && (
                    <p className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-1">
                      {section.group}
                    </p>
                  )}
                  <Link
                    to={branchId ? `${section.path}?branchId=${branchId}` : section.path}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <section.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <label className="text-[10px] font-semibold uppercase text-muted-foreground">
              Branch scope
            </label>
            <select
              className="mt-1 flex h-9 w-full rounded-lg border border-input bg-card px-2 text-sm"
              value={branchId ?? ''}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set('branchId', e.target.value);
                else next.delete('branchId');
                setParams(next, { replace: true });
              }}
            >
              <option value="">Company (global)</option>
              {(
                branches as Array<{ branchID: number; branchName: string }> | undefined
              )?.map((b) => (
                <option key={b.branchID} value={b.branchID}>
                  {b.branchName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Branch overrides apply on top of global config.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default ConfigurationLayout;
