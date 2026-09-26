import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircleDashed, Loader2, Settings } from 'lucide-react';
import { configApi } from '@/api/configApi';
import { CONFIG_SECTIONS } from '@/config/configurationSections';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API_BASE_URL } from '@/routes/const';

export default function ConfigurationHub() {
  const [params, setParams] = useSearchParams();
  const branchId = params.get('branchId') ? Number(params.get('branchId')) : null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['config-hub', branchId],
    queryFn: () => configApi.getHub(branchId),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-for-config'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}api/branches`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const cardMap = new Map(
    ((data as { cards?: Array<{ type: string; configured: boolean; lastUpdated: string | null }> })
      ?.cards ?? []
    ).map((c) => [c.type, c])
  );

  const sections = CONFIG_SECTIONS.filter((s) => s.id !== 'hub');

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Configuration"
        description="Manage your restaurant POS settings from one place."
        icon={Settings}
      >
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
            value={branchId ?? ''}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('branchId', e.target.value);
              else next.delete('branchId');
              setParams(next);
            }}
          >
            <option value="">All branches (global)</option>
            {(branches as Array<{ branchID: number; branchName: string }> | undefined)?.map((b) => (
              <option key={b.branchID} value={b.branchID}>
                {b.branchName}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageHeader>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading configuration status…
        </div>
      )}

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="py-6 text-sm text-danger">
            {(error as Error).message || 'Failed to load configuration. Ensure backend tables exist (npm run db:config-tables).'}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, i) => {
            const meta = section.configType ? cardMap.get(section.configType) : undefined;
            const configured = section.configType ? Boolean(meta?.configured) : true;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="h-full hover:shadow-[var(--shadow-elevated)] transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant={configured ? 'success' : 'secondary'}>
                        {configured ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Configured
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CircleDashed className="h-3 w-3" /> Defaults
                          </span>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{section.label}</CardTitle>
                    <CardDescription className="line-clamp-2">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="mb-4 text-xs text-muted-foreground">
                      {meta?.lastUpdated
                        ? `Last updated ${new Date(meta.lastUpdated).toLocaleString('en-IN')}`
                        : 'Not saved yet — using system defaults'}
                    </p>
                    <Button asChild className="w-full" variant="outline">
                      <Link
                        to={
                          branchId
                            ? `${section.path}?branchId=${branchId}`
                            : section.path
                        }
                      >
                        Configure <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
