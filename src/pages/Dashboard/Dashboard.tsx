import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  Clock,
  IndianRupee,
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../routes/const';
import { PageHeader } from '@/components/organisms/PageHeader';
import { StatCard } from '@/components/organisms/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

type OrderRow = {
  id: number;
  customerName?: string;
  customer_name?: string;
  status?: string;
  total?: number;
  total_amount?: number | string;
  timestamp?: string;
  created_at?: string;
  items?: unknown[];
};

function statusNorm(s?: string) {
  return String(s ?? '').trim().toLowerCase();
}

function orderTotal(o: OrderRow) {
  const raw = o.total ?? o.total_amount ?? 0;
  return Number(raw) || 0;
}

function guestName(o: OrderRow) {
  return o.customerName || o.customer_name || 'Guest';
}

export default function Dashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [ordersRes, menuRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}api/orders`),
          axios.get(`${API_BASE_URL}api/menu`),
        ]);
        if (cancelled) return;
        if (ordersRes.status === 'fulfilled') {
          const data = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
          setOrders(data);
        }
        if (menuRes.status === 'fulfilled') {
          const data = Array.isArray(menuRes.value.data) ? menuRes.value.data : [];
          setMenuCount(data.length);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todays = orders.filter((o) => {
      const ts = o.timestamp || o.created_at;
      if (!ts) return false;
      return new Date(ts) >= today;
    });
    const preparing = orders.filter((o) => ['preparing', 'pending', 'confirmed'].includes(statusNorm(o.status)));
    const served = orders.filter((o) => ['served', 'completed'].includes(statusNorm(o.status)));
    const revenue = todays.reduce((sum, o) => sum + orderTotal(o), 0);
    return {
      todayCount: todays.length,
      preparing: preparing.length,
      served: served.length,
      revenue,
      recent: [...orders].slice(0, 8),
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Live overview of orders, kitchen, and menu."
        icon={LayoutDashboard}
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/orders">View orders</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/admin/pos">Open POS</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's orders"
          value={stats.todayCount}
          icon={ShoppingBag}
          loading={loading}
          change="Orders placed today"
        />
        <StatCard
          title="Revenue today"
          value={stats.revenue}
          icon={IndianRupee}
          loading={loading}
          prefix="currency"
          change="Collected from today's tickets"
          changeType="positive"
        />
        <StatCard
          title="In kitchen"
          value={stats.preparing}
          icon={Clock}
          loading={loading}
          change="Preparing / pending"
        />
        <StatCard
          title="Menu items"
          value={menuCount}
          icon={Utensils}
          loading={loading}
          change={`${stats.served} served overall`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <CardDescription>Latest tickets from the floor</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : stats.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recent.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        #{String(o.id).slice(-4)} · {guestName(o)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.timestamp || o.created_at
                          ? new Date(o.timestamp || o.created_at!).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {o.status || 'pending'}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(orderTotal(o))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Jump into daily operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { to: '/admin/menu', label: 'Manage menu', icon: Utensils },
              { to: '/admin/kitchen', label: 'Kitchen display', icon: CheckCircle },
              { to: '/admin/tables', label: 'QR tables', icon: LayoutDashboard },
              { to: '/admin/customers', label: 'Customers', icon: Users },
            ].map(({ to, label, icon: Icon }) => (
              <Button key={to} asChild variant="outline" className="justify-start h-11">
                <Link to={to}>
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
