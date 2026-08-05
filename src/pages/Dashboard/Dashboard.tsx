import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  LayoutGrid,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Users,
} from 'lucide-react';
import { API_BASE_URL } from '../../routes/const';
import { PageHeader } from '@/components/organisms/PageHeader';
import { StatCard } from '@/components/organisms/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard } from 'lucide-react';

function orderTs(o: { timestamp?: string; created_at?: string }) {
  return o.timestamp ?? o.created_at;
}

function statusNorm(o: { status?: string }) {
  return String(o.status ?? '')
    .trim()
    .toLowerCase();
}

const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatInrCompact(val: number): string {
  const v = Math.abs(val);
  if (v >= 1e7) return `₹${(val / 1e7).toFixed(1)} Cr`;
  if (v >= 1e5) return `₹${(val / 1e5).toFixed(1)} L`;
  if (v >= 1e3) return `₹${(val / 1e3).toFixed(1)} k`;
  return `₹${Math.round(val)}`;
}

/** Dine-in vs delivery vs takeaway for distribution donut */
function orderChannel(o: Record<string, unknown>): 'dine' | 'delivery' | 'takeaway' {
  const raw = String(o.orderType ?? o.order_type ?? '').toLowerCase();
  if (raw.includes('deliver')) return 'delivery';
  if (raw.includes('take') || raw.includes('pickup') || raw.includes('parcel')) return 'takeaway';
  if (raw.includes('dine')) return 'dine';
  const table = o.tableId ?? o.table_id;
  const t = table != null ? String(table).trim() : '';
  if (t !== '' && t.toLowerCase() !== 'general') return 'dine';
  return 'delivery';
}

function isServedOrder(o: { status?: string }) {
  return ['served', 'completed'].includes(statusNorm(o));
}

function itemLineRevenue(it: Record<string, unknown>): number {
  const q = Number(it.quantity ?? 1);
  const p = parseFloat(String(it.price ?? it.price_at_time ?? 0));
  return q * p;
}

function orderStaffId(o: Record<string, unknown>): string | null {
  const raw = o.staffId ?? o.staff_id ?? o.waiter_id ?? o.handled_by ?? o.server_id;
  if (raw == null || raw === '') return null;
  return String(raw);
}

