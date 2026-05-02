import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { ApexOptions } from 'apexcharts';
import {
  Grid,
  Utensils,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  ShoppingBag,
  Calendar,
  ChefHat,
  Store,
  Tags,
  ArrowRight,
} from 'lucide-react';
import Chart from 'react-apexcharts';
import './Dashboard.scss';
import { API_BASE_URL } from '../../routes/const';

type DashData = {
  orders: any[];
  tables: any[];
  staff: any[];
  menu: any[];
  stocks: any[];
  branches: any[];
  categories: any[];
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<DashData>({
    orders: [],
    tables: [],
    staff: [],
    menu: [],
    stocks: [],
    branches: [],
    categories: [],
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          tablesRes,
          menuRes,
          ordersRes,
          staffRes,
          stocksRes,
          branchesRes,
          categoriesRes,
        ] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}api/tables`),
          axios.get(`${API_BASE_URL}api/menu`),
          axios.get(`${API_BASE_URL}api/orders`),
          axios.get(`${API_BASE_URL}api/staff`),
          axios.get(`${API_BASE_URL}api/stocks`),
          axios.get(`${API_BASE_URL}api/branches`),
          axios.get(`${API_BASE_URL}api/categories`),
        ]);

        setData({
          tables: tablesRes.status === 'fulfilled' ? tablesRes.value.data : [],
          menu: menuRes.status === 'fulfilled' ? menuRes.value.data : [],
          orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data : [],
          staff: staffRes.status === 'fulfilled' ? staffRes.value.data : [],
          stocks: stocksRes.status === 'fulfilled' ? stocksRes.value.data : [],
          branches: branchesRes.status === 'fulfilled' ? branchesRes.value.data : [],
          categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : [],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchAll();
  }, []);

  const today = new Date(selectedDate).toDateString();
  const todayOrders = data.orders.filter((o) => {
    const ts = o.timestamp ?? o.created_at;
    return ts && new Date(ts).toDateString() === today;
  });

  const orderStats = {
    total: todayOrders.length,
    pending: todayOrders.filter((o) => o.status === 'Pending').length,
    preparing: todayOrders.filter((o) => o.status === 'Preparing').length,
    ready: todayOrders.filter((o) => o.status === 'Ready').length,
    served: todayOrders.filter((o) => o.status === 'Served').length,
    cancelled: todayOrders.filter((o) => o.status === 'Cancelled').length,
  };

  const revenue = todayOrders
    .filter((o) => o.status === 'Served')
    .reduce((sum, o) => sum + parseFloat(String(o.total ?? o.total_amount ?? 0)), 0);

  const tableStats = {
    total: data.tables.length,
    occupied: data.tables.filter((t) => t.status === 'Occupied' || t.is_occupied).length,
    available: data.tables.filter((t) => t.status === 'Available' || !t.is_occupied).length,
  };

  const staffStats = {
    total: data.staff.length,
    online: data.staff.filter((s) => s.status).length,
    busy: Math.max(0, Math.floor(data.staff.filter((s) => s.status).length * 0.7)),
  };

  const customerCount = new Set(
    todayOrders.map((o) => o.customerName || o.customer_name || o.customer_phone || '')
  ).size;

  const stockStats = {
    total: data.stocks.length,
    low: data.stocks.filter((s) => Number(s.quantity) <= Number(s.minThreshold ?? s.min_threshold ?? 0)).length,
  };

  const last7Days = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toDateString();
      }).reverse(),
    []
  );

  const last7DayLabels = useMemo(
    () =>
      last7Days.map((d) => {
        const parts = d.split(' ');
        return `${parts[1]} ${parts[2]}`;
      }),
    [last7Days]
  );

  const revenueTrend = useMemo(
    () =>
      last7Days.map((dateStr) =>
        data.orders
          .filter((o) => {
            const ts = o.timestamp ?? o.created_at;
            return (
              ts &&
              new Date(ts).toDateString() === dateStr &&
              o.status === 'Served'
            );
          })
          .reduce((sum, o) => sum + parseFloat(String(o.total ?? o.total_amount ?? 0)), 0)
      ),
    [data.orders, last7Days]
  );

  const ordersPerDay = useMemo(
    () =>
      last7Days.map((dateStr) =>
        data.orders.filter((o) => {
          const ts = o.timestamp ?? o.created_at;
          return ts && new Date(ts).toDateString() === dateStr;
        }).length
      ),
    [data.orders, last7Days]
  );

  const statusDistribution = useMemo(
    () => ({
      labels: ['Served', 'Preparing', 'Pending', 'Cancelled'],
      series: [
        data.orders.filter((o) => o.status === 'Served').length,
        data.orders.filter((o) => o.status === 'Preparing').length,
        data.orders.filter((o) => o.status === 'Pending').length,
        data.orders.filter((o) => o.status === 'Cancelled').length,
      ],
    }),
    [data.orders]
  );

  const avgBillToday =
    orderStats.total > 0 ? (revenue / orderStats.total).toFixed(1) : '0.0';

  const recentOrders = useMemo(() => {
    return [...data.orders]
      .sort((a, b) => {
        const bt = b.timestamp ?? b.created_at;
        const at = a.timestamp ?? a.created_at;
        return new Date(bt).getTime() - new Date(at).getTime();
      })
      .slice(0, 6);
  }, [data.orders]);

  const hasOrderStatusData = useMemo(
    () => statusDistribution.series.some((n) => n > 0),
    [statusDistribution.series]
  );

  const areaChartOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      xaxis: {
        categories: last7DayLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#64748b', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)}`,
          style: { colors: '#64748b' },
        },
      },
      grid: { borderColor: 'rgba(45, 92, 254, 0.08)', strokeDashArray: 4 },
      colors: ['#2d5cfe'],
      tooltip: { theme: 'light', y: { formatter: (val: number) => `$${val.toFixed(2)}` } },
    }),
    [last7DayLabels]
  );

  const barChartOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      plotOptions: {
        bar: { borderRadius: 10, columnWidth: '58%', dataLabels: { position: 'top' } },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val ? String(val) : ''),
        offsetY: -18,
        style: { fontSize: '11px', colors: ['#1e3a8a'] },
      },
      xaxis: {
        categories: last7DayLabels,
        axisBorder: { show: false },
        labels: { style: { colors: '#64748b', fontSize: '11px' } },
      },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      grid: { borderColor: 'rgba(45, 92, 254, 0.06)', strokeDashArray: 4 },
      colors: ['#5b7cff'],
      tooltip: { y: { formatter: (val: number) => `${val} orders` } },
    }),
    [last7DayLabels]
  );

  const donutChartOptions: ApexOptions = useMemo(
    () => ({
      labels: statusDistribution.labels,
      colors: ['#10b981', '#f59e0b', '#6366f1', '#f43f5e'],
      chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Orders',
                fontSize: '13px',
                fontWeight: 600,
                formatter: () => String(data.orders.length),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontSize: '12px', fontWeight: 500 },
      stroke: { show: false },
      tooltip: { y: { formatter: (val: number) => `${val} orders` } },
    }),
    [statusDistribution.labels, data.orders.length]
  );

  const sparklineOpts = (color: string): ApexOptions => ({
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.8, opacityFrom: 0.35, opacityTo: 0.05 } },
    colors: [color],
    tooltip: { enabled: true, fixed: { enabled: false } },
  });

  return (
    <div className="dash-page">
      {/* ── Welcome strip ───────────────────────────────── */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome__title">Restaurant overview</h1>
          <p className="dash-welcome__sub">
            Track sales, operations, and kitchen flow in one place. Data refreshes when you load this page.
          </p>
        </div>
        <div className="dash-welcome__pill">
          <span className="dash-welcome__dot" aria-hidden />
          Live workspace
        </div>
      </div>

      {/* ── Today's Summary ───────────────────────────────── */}
      <div className="section-title">
        {selectedDate === new Date().toISOString().split('T')[0]
          ? "Today's Summary"
          : 'Daily Summary'}
        <div className="date-picker-container">
          <button
            type="button"
            className="date-display-wrap"
            onClick={() => {
              const el = dateInputRef.current;
              if (el && typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                (el as HTMLInputElement & { showPicker: () => void }).showPicker();
              } else {
                el?.click();
              }
            }}
          >
            <Calendar size={16} className="date-icon" />
            <span className="section-date">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </button>
          <input
            ref={dateInputRef}
            id="dash-date-picker"
            type="date"
            className="hidden-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            tabIndex={-1}
          />
        </div>
      </div>
      <div className="dash-main-grid four-col">
        <div className="stat-card">
          <div className="stat-icon-wrap purple">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today Orders</span>
            <div className="stat-value">{String(orderStats.total).padStart(2, '0')}</div>
            <span className="stat-trend positive">+{orderStats.pending} pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today Earnings</span>
            <div className="stat-value">${revenue.toLocaleString()}</div>
            <span className="stat-trend positive">Average bill: ${avgBillToday}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Working Staff</span>
            <div className="stat-value">{String(staffStats.online).padStart(2, '0')}</div>
            <span className="stat-trend">{staffStats.busy} active now</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today Customers</span>
            <div className="stat-value">{String(customerCount).padStart(2, '0')}</div>
            <span className="stat-trend positive">Unique visitors</span>
          </div>
        </div>
      </div>

      {/* ── Apex: Revenue (full width) ───────────────────── */}
      <div className="section-title section-title--compact">Revenue trend</div>
      <div className="chart-card chart-card--featured">
        <div className="chart-header">
          <div className="chart-title-wrap">
            <span className="chart-label">Last 7 days</span>
            <span className="chart-main-val">
              ${revenueTrend.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="chart-sub">Served orders total · ApexCharts area</span>
          </div>
          <div className="chart-header-spark">
            <Chart
              options={sparklineOpts('#2d5cfe')}
              series={[{ name: 'r', data: revenueTrend.length ? revenueTrend : [0, 0, 0] }]}
              type="area"
              height={48}
              width={120}
            />
          </div>
        </div>
        <div className="chart-body chart-body--tall">
          <Chart
            options={areaChartOptions}
            series={[{ name: 'Revenue', data: revenueTrend.length ? revenueTrend : [0, 0, 0, 0, 0, 0, 0] }]}
            type="area"
            height={300}
          />
        </div>
      </div>

      {/* ── Operations ─────────────────────────────────────── */}
      <div className="section-title">Operations Overview</div>
      <div className="dash-main-grid three-col">
        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round blue">
              <Package size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Inventory Stocks</span>
              <span className="card-subtitle">{stockStats.total} Items tracked</span>
            </div>
            <div className="card-main-num blue" style={{ marginLeft: 'auto' }}>
              {String(stockStats.low).padStart(2, '0')}
            </div>
          </div>
          <div className="card-subgrid">
            <div className="subgrid-item">
              <div className="subgrid-label">Low Stock</div>
              <div className="subgrid-value" style={{ color: 'var(--accent-red)' }}>
                {stockStats.low}
              </div>
            </div>
            <div className="subgrid-item">
              <div className="subgrid-label">In Stock</div>
              <div className="subgrid-value">{Math.max(0, stockStats.total - stockStats.low)}</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round green">
              <Utensils size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Kitchen Status</span>
              <span className="card-subtitle">Active Preparations</span>
            </div>
            <div className="card-main-num green" style={{ marginLeft: 'auto' }}>
              {String(orderStats.preparing).padStart(2, '0')}
            </div>
          </div>
          <div className="card-subgrid">
            <div className="subgrid-item">
              <div className="subgrid-label">Preparing</div>
              <div className="subgrid-value">{orderStats.preparing}</div>
            </div>
            <div className="subgrid-item">
              <div className="subgrid-label">Ready</div>
              <div className="subgrid-value">{orderStats.ready}</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round orange">
              <Grid size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Dining Areas</span>
              <span className="card-subtitle">{tableStats.total} Tables total</span>
            </div>
            <div className="card-main-num orange" style={{ marginLeft: 'auto' }}>
              {String(tableStats.occupied).padStart(2, '0')}
            </div>
          </div>
          <div className="card-subgrid">
            <div className="subgrid-item">
              <div className="subgrid-label">Occupied</div>
              <div className="subgrid-value">{tableStats.occupied}</div>
            </div>
            <div className="subgrid-item">
              <div className="subgrid-label">Available</div>
              <div className="subgrid-value">{tableStats.available}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Business insights (extra content) ──────────────── */}
      <div className="section-title">Business snapshot</div>
      <div className="dash-main-grid four-col dash-insights">
        <div className="insight-tile">
          <ChefHat size={22} className="insight-tile__icon" />
          <div className="insight-tile__meta">
            <span className="insight-tile__label">Menu items</span>
            <span className="insight-tile__val">{data.menu.length}</span>
            <span className="insight-tile__hint">Dishes &amp; drinks listed</span>
          </div>
        </div>
        <div className="insight-tile">
          <Store size={22} className="insight-tile__icon" />
          <div className="insight-tile__meta">
            <span className="insight-tile__label">Branches</span>
            <span className="insight-tile__val">{data.branches.length}</span>
            <span className="insight-tile__hint">Locations on file</span>
          </div>
        </div>
        <div className="insight-tile">
          <Tags size={22} className="insight-tile__icon" />
          <div className="insight-tile__meta">
            <span className="insight-tile__label">Categories</span>
            <span className="insight-tile__val">{data.categories.length}</span>
            <span className="insight-tile__hint">Menu organization</span>
          </div>
        </div>
        <div className="insight-tile">
          <ShoppingBag size={22} className="insight-tile__icon" />
          <div className="insight-tile__meta">
            <span className="insight-tile__label">Lifetime orders</span>
            <span className="insight-tile__val">{data.orders.length}</span>
            <span className="insight-tile__hint">All time in system</span>
          </div>
        </div>
      </div>

      {/* ── Apex: Orders volume + Distribution ───────────── */}
      <div className="section-title">Analytics &amp; distribution</div>
      <div className="analytics-grid analytics-grid--triple">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <span className="chart-label">Order volume</span>
              <span className="chart-main-val">
                {ordersPerDay.reduce((a, b) => a + b, 0)}
              </span>
              <span className="chart-sub">Orders per day · last 7 days · ApexCharts column</span>
            </div>
          </div>
          <div className="chart-body">
            <Chart
              options={barChartOptions}
              series={[{ name: 'Orders', data: ordersPerDay.length ? ordersPerDay : [0, 0, 0, 0, 0, 0, 0] }]}
              type="bar"
              height={300}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <span className="chart-label">Order status mix</span>
              <span className="chart-main-val">{data.orders.length}</span>
              <span className="chart-sub">All orders · ApexCharts donut</span>
            </div>
          </div>
          <div className="chart-body chart-body--donut">
            {hasOrderStatusData ? (
              <Chart
                options={donutChartOptions}
                series={statusDistribution.series}
                type="donut"
                height={300}
              />
            ) : (
              <div className="chart-empty">No order status data yet — place or update orders to see the mix.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent orders table ───────────────────────────── */}
      <div className="section-title">Recent orders</div>
      <div className="recent-orders-card">
        <table className="recent-orders-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Order</th>
              <th>Status</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="recent-orders-empty">
                  No orders yet — new orders will appear here.
                </td>
              </tr>
            ) : (
              recentOrders.map((o) => (
                <tr key={o.id ?? `${o.timestamp ?? o.created_at}-${o.customerName}`}>
                  <td className="recent-orders-muted">
                    {new Date(o.timestamp ?? o.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className="recent-orders-id">#{o.id ?? '—'}</span>
                    <span className="recent-orders-phone">
                      {o.customerName || o.customer_name || o.customer_phone || 'Walk-in'}
                    </span>
                  </td>
                  <td>
                    <span className={`order-pill order-pill--${(o.status || 'pending').toLowerCase()}`}>
                      {o.status || '—'}
                    </span>
                  </td>
                  <td className="text-end recent-orders-total">
                    ${parseFloat(String(o.total ?? o.total_amount ?? 0)).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button type="button" className="recent-orders-footer" onClick={() => navigate('/admin/orders')}>
          View all orders <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
