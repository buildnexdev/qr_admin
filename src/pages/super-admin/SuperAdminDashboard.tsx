import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2,
  CreditCard,
  TrendingUp,
  Users,
  ArrowUpRight,
  Crown,
} from 'lucide-react';
import axios from 'axios';
import { PageHeader } from '@/components/organisms/PageHeader';
import { StatCard } from '@/components/organisms/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/routes/const';
import { formatCurrency } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['super-admin', 'companies'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}api/company`);
      return res.data as Array<{ companyID: number; companyName: string; isActive: boolean; is_subscription?: boolean }>;
    },
  });

  const activeCount = companies?.filter((c) => c.isActive).length ?? 0;
  const totalCount = companies?.length ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        description="Overview of all restaurants and platform metrics"
        icon={Crown}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Restaurants" value={totalCount} change={`${activeCount} active`} changeType="positive" icon={Building2} loading={isLoading} />
        <StatCard title="Monthly Revenue" value={2450000} prefix="currency" change="+12.5% vs last month" changeType="positive" icon={TrendingUp} />
        <StatCard title="Active Subscriptions" value={activeCount} change="Pro & Enterprise" changeType="neutral" icon={CreditCard} loading={isLoading} />
        <StatCard title="Platform Users" value="2,450" change="+180 this month" changeType="positive" icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Restaurants</CardTitle>
            <CardDescription>Latest tenant registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(companies ?? []).slice(0, 5).map((company) => (
                  <div
                    key={company.companyID}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{company.companyName}</p>
                        <p className="text-xs text-muted-foreground">ID: {company.companyID}</p>
                      </div>
                    </div>
                    <Badge variant={company.isActive ? 'success' : 'secondary'}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {!companies?.length && (
                  <p className="text-sm text-muted-foreground text-center py-8">No restaurants yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Platform management shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Add Restaurant', path: '/super-admin/restaurants', icon: Building2 },
                { label: 'Manage Plans', path: '/super-admin/plans', icon: Crown },
                { label: 'View Revenue', path: '/super-admin/revenue', icon: TrendingUp },
                { label: 'Support Tickets', path: '/super-admin/tickets', icon: CreditCard },
              ].map((action) => (
                <a
                  key={action.path}
                  href={action.path}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Overview</CardTitle>
          <CardDescription>Platform MRR trend (demo data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {[65, 72, 68, 80, 85, 78, 92, 88, 95, 100, 98, 110].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Total MRR: <span className="font-semibold text-foreground">{formatCurrency(2450000)}</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
