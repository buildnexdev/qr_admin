import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import type { RootState } from '../../store';
import { setOrders } from '../../store/orderSlice';
import type { Order } from '../../store/orderSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { API_BASE_URL } from '../../routes/const';
import {
  clearDispatchMeta,
  getDeliveryStage,
  getDispatchMeta,
  isDeliveryOrder,
  orderTs,
  setDispatchMeta,
  statusKey,
  type DeliveryStage,
  type DispatchMeta,
} from './deliveryUtils';
import './delivery.scss';

const ORDERS_URL = `${API_BASE_URL}api/orders`;
const REFRESH_MS = 12000;

type OrderRow = Order & {
  created_at?: string;
  customer_name?: string;
  customerName?: string;
  table_id?: string | number;
  tableId?: string | number;
  total_amount?: number;
  order_type?: string;
  orderType?: string;
  customer_phone?: string;
  customerPhone?: string;
  delivery_address?: string;
  deliveryAddress?: string;
};

function customerName(o: OrderRow): string {
  return String(o.customerName ?? o.customer_name ?? '').trim() || 'Guest';
}

function customerPhone(o: OrderRow): string {
  return String(o.customerPhone ?? o.customer_phone ?? '').trim();
}

function deliveryAddress(o: OrderRow): string {
  return String(o.deliveryAddress ?? o.delivery_address ?? '').trim();
}

