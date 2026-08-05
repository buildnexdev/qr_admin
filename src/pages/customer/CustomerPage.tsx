import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Search, Loader2, Eye, X } from 'lucide-react';
import { fetchOrdersList, type OrderListRow } from '../../api/orderApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { triggerToast } from '../../components/common/CommonAlert';
import './CustomerPage.scss';

type CustomerRow = {
  key: string;
  displayName: string;
  orderCount: number;
  totalSpent: number;
  lastVisit: string | null;
  lastStatus: string;
  orders: OrderListRow[];
};

function orderCustomerName(o: OrderListRow): string {
  const n = (o.customer_name ?? o.customerName ?? '') as string;
  const t = String(n).trim();
  return t || 'Walk-in';
}

function orderTotal(o: OrderListRow): number {
  const v = o.total ?? o.total_amount;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function orderDate(o: OrderListRow): string | null {
  const raw = (o.created_at ?? o.timestamp) as string | undefined;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function aggregateCustomers(rows: OrderListRow[]): CustomerRow[] {
  const map = new Map<string, OrderListRow[]>();
  for (const o of rows) {
    const name = orderCustomerName(o);
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }

  const out: CustomerRow[] = [];
  for (const [key, list] of map) {
    const sorted = [...list].sort((a, b) => {
      const ta = orderDate(a) || '';
      const tb = orderDate(b) || '';
      return tb.localeCompare(ta);
    });
    const displayName = orderCustomerName(sorted[0]);
    const totalSpent = sorted.reduce((s, o) => s + orderTotal(o), 0);
    const last = sorted[0];
    const lastVisit = orderDate(last);
    const lastStatus = String(last.status ?? '—');
    out.push({
      key,
      displayName,
      orderCount: sorted.length,
      totalSpent,
      lastVisit,
      lastStatus,
      orders: sorted,
    });
  }
  out.sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''));
  return out;
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function formatWhen(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

function statusTone(status: string): 'ok' | 'warn' | 'bad' | 'neutral' {
  const s = status.toLowerCase();
  if (s.includes('served') || s.includes('paid') || s.includes('complete')) return 'ok';
  if (s.includes('cancel')) return 'bad';
  if (s.includes('pending') || s.includes('prep')) return 'warn';
  return 'neutral';
}

const CustomerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderListRow[]>([]);
  const [search, setSearch] = useState('');
  const [drawerCustomer, setDrawerCustomer] = useState<CustomerRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrdersList();
      setOrders(data);
    } catch (e: unknown) {
      triggerToast('Customers', 'error', getApiErrorMessage(e, 'Could not load orders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const customers = useMemo(() => aggregateCustomers(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.displayName.toLowerCase().includes(q));
  }, [customers, search]);

  return (
    <div className="customer-page customer-page--shell">
      <header className="customer-hero">
        <div className="customer-hero__text">
          <h1 className="customer-hero__title">Customers</h1>
          <div className="customer-hero__chips" aria-live="polite">
            <span className="customer-chip">{customers.length} unique guests</span>
            <span className="customer-chip">{orders.length} orders loaded</span>
          </div>
        </div>
        <label className="customer-hero__search">
          <Search size={18} strokeWidth={2} aria-hidden />
          <input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </label>
      </header>

      <div className="customer-table-wrap">
        {loading ? (
          <div className="customer-loading">
            <Loader2 className="customer-spin" size={32} aria-hidden />
            <p>Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="customer-empty">
            <Users size={40} strokeWidth={1.25} opacity={0.35} />
            <p>{orders.length === 0 ? 'No orders yet — customers will appear after orders are placed.' : 'No names match your search.'}</p>
          </div>
        ) : (
          <table className="customer-table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Orders</th>
                <th scope="col">Total spent</th>
                <th scope="col">Last visit</th>
                <th scope="col">Last status</th>
                <th scope="col" className="customer-table__th-actions">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.key}>
                  <td>
                    <span className="customer-name">{c.displayName}</span>
                  </td>
                  <td>
                    <span className="customer-metric">{c.orderCount}</span>
                  </td>
                  <td>
                    <span className="customer-metric customer-metric--money">{formatMoney(c.totalSpent)}</span>
                  </td>
                  <td>
                    <span className="customer-metric customer-metric--muted">{formatWhen(c.lastVisit)}</span>
                  </td>
                  <td>
                    <span className={`customer-status customer-status--${statusTone(c.lastStatus)}`}>{c.lastStatus}</span>
                  </td>
                  <td>
                    <div className="customer-actions">
                      <button type="button" className="customer-icon-btn" title="View history" onClick={() => setDrawerCustomer(c)}>
                        <Eye size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className={`customer-drawer-backdrop ${drawerCustomer ? 'is-open' : ''}`}
        aria-hidden={!drawerCustomer}
        onClick={() => setDrawerCustomer(null)}
      />
      <aside className={`customer-drawer ${drawerCustomer ? 'is-open' : ''}`} aria-hidden={!drawerCustomer}>
        {drawerCustomer ? (
          <>
            <div className="customer-drawer__head">
              <h2 className="customer-drawer__title">{drawerCustomer.displayName}</h2>
              <button type="button" className="customer-drawer__close" onClick={() => setDrawerCustomer(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="customer-drawer__body">
              <div className="customer-stat-grid">
                <div className="customer-stat">
                  <span className="v">{drawerCustomer.orderCount}</span>
                  <span className="l">Orders</span>
                </div>
                <div className="customer-stat">
                  <span className="v">{formatMoney(drawerCustomer.totalSpent)}</span>
                  <span className="l">All-time total</span>
                </div>
              </div>
              <h3 className="customer-drawer__section-title">Recent orders</h3>
              {drawerCustomer.orders.slice(0, 12).map((o, idx) => (
                <div key={`${drawerCustomer.key}-${String(o.id ?? idx)}`} className="customer-order-row">
                  <div>
                    <span className="customer-order-row__id">#{o.id ?? '—'}</span>
                    <div className="customer-order-row__meta">{formatWhen(orderDate(o))}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatMoney(orderTotal(o))}</strong>
                    <div className="customer-order-row__meta">{String(o.status ?? '')}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
};

export default CustomerPage;
