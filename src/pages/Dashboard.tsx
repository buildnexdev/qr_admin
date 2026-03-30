import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Utensils, ClipboardList, TrendingUp, Plus, ArrowRight, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  suffix?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ tables: 0, menuItems: 0, activeOrders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tablesRes, menuRes, ordersRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/tables`),
          axios.get(`${API_BASE_URL}/menu`),
          axios.get(`${API_BASE_URL}/orders`),
        ]);

        const tables = tablesRes.status === 'fulfilled' ? tablesRes.value.data : [];
        const menu   = menuRes.status   === 'fulfilled' ? menuRes.value.data   : [];
        const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

        const active  = orders.filter((o: any) => o.status !== 'Served' && o.status !== 'Cancelled');
        const revenue = orders
          .filter((o: any) => o.status === 'Served')
          .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || o.total || 0), 0);

        setStats({
          tables: tables.length,
          menuItems: menu.length,
          activeOrders: active.length,
          revenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards: StatCard[] = [
    {
      label: 'Total Tables',
      value: stats.tables,
      icon: <Grid size={24} />,
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Menu Items',
      value: stats.menuItems,
      icon: <Utensils size={24} />,
      color: '#ea580c',
      glow: 'rgba(234,88,12,0.15)',
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: <ClipboardList size={24} />,
      color: '#10b981',
      glow: 'rgba(16,185,129,0.15)',
    },
    {
      label: "Today's Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: <TrendingUp size={24} />,
      color: '#8b5cf6',
      glow: 'rgba(139,92,246,0.15)',
    },
  ];

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':   return { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b' };
      case 'preparing': return { bg: 'rgba(234,88,12,0.1)',   text: '#ea580c' };
      case 'served':    return { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' };
      default:          return { bg: 'rgba(255,255,255,0.06)', text: '#a8956e' };
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .dash-page {
          min-height: 100vh;
          background: #0e0b08;
          font-family: 'DM Sans', sans-serif;
          padding: 36px 40px 60px;
          position: relative;
          overflow-x: hidden;
        }
        .dash-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 10% 10%, rgba(234,88,12,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 90% 85%, rgba(245,158,11,0.06) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .dash-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* ── Hero heading ───────────────────────────────────────── */
        .dash-hero {
          margin-bottom: 40px;
          animation: dashFadeUp 0.6s ease both;
        }
        .dash-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .dash-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #fef3c7;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .dash-title em { font-style: italic; color: #fbbf24; }
        .dash-subtitle { font-size: 15px; color: #a8956e; }

        /* ── Stat cards ─────────────────────────────────────────── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: #1f1810;
          border: 1px solid rgba(245,158,11,0.12);
          border-radius: 20px;
          padding: 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          animation: dashFadeUp 0.6s ease both;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.35);
          border-color: rgba(245,158,11,0.25);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.6;
        }
        .stat-icon {
          width: 46px; height: 46px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #fef3c7;
          line-height: 1;
        }
        .stat-label {
          font-size: 13px;
          color: #a8956e;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        /* ── Section layout ─────────────────────────────────────── */
        .dash-row {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          animation: dashFadeUp 0.7s ease both 0.1s;
        }
        @media (max-width: 900px) {
          .dash-row { grid-template-columns: 1fr; }
        }

        /* ── Card shared ────────────────────────────────────────── */
        .dash-card {
          background: #1f1810;
          border: 1px solid rgba(245,158,11,0.12);
          border-radius: 20px;
          overflow: hidden;
        }
        .dash-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(245,158,11,0.08);
        }
        .dash-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #fef3c7;
        }
        .dash-card-link {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #f59e0b;
          cursor: pointer;
          font-weight: 500;
          transition: gap 0.15s;
          background: none;
          border: none;
          padding: 0;
        }
        .dash-card-link:hover { gap: 8px; }

        /* ── Recent orders ──────────────────────────────────────── */
        .order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .order-row:last-child { border-bottom: none; }
        .order-row:hover { background: rgba(245,158,11,0.04); }
        .order-row-left { display: flex; align-items: center; gap: 12px; }
        .order-num {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.14);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #f59e0b;
          flex-shrink: 0;
        }
        .order-meta { display: flex; flex-direction: column; gap: 2px; }
        .order-customer { font-size: 14px; font-weight: 600; color: #fef3c7; }
        .order-time { font-size: 12px; color: #a8956e; display: flex; align-items: center; gap: 4px; }
        .order-right { display: flex; align-items: center; gap: 14px; }
        .order-amount { font-size: 15px; font-weight: 700; color: #fef3c7; }
        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: capitalize;
        }
        .empty-orders {
          padding: 40px 24px;
          text-align: center;
          color: #a8956e;
          font-size: 14px;
        }
        .empty-orders .ein { font-size: 36px; margin-bottom: 10px; }

        /* ── Quick actions ──────────────────────────────────────── */
        .quick-actions { display: flex; flex-direction: column; gap: 0; }
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          width: 100%;
          text-align: left;
        }
        .quick-action-btn:last-child { border-bottom: none; }
        .quick-action-btn:hover { background: rgba(245,158,11,0.05); }
        .qa-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .qa-text { flex: 1; }
        .qa-label { font-size: 14px; font-weight: 600; color: #fef3c7; }
        .qa-sub { font-size: 12px; color: #a8956e; margin-top: 2px; }
        .qa-arrow { color: #a8956e; transition: color 0.15s, transform 0.15s; }
        .quick-action-btn:hover .qa-arrow { color: #f59e0b; transform: translateX(3px); }

        /* ── Skeleton loader ────────────────────────────────────── */
        .skel {
          background: linear-gradient(90deg, #1f1810 25%, #251c12 50%, #1f1810 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes dashFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dash-page">
        <div className="dash-inner">

          {/* ── Hero ────────────────────────────────────────────── */}
          <div className="dash-hero">
            <p className="dash-eyebrow">Craving Admin</p>
            <h1 className="dash-title"><em>Restaurant</em> Dashboard</h1>
            <p className="dash-subtitle">Real-time overview of your dining floor and kitchen.</p>
          </div>

          {/* ── Stat cards ──────────────────────────────────────── */}
          <div className="stat-grid">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className="stat-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="stat-icon"
                  style={{ background: card.glow, color: card.color }}
                >
                  {card.icon}
                </div>
                {loading
                  ? <div className="skel" style={{ height: 34, width: '60%' }} />
                  : <div className="stat-value">{card.value}</div>
                }
                <div className="stat-label">{card.label}</div>
              </div>
            ))}
          </div>

          {/* ── Main row ────────────────────────────────────────── */}
          <div className="dash-row">

            {/* Recent Orders */}
            <div className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Recent Orders</span>
                <button className="dash-card-link" onClick={() => navigate('/orders')}>
                  View all <ArrowRight size={14} />
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skel" style={{ height: 44 }} />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="empty-orders">
                  <div className="ein">🍽️</div>
                  No orders yet today
                </div>
              ) : (
                recentOrders.map((order) => {
                  const sc = statusColor(order.status);
                  return (
                    <div key={order.id} className="order-row">
                      <div className="order-row-left">
                        <div className="order-num">#{String(order.id).slice(-3)}</div>
                        <div className="order-meta">
                          <span className="order-customer">{order.customer_name || order.customerName || 'Guest'}</span>
                          <span className="order-time">
                            <Clock size={11} />
                            {new Date(order.created_at || order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="order-right">
                        <span className="order-amount">${parseFloat(order.total_amount || order.total || 0).toFixed(2)}</span>
                        <span
                          className="status-badge"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions */}
            <div className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Quick Actions</span>
              </div>
              <div className="quick-actions">
                {[
                  {
                    icon: <Plus size={18} />,
                    iconBg: 'rgba(245,158,11,0.12)',
                    iconColor: '#f59e0b',
                    label: 'Add New Table',
                    sub: 'Create a QR-linked table',
                    to: '/tables',
                  },
                  {
                    icon: <Utensils size={18} />,
                    iconBg: 'rgba(234,88,12,0.12)',
                    iconColor: '#ea580c',
                    label: 'Manage Menu',
                    sub: 'Update dishes & prices',
                    to: '/menu',
                  },
                  {
                    icon: <ClipboardList size={18} />,
                    iconBg: 'rgba(16,185,129,0.12)',
                    iconColor: '#10b981',
                    label: 'View Orders',
                    sub: 'Monitor live orders',
                    to: '/orders',
                  },
                  {
                    icon: <Grid size={18} />,
                    iconBg: 'rgba(139,92,246,0.12)',
                    iconColor: '#8b5cf6',
                    label: 'Tables Overview',
                    sub: 'Manage seating layout',
                    to: '/tables',
                  },
                ].map((qa) => (
                  <button
                    key={qa.label}
                    className="quick-action-btn"
                    onClick={() => navigate(qa.to)}
                  >
                    <div className="qa-icon" style={{ background: qa.iconBg, color: qa.iconColor }}>
                      {qa.icon}
                    </div>
                    <div className="qa-text">
                      <div className="qa-label">{qa.label}</div>
                      <div className="qa-sub">{qa.sub}</div>
                    </div>
                    <ArrowRight size={16} className="qa-arrow" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
