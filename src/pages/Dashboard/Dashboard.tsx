import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Grid, Utensils, ClipboardList, TrendingUp, Plus,
  ArrowRight, Clock, Users, DollarSign, Info,
  AlertCircle, CheckCircle2, ChevronRight, Package,
  ShoppingBag, Calendar
} from 'lucide-react';
import Chart from 'react-apexcharts';
import './Dashboard.scss';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    orders: [] as any[],
    tables: [] as any[],
    staff: [] as any[],
    menu: [] as any[],
    stocks: [] as any[],
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tablesRes, menuRes, ordersRes, staffRes, stocksRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/tables`),
          axios.get(`${API_BASE_URL}/menu`),
          axios.get(`${API_BASE_URL}/orders`),
          axios.get(`${API_BASE_URL}/staff`),
          axios.get(`${API_BASE_URL}/stocks`),
        ]);

        setData({
          tables: tablesRes.status === 'fulfilled' ? tablesRes.value.data : [],
          menu: menuRes.status === 'fulfilled' ? menuRes.value.data : [],
          orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data : [],
          staff: staffRes.status === 'fulfilled' ? staffRes.value.data : [],
          stocks: stocksRes.status === 'fulfilled' ? stocksRes.value.data : [],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived Metrics ───────────────────────────────────────
  const today = new Date(selectedDate).toDateString();
  const todayOrders = data.orders.filter(o => new Date(o.timestamp || o.created_at).toDateString() === today);

  const orderStats = {
    total: todayOrders.length,
    pending: todayOrders.filter(o => o.status === 'Pending').length,
    preparing: todayOrders.filter(o => o.status === 'Preparing').length,
    ready: todayOrders.filter(o => o.status === 'Ready').length, // Assuming 'Ready' exists
    served: todayOrders.filter(o => o.status === 'Served').length,
    cancelled: todayOrders.filter(o => o.status === 'Cancelled').length,
  };

  const revenue = todayOrders
    .filter(o => o.status === 'Served')
    .reduce((sum, o) => sum + parseFloat(o.total || o.total_amount || 0), 0);

  const tableStats = {
    total: data.tables.length,
    occupied: data.tables.filter(t => t.status === 'Occupied' || t.is_occupied).length,
    available: data.tables.filter(t => t.status === 'Available' || !t.is_occupied).length,
  };

  const staffStats = {
    total: data.staff.length,
    online: data.staff.filter(s => s.status).length,
    busy: Math.floor(data.staff.filter(s => s.status).length * 0.7), // Dummy busy logic
    onBreak: 0,
  };

  const customerCount = new Set(todayOrders.map(o => o.customer_phone || o.customer_name)).size;

  const stockStats = {
    total: data.stocks.length,
    low: data.stocks.filter(s => s.quantity <= s.minThreshold).length,
  };

  // ── Chart Data Processing ────────────────────────────────
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const revenueTrend = last7Days.map(dateStr => {
    return data.orders
      .filter(o => new Date(o.timestamp || o.created_at).toDateString() === dateStr && o.status === 'Served')
      .reduce((sum, o) => sum + parseFloat(o.total || o.total_amount || 0), 0);
  });

  const statusDistribution = {
    labels: ['Served', 'Preparing', 'Pending', 'Cancelled'],
    series: [
      data.orders.filter(o => o.status === 'Served').length,
      data.orders.filter(o => o.status === 'Preparing').length,
      data.orders.filter(o => o.status === 'Pending').length,
      data.orders.filter(o => o.status === 'Cancelled').length,
    ]
  };

  const areaChartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } },
    xaxis: { categories: last7Days.map(d => d.split(' ')[1] + ' ' + d.split(' ')[2]), axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { show: true } },
    grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 5 },
    colors: ['#4318ff'],
    tooltip: { x: { format: 'dd MMM' } },
  };

  const donutChartOptions: any = {
    labels: statusDistribution.labels,
    colors: ['#05cd99', '#ffb547', '#4318ff', '#ee5d50'],
    chart: { type: 'donut' },
    plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 600 } } } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '12px', fontWeight: 500, markers: { radius: 12 } },
    stroke: { show: false },
  };

  return (
    <div>
      {/* ── Row 1: Today's Summary ────────────────────────── */}
      <div className="section-title">
        {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Summary" : "Daily Summary"}
        <div className="date-picker-container">
          <label htmlFor="dash-date-picker" className="date-display-wrap">
            <Calendar size={16} className="date-icon" />
            <span className="section-date">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </label>
          <input
            id="dash-date-picker"
            type="date"
            className="hidden-date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      <div className="dash-main-grid four-col">

        {/* Today Orders */}
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

        {/* Today Earnings */}
        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today Earnings</span>
            <div className="stat-value">${revenue.toLocaleString()}</div>
            <span className="stat-trend positive">Average bill: ${(revenue / (orderStats.total || 1)).toFixed(1)}</span>
          </div>
        </div>

        {/* Working Staff */}
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

        {/* Today Customers */}
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

      {/* ── Row 2: Operations ──────────────────────────────── */}
      <div className="section-title">Operations Overview</div>
      <div className="dash-main-grid three-col">

        {/* Stocks Card */}
        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round orange">
              <Package size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Inventory Stocks</span>
              <span className="card-subtitle">{stockStats.total} Items tracked</span>
            </div>
            <div className="card-main-num" style={{ marginLeft: 'auto' }}>
              {String(stockStats.low).padStart(2, '0')}
            </div>
          </div>
          <div className="card-subgrid">
            <div className="subgrid-item">
              <div className="subgrid-label">Low Stock</div>
              <div className="subgrid-value" style={{ color: 'var(--accent-red)' }}>{stockStats.low}</div>
            </div>
            <div className="subgrid-item">
              <div className="subgrid-label">In Stock</div>
              <div className="subgrid-value">{stockStats.total - stockStats.low}</div>
            </div>
          </div>

        </div>

        {/* Kitchen Card */}
        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round red">
              <Utensils size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Kitchen Status</span>
              <span className="card-subtitle">Active Preparations</span>
            </div>
            <div className="card-main-num" style={{ marginLeft: 'auto' }}>
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

        {/* Tables Card */}
        <div className="metric-card">
          <div className="card-header">
            <div className="card-icon-round blue">
              <Grid size={20} />
            </div>
            <div className="card-title-area">
              <span className="card-title">Dining Areas</span>
              <span className="card-subtitle">{tableStats.total} Tables total</span>
            </div>
            <div className="card-main-num blue" style={{ marginLeft: 'auto' }}>
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

      {/* ── Row 3: Analytics ──────────────────────────────── */}
      <div className="section-title">Analytics Overview</div>
      <div className="analytics-grid">
        
        {/* Revenue Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <span className="chart-label">Revenue Trend</span>
              <span className="chart-main-val">${revenueTrend.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              <span className="chart-sub">Total revenue (Last 7 days)</span>
            </div>
          </div>
          <div className="chart-body">
            <Chart options={areaChartOptions} series={[{ name: 'Revenue', data: revenueTrend }]} type="area" height={280} />
          </div>
        </div>

        {/* Order Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <span className="chart-label">Order Distribution</span>
              <span className="chart-main-val">{data.orders.length}</span>
              <span className="chart-sub">Lifetime Orders</span>
            </div>
          </div>
          <div className="chart-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Chart options={donutChartOptions} series={statusDistribution.series} type="donut" height={320} width="100%" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