const Dashboard: React.FC = () => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, staffRes, tablesRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}api/orders`),
          axios.get(`${API_BASE_URL}api/staff`),
          axios.get(`${API_BASE_URL}api/tables`),
        ]);
        const oData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
        const sData = staffRes.status === 'fulfilled' ? staffRes.value.data : [];
        const tData = tablesRes.status === 'fulfilled' ? tablesRes.value.data : [];
        setOrders(Array.isArray(oData) ? oData : []);
        setStaff(Array.isArray(sData) ? sData : []);
        setTables(Array.isArray(tData) ? tData : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    void load();
  }, []);

  const tableLabel = (tableId: unknown) => {
    if (tableId == null || String(tableId).trim() === '') return 'Walk-in';
    const idStr = String(tableId);
    if (idStr.toLowerCase() === 'general') return 'General';
    const t = tables.find((x) => String(x.id) === idStr);
    return t?.name ? String(t.name) : `Table ${idStr}`;
  };

  const dayKey = new Date(selectedDate).toDateString();
  const todayOrders = orders.filter((o) => {
    const ts = orderTs(o);
    return ts && new Date(ts).toDateString() === dayKey;
  });

  const todayOrderCount = todayOrders.length;

  const todayEarnings = todayOrders
    .filter((o) => ['served', 'completed'].includes(statusNorm(o)))
    .reduce((sum, o) => sum + parseFloat(String(o.total ?? o.total_amount ?? 0)), 0);

  const workingStaff = staff.filter((s) => s.status).length;

  const todayCustomers = new Set(
    todayOrders.map((o) => o.customerName || o.customer_name || o.customer_phone || '')
  ).size;

  const pendingToday = todayOrders.filter((o) => ['pending', 'received'].includes(statusNorm(o))).length;

  const servedTodayCount = todayOrders.filter((o) => ['served', 'completed'].includes(statusNorm(o))).length;

  const { last7DayKeys, last7DayLabels } = useMemo(() => {
    const anchor = new Date(selectedDate + 'T12:00:00');
    const keys: string[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(anchor);
      d.setDate(d.getDate() - i);
      keys.push(d.toDateString());
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase());
    }
    return { last7DayKeys: keys, last7DayLabels: labels };
  }, [selectedDate]);

  const revenueSeries = useMemo(
    () =>
      last7DayKeys.map((dateStr) =>
        orders
          .filter((o) => {
            const ts = orderTs(o);
            return ts && new Date(ts).toDateString() === dateStr && ['served', 'completed'].includes(statusNorm(o));
          })
          .reduce((sum, o) => sum + parseFloat(String(o.total ?? o.total_amount ?? 0)), 0)
      ),
    [orders, last7DayKeys]
  );

  const distribution = useMemo(() => {
    let dine = 0;
    let delivery = 0;
    let takeaway = 0;
    for (const o of orders) {
      const ch = orderChannel(o);
      if (ch === 'dine') dine += 1;
      else if (ch === 'takeaway') takeaway += 1;
      else delivery += 1;
    }
    const total = dine + delivery + takeaway;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
    return {
      series: [dine, delivery, takeaway] as number[],
      total,
      dine,
      delivery,
      takeaway,
      pctDine: pct(dine),
      pctDelivery: pct(delivery),
      pctTakeaway: pct(takeaway),
    };
  }, [orders]);

  const bestMenu = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    for (const o of orders) {
      if (!isServedOrder(o)) continue;
      const items = Array.isArray(o.items) ? o.items : [];
      for (const it of items) {
        const row = it as Record<string, unknown>;
        const name = String(row.name ?? row.item_name ?? 'Item').trim();
        if (!name) continue;
        const addQty = Number(row.quantity ?? 1);
        const rev = itemLineRevenue(row);
        const cur = map.get(name) ?? { qty: 0, revenue: 0 };
        cur.qty += addQty;
        cur.revenue += rev;
        map.set(name, cur);
      }
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const bestTables = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number; label: string }>();
    for (const o of orders) {
      if (!isServedOrder(o)) continue;
      const tid = o.tableId ?? o.table_id;
      const key = tid == null || String(tid).trim() === '' ? '__walkin' : String(tid);
      const label = tableLabel(tid);
      const total = parseFloat(String(o.total ?? o.total_amount ?? 0));
      const cur = map.get(key) ?? { revenue: 0, orders: 0, label };
      cur.revenue += total;
      cur.orders += 1;
      cur.label = label;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders, tables]);

  const bestStaff = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) {
      if (!isServedOrder(o)) continue;
      const sid = orderStaffId(o as Record<string, unknown>);
      if (!sid) continue;
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }
    if (counts.size > 0) {
      return [...counts.entries()]
        .map(([id, servedCount]) => {
          const m = staff.find((s) => String(s.id) === id);
          return {
            key: id,
            name: m?.name ?? `Staff #${id}`,
            sub: m?.department || m?.role || '—',
            metric: servedCount,
            metricLabel: 'Served orders',
          };
        })
        .sort((a, b) => b.metric - a.metric)
        .slice(0, 5);
    }
    return staff
      .filter((s) => s.status)
      .sort((a, b) => {
        const da = String(a.department ?? '').toLowerCase();
        const db = String(b.department ?? '').toLowerCase();
        if (da.includes('kitchen') !== db.includes('kitchen')) return da.includes('kitchen') ? -1 : 1;
        return String(a.name).localeCompare(String(b.name));
      })
      .slice(0, 5)
      .map((s) => ({
        key: String(s.id),
        name: s.name,
        sub: s.department || s.role || 'Team',
        metric: null as number | null,
        metricLabel: 'Active',
      }));
  }, [orders, staff]);

  const staffHasOrderStats = useMemo(
    () => orders.some((o) => isServedOrder(o) && orderStaffId(o as Record<string, unknown>)),
    [orders]
  );

  const areaChartOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.42, opacityTo: 0.06, stops: [0, 90, 100] },
      },
      colors: ['#22c55e'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: last7DayLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => formatInrCompact(val),
          style: { colors: '#94a3b8', fontSize: '11px' },
        },
      },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4, padding: { left: 8, right: 8 } },
      tooltip: { theme: 'light', y: { formatter: (val: number) => inrFull.format(val) } },
    }),
    [last7DayLabels]
  );

  const donutChartOptions: ApexOptions = useMemo(
    () => ({
      labels: ['Dine-in', 'Delivery', 'Takeaway'],
      colors: ['#22c55e', '#f97316', '#3b82f6'],
      chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: true,
                showAlways: true,
                label: 'TOTAL',
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                formatter: () => distribution.total.toLocaleString('en-IN'),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { width: 0 },
      tooltip: { y: { formatter: (val: number) => `${val} orders` } },
    }),
    [distribution]
  );

  const revenueData = revenueSeries.length ? revenueSeries : [0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Dashboard" description="Real-time overview of your restaurant" icon={LayoutDashboard} />
        <div className="relative shrink-0">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const el = dateInputRef.current;
              if (el && typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                (el as HTMLInputElement & { showPicker: () => void }).showPicker();
              } else {
                el?.click();
              }
            }}
          >
            <Calendar className="h-4 w-4" />
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Button>
          <input
            ref={dateInputRef}
            type="date"
            className="absolute inset-0 opacity-0 pointer-events-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            tabIndex={-1}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Today Orders" value={todayOrderCount} icon={ShoppingBag} />
        <StatCard title="Today Earnings" value={todayEarnings} prefix="currency" icon={IndianRupee} />
        <StatCard title="Working Staff" value={workingStaff} icon={Users} />
        <StatCard title="Today Customers" value={todayCustomers} icon={TrendingUp} />
        <StatCard title="Pending Today" value={pendingToday} icon={Clock} />
        <StatCard title="Served Today" value={servedTodayCount} icon={CheckCircle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Daily Sales Revenue</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </div>
            <Badge variant="success">Revenue</Badge>
          </CardHeader>
          <CardContent>
            <Chart options={areaChartOptions} series={[{ name: 'Revenue', data: revenueData }]} type="area" height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Distribution</CardTitle>
            <CardDescription>Dine-in · Delivery · Takeaway</CardDescription>
          </CardHeader>
          <CardContent>
            {distribution.total > 0 ? (
              <>
                <Chart options={donutChartOptions} series={distribution.series} type="donut" height={220} />
                <div className="mt-4 space-y-2">
                  {[
                    { label: 'Dine-in', pct: distribution.pctDine, color: 'bg-success' },
                    { label: 'Delivery', pct: distribution.pctDelivery, color: 'bg-warning' },
                    { label: 'Takeaway', pct: distribution.pctTakeaway, color: 'bg-primary' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        {item.label}
                      </div>
                      <span className="font-semibold">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Best selling menu', sub: 'By line revenue', icon: Utensils, rows: bestMenu, render: (row: { name: string; qty: number; revenue: number }) => ({ main: row.name, meta: `${row.qty} sold`, value: inrFull.format(row.revenue) }) },
          { title: 'Best sale tables', sub: 'By bill total', icon: LayoutGrid, rows: bestTables, render: (row: { label: string; orders: number; revenue: number }) => ({ main: row.label, meta: `${row.orders} bills`, value: inrFull.format(row.revenue) }) },
          { title: 'Best staff', sub: staffHasOrderStats ? 'By served orders' : 'Active team', icon: Award, rows: bestStaff, render: (row: { name: string; sub: string; metric: number | null; metricLabel: string }) => ({ main: row.name, meta: row.sub, value: row.metric != null ? String(row.metric) : row.metricLabel }) },
        ].map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <section.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.sub}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {section.rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
              ) : (
                <ol className="space-y-2">
                  {section.rows.map((row, idx) => {
                    const r = section.render(row as never);
                    return (
                      <li key={idx} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-muted/40 transition-colors">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.main}</p>
                          <p className="text-xs text-muted-foreground">{r.meta}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary">{r.value}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