function orderTotal(o: OrderRow): number {
  const n = Number(o.total ?? o.total_amount ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatInr(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(ts: string | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function itemsPreview(o: OrderRow): string[] {
  const items = o.items;
  if (!Array.isArray(items)) return [];
  return items.slice(0, 4).map((it: Record<string, unknown>) => {
    const q = Number(it.quantity ?? 1);
    const name = String(it.name ?? it.item_name ?? 'Item');
    return `${q}× ${name}`;
  });
}

const COLS: { stage: DeliveryStage; label: string; className: string }[] = [
  { stage: 'new', label: 'New', className: 'delivery-col--new' },
  { stage: 'kitchen', label: 'Kitchen', className: 'delivery-col--kitchen' },
  { stage: 'ready', label: 'Ready', className: 'delivery-col--ready' },
  { stage: 'out', label: 'Out for delivery', className: 'delivery-col--out' },
  { stage: 'done', label: 'Delivered', className: 'delivery-col--done' },
];

const Delivery: React.FC = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.orders);
  const [dispatchModalId, setDispatchModalId] = useState<number | null>(null);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [etaMins, setEtaMins] = useState('35');
  const [tick, setTick] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(ORDERS_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      dispatch(setOrders(data.reverse()));
    } catch (e) {
      console.error('Delivery: fetch orders failed', e);
      triggerToast('Could not load orders', 'error');
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchOrders();
    const id = setInterval(fetchOrders, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchOrders]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (dispatchModalId == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDispatchModalId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatchModalId]);

  const deliveryRows = useMemo(
    () => (orders as OrderRow[]).filter((o) => isDeliveryOrder(o)),
    [orders]
  );

  const activePipeline = useMemo(() => {
    void tick;
    return deliveryRows.filter((o) => {
      const s = getDeliveryStage(o);
      return s !== 'done' && s !== 'cancelled';
    });
  }, [deliveryRows, tick]);

  const stats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();

    let revenueToday = 0;
    let deliveredToday = 0;
    for (const o of deliveryRows) {
      const st = statusKey(o);
      if (st !== 'served' && st !== 'completed') continue;
      const ts = orderTs(o);
      const t = ts ? new Date(ts).getTime() : 0;
      if (t >= startMs) {
        revenueToday += orderTotal(o);
        deliveredToday += 1;
      }
    }

    return {
      active: activePipeline.length,
      deliveredToday,
      revenueToday,
    };
  }, [deliveryRows, activePipeline]);

  const byStage = useMemo(() => {
    void tick;
    const map: Record<DeliveryStage, OrderRow[]> = {
      new: [],
      kitchen: [],
      ready: [],
      out: [],
      done: [],
      cancelled: [],
    };
    for (const o of deliveryRows) {
      const stage = getDeliveryStage(o);
      if (stage === 'cancelled') continue;
      map[stage].push(o);
    }
    for (const k of Object.keys(map) as DeliveryStage[]) {
      map[k].sort((a, b) => {
        const ta = new Date(orderTs(a) || 0).getTime();
        const tb = new Date(orderTs(b) || 0).getTime();
        return tb - ta;
      });
    }
    return map;
  }, [deliveryRows, tick]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await axios.post(`${API_BASE_URL}api/orders/update-status`, { orderId, status });
      await fetchOrders();
      triggerToast(`Order #${orderId} → ${status}`, 'success');
    } catch {
      triggerToast('Failed to update order', 'error');
    }
  };

  const openDispatchModal = (id: number) => {
    setDispatchModalId(id);
    setRiderName('');
    setRiderPhone('');
    setEtaMins('35');
  };

  const confirmDispatch = () => {
    if (dispatchModalId == null) return;
    const name = riderName.trim();
    if (!name) {
      triggerToast('Enter rider name', 'error');
      return;
    }
    const eta = Math.max(5, Math.min(180, parseInt(etaMins, 10) || 35));
    const meta: DispatchMeta = {
      riderName: name,
      riderPhone: riderPhone.trim() || undefined,
      etaMins: eta,
      dispatchedAt: new Date().toISOString(),
    };
    setDispatchMeta(dispatchModalId, meta);
    setDispatchModalId(null);
    triggerToast(`Rider ${name} assigned · ETA ~${eta} min`, 'success');
    setTick((t) => t + 1);
  };

  const markDelivered = async (o: OrderRow) => {
    await updateStatus(o.id, 'Served');
    clearDispatchMeta(o.id);
    setTick((t) => t + 1);
  };

  const modalOrder = dispatchModalId != null ? deliveryRows.find((r) => r.id === dispatchModalId) : undefined;

  return (
    <div className="delivery-page">
      <header className="delivery-page__head">
        <div className="delivery-page__titles">
          <h1>Delivery</h1>
          <p>
            Delivery-only pipeline: new orders, kitchen, ready for pickup, rider out with local ETA (saved in this
            browser until dispatch APIs exist), then delivered.
          </p>
        </div>
        <div className="delivery-page__actions">
          <button type="button" className="delivery-page__btn" onClick={() => void fetchOrders()}>
            <RefreshCw size={16} aria-hidden />
            Refresh
          </button>
          <Link to="/admin/workspace" className="delivery-page__btn">
            <LayoutGrid size={16} aria-hidden />
            All modules
          </Link>
          <Link to="/admin" className="delivery-page__btn delivery-page__btn--primary">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="delivery-page__stats" aria-label="Delivery summary">
        <div className="delivery-stat">
          <div className="delivery-stat__label">Active pipeline</div>
          <div className="delivery-stat__val">{stats.active}</div>
        </div>
        <div className="delivery-stat">
          <div className="delivery-stat__label">Delivered today</div>
          <div className="delivery-stat__val">{stats.deliveredToday}</div>
        </div>
        <div className="delivery-stat">
          <div className="delivery-stat__label">Revenue today</div>
          <div className="delivery-stat__val">{formatInr(stats.revenueToday)}</div>
        </div>
      </section>

      <div className="delivery-board">
        {COLS.map(({ stage, label, className }) => (
          <section key={stage} className={`delivery-col ${className}`} aria-label={label}>
            <div className="delivery-col__head">
              <h2 className="delivery-col__title">{label}</h2>
              <span className="delivery-col__count">{byStage[stage].length}</span>
            </div>
            <div className="delivery-col__body">
              {byStage[stage].length === 0 ? (
                <div className="delivery-empty">No orders</div>
              ) : (
                byStage[stage].map((o) => {
                  const phone = customerPhone(o);
                  const addr = deliveryAddress(o);
                  const meta = getDispatchMeta(o.id);
                  const placed = formatTime(orderTs(o));
                  const previews = itemsPreview(o);

                  return (
                    <article key={o.id} className="delivery-card">
                      <div className="delivery-card__top">
                        <span className="delivery-card__id">#{o.id}</span>
                        <span className="delivery-card__amt">{formatInr(orderTotal(o))}</span>
                      </div>
                      <div className="delivery-card__guest">{customerName(o)}</div>
                      {phone ? (
                        <p className="delivery-card__phone">
                          <a href={`tel:${phone}`}>{phone}</a>
                        </p>
                      ) : null}
                      {addr ? <p className="delivery-card__addr">{addr}</p> : null}
                      <p className="delivery-card__phone">Placed {placed}</p>
                      {previews.length > 0 ? (
                        <ul className="delivery-card__items">
                          {previews.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}

                      {stage === 'out' && meta ? (
                        <div className="delivery-dispatch">
                          <strong>{meta.riderName}</strong>
                          {meta.riderPhone ? <span> · {meta.riderPhone}</span> : null}
                          <span>
                            {' '}
                            · ETA ~{meta.etaMins} min · {formatTime(meta.dispatchedAt)} dispatch
                          </span>
                        </div>
                      ) : null}

                      <div className="delivery-card__foot">
                        {stage === 'new' ? (
                          <button
                            type="button"
                            className="delivery-card__btn delivery-card__btn--go"
                            onClick={() => void updateStatus(o.id, 'Preparing')}
                          >
                            Start prep
                          </button>
                        ) : null}
                        {stage === 'kitchen' ? (
                          <button
                            type="button"
                            className="delivery-card__btn delivery-card__btn--go"
                            onClick={() => void updateStatus(o.id, 'Ready')}
                          >
                            Mark ready
                          </button>
                        ) : null}
                        {stage === 'ready' ? (
                          <>
                            <button
                              type="button"
                              className="delivery-card__btn delivery-card__btn--go"
                              onClick={() => openDispatchModal(o.id)}
                            >
                              Dispatch rider
                            </button>
                            <button
                              type="button"
                              className="delivery-card__btn delivery-card__btn--muted"
                              onClick={() => void markDelivered(o)}
                            >
                              Delivered
                            </button>
                          </>
                        ) : null}
                        {stage === 'out' ? (
                          <button
                            type="button"
                            className="delivery-card__btn delivery-card__btn--go"
                            onClick={() => void markDelivered(o)}
                          >
                            Delivered
                          </button>
                        ) : null}
                        {stage === 'done' ? (
                          <span className="delivery-card__phone" style={{ width: '100%', textAlign: 'center' }}>
                            Completed
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>

      {dispatchModalId != null ? (
        <div
          className="delivery-modal-overlay"
          role="presentation"
          onClick={() => setDispatchModalId(null)}
        >
          <div
            className="delivery-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-dispatch-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delivery-dispatch-title">Dispatch rider</h2>
            {modalOrder ? (
              <p className="delivery-card__phone" style={{ marginBottom: 12 }}>
                Order #{modalOrder.id} · {customerName(modalOrder)} · {formatInr(orderTotal(modalOrder))}
              </p>
            ) : null}
            <label htmlFor="dl-rider-name">Rider name</label>
            <input
              id="dl-rider-name"
              value={riderName}
              onChange={(e) => setRiderName(e.target.value)}
              placeholder="e.g. Ravi"
              autoComplete="name"
            />
            <label htmlFor="dl-rider-phone">Phone (optional)</label>
            <input
              id="dl-rider-phone"
              value={riderPhone}
              onChange={(e) => setRiderPhone(e.target.value)}
              placeholder="10-digit mobile"
              inputMode="tel"
            />
            <label htmlFor="dl-eta">ETA (minutes)</label>
            <input
              id="dl-eta"
              value={etaMins}
              onChange={(e) => setEtaMins(e.target.value)}
              inputMode="numeric"
            />
            <div className="delivery-modal__actions">
              <button type="button" className="delivery-page__btn" onClick={() => setDispatchModalId(null)}>
                Cancel
              </button>
              <button type="button" className="delivery-page__btn delivery-page__btn--primary" onClick={confirmDispatch}>
                Assign
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Delivery;
