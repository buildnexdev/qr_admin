import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  ChefHat,
  Menu,
  LayoutGrid,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Zap,
  Printer,
} from 'lucide-react';
import type { RootState } from '../../store';
import { setOrders } from '../../store/orderSlice';
import type { Order } from '../../store/orderSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { API_BASE_URL } from '../../routes/const';
import './kitchenStyle.scss';

const ORDERS_URL = `${API_BASE_URL}api/orders`;
const REFRESH_MS = 8000;
const CLOCK_TICK_MS = 10000;

type OrderRow = Order & {
  created_at?: string;
  customer_name?: string;
  customerName?: string;
  table_id?: string | number;
  order_type?: string;
  orderType?: string;
};

type BoardFilter = 'new' | 'process' | 'ready' | 'served';

function orderTimestamp(o: OrderRow): string | undefined {
  return (o.timestamp ?? o.created_at) as string | undefined;
}

function orderTableLabel(o: OrderRow): string {
  const t = o.tableId ?? o.table_id;
  if (t == null || t === '' || String(t).toLowerCase() === 'general') return '';
  return String(t);
}

function orderCustomer(o: OrderRow): string {
  return String(o.customerName ?? o.customer_name ?? '').trim();
}

function orderTypeLabel(o: OrderRow): 'Dine In' | 'Takeaway' | 'Delivery' {
  const raw = String(o.orderType ?? o.order_type ?? '').toLowerCase();
  if (raw.includes('take')) return 'Takeaway';
  if (raw.includes('deliver')) return 'Delivery';
  if (raw.includes('dine')) return 'Dine In';
  const table = orderTableLabel(o);
  if (!table) return 'Delivery';
  return 'Dine In';
}

function orderItemsList(o: OrderRow): { quantity: number; name: string; modifier?: string }[] {
  const items = o.items;
  if (!Array.isArray(items)) return [];
  return items.map((it: Record<string, unknown>) => {
    const notes = [it.notes, it.special, it.instructions, it.note, it.special_instructions]
      .map((x) => (x != null && String(x).trim() ? String(x).trim() : ''))
      .find(Boolean);
    const variant = it.variant != null ? String(it.variant).trim() : '';
    const modifier = [variant, notes].filter(Boolean).join(' · ') || undefined;
    return {
      quantity: Number(it.quantity ?? 1),
      name: String(it.name ?? it.item_name ?? 'Item'),
      modifier,
    };
  });
}

function formatPlacedTime(ts: string | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function statusKey(o: OrderRow): string {
  return String(o.status || '').trim().toLowerCase();
}

function isCancelled(o: OrderRow): boolean {
  return statusKey(o) === 'cancelled';
}

function isNewStatus(o: OrderRow): boolean {
  const s = statusKey(o);
  return s === 'pending' || s === 'received';
}

function isProcessStatus(o: OrderRow): boolean {
  return statusKey(o) === 'preparing';
}

function isReadyStatus(o: OrderRow): boolean {
  return statusKey(o) === 'ready';
}

function isServedStatus(o: OrderRow): boolean {
  const s = statusKey(o);
  return s === 'served' || s === 'completed';
}

function ticketVisualVariant(o: OrderRow): 'new' | 'process' | 'ready' | 'served' {
  if (isNewStatus(o)) return 'new';
  if (isProcessStatus(o)) return 'process';
  if (isReadyStatus(o)) return 'ready';
  return 'served';
}

function matchesBoardFilter(o: OrderRow, f: BoardFilter): boolean {
  if (isCancelled(o)) return false;
  switch (f) {
    case 'new':
      return isNewStatus(o);
    case 'process':
      return isProcessStatus(o);
    case 'ready':
      return isReadyStatus(o);
    case 'served':
      return isServedStatus(o);
    default:
      return false;
  }
}

function playTone(freq: number, durationMs = 140, gain = 0.07) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      try {
        osc.stop();
        ctx.close();
      } catch {
        /* ignore */
      }
    }, durationMs);
  } catch {
    /* autoplay / API blocked */
  }
}

const Kitchen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tvMode, setTvMode] = useState(false);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('kds-sound') !== '0');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('process');

  const prevPendingIdsRef = useRef<Set<number>>(new Set());
  const lastUrgentRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(ORDERS_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      dispatch(setOrders(data.reverse()));
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchOrders();
    const orderInterval = setInterval(fetchOrders, REFRESH_MS);
    return () => clearInterval(orderInterval);
  }, [fetchOrders]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tvMode) {
      document.documentElement.classList.add('kds-tv-mode');
    } else {
      document.documentElement.classList.remove('kds-tv-mode');
    }
    return () => {
      document.documentElement.classList.remove('kds-tv-mode');
    };
  }, [tvMode]);

  useEffect(() => {
    localStorage.setItem('kds-sound', soundOn ? '1' : '0');
  }, [soundOn]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.post(`${API_BASE_URL}api/orders/update-status`, { orderId, status });
      await fetchOrders();
      triggerToast(`Order #${orderId} → ${status}`, 'success');
    } catch {
      triggerToast('Failed to update order status', 'error');
    }
  };

  const getElapsedMinutes = (timestamp: string | undefined) => {
    const validTime = timestamp || new Date().toISOString();
    const orderTime = new Date(validTime).getTime();
    const now = currentTime.getTime();
    if (Number.isNaN(orderTime)) return 0;
    return Math.floor((now - orderTime) / 60000);
  };

  const activeRows = useMemo(() => (orders as OrderRow[]).filter((o) => !isCancelled(o)), [orders]);

  const counts = useMemo(
    () => ({
      new: activeRows.filter(isNewStatus).length,
      process: activeRows.filter(isProcessStatus).length,
      ready: activeRows.filter(isReadyStatus).length,
      served: activeRows.filter(isServedStatus).length,
    }),
    [activeRows]
  );

  const pendingForSound = useMemo(() => activeRows.filter(isNewStatus), [activeRows]);

  const gridOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let list = activeRows.filter((o) => matchesBoardFilter(o, boardFilter));
    list.sort((a, b) => {
      const ta = new Date(orderTimestamp(a) || 0).getTime();
      const tb = new Date(orderTimestamp(b) || 0).getTime();
      return tb - ta;
    });
    if (q) {
      list = list.filter((order) => {
        const idStr = order.id.toString();
        const table = orderTableLabel(order).toLowerCase();
        const cust = orderCustomer(order).toLowerCase();
        return idStr.includes(q) || `order #${idStr}`.includes(q) || table.includes(q) || cust.includes(q);
      });
    }
    return boardFilter === 'served' ? list.slice(0, 48) : list.slice(0, 36);
  }, [activeRows, boardFilter, searchTerm]);

  useEffect(() => {
    if (!soundOn) {
      prevPendingIdsRef.current = new Set(pendingForSound.map((o) => o.id));
      return;
    }
    const nextIds = new Set(pendingForSound.map((o) => o.id));
    const prev = prevPendingIdsRef.current;
    let newIncoming = false;
    for (const id of nextIds) {
      if (!prev.has(id)) newIncoming = true;
    }
    if (newIncoming && prev.size > 0) {
      playTone(920, 160, 0.09);
      playTone(1100, 120, 0.06);
    }
    prevPendingIdsRef.current = nextIds;

    const urgent = pendingForSound.some((o) => getElapsedMinutes(orderTimestamp(o)) >= 20);
    if (urgent) {
      const now = Date.now();
      if (now - lastUrgentRef.current > 45000) {
        lastUrgentRef.current = now;
        playTone(220, 220, 0.1);
        playTone(180, 220, 0.1);
      }
    }
  }, [pendingForSound, soundOn, currentTime]);

  const filterTiles: { id: BoardFilter; label: string; tone: string }[] = [
    { id: 'new', label: 'New', tone: 'new' },
    { id: 'process', label: 'Process', tone: 'process' },
    { id: 'ready', label: 'Ready', tone: 'ready' },
    { id: 'served', label: 'Served', tone: 'served' },
  ];

  return (
    <div className="kitchen-page kitchen-page--pos">
      <header className="kds-pos-bar">
        <div className="kds-pos-bar__main">
          <div className="kds-pos-bar__left">
            <button type="button" className="kds-pos-icon-btn" aria-label="Back to menu" onClick={() => navigate('/')} title="Dashboard">
              <Menu size={22} strokeWidth={2.2} />
            </button>
            <div className="kds-pos-bar__identity">
              <div className="kds-pos-bar__avatar" aria-hidden>
                <ChefHat size={22} strokeWidth={2.2} />
              </div>
              <div className="kds-pos-bar__titles">
                <span className="kds-pos-bar__station">Kitchen display</span>
                <span className="kds-pos-bar__venue">Orders · refresh {REFRESH_MS / 1000}s</span>
              </div>
            </div>
          </div>

          <div className="kds-pos-bar__counts" role="tablist" aria-label="Filter by ticket status">
            {filterTiles.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={boardFilter === t.id}
                className={`kds-pos-count kds-pos-count--${t.tone}${boardFilter === t.id ? ' is-active' : ''}`}
                onClick={() => setBoardFilter(t.id)}
              >
                <span className="kds-pos-count__value">{counts[t.id]}</span>
                <span className="kds-pos-count__label">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="kds-pos-bar__tools">
            <span className="kds-pos-live" title={`Polling every ${REFRESH_MS / 1000}s`}>
              <Zap size={12} aria-hidden />
              Live
            </span>
            <button
              type="button"
              className={`kds-pos-tool${soundOn ? '' : ' is-muted'}`}
              onClick={() => setSoundOn((v) => !v)}
              title={soundOn ? 'Mute alerts' : 'Sound on'}
              aria-pressed={soundOn}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              className="kds-pos-tool"
              onClick={() => setTvMode((v) => !v)}
              title={tvMode ? 'Exit full screen' : 'Full screen'}
              aria-pressed={tvMode}
            >
              {tvMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        <label className="kds-pos-search">
          <Search size={17} strokeWidth={2} aria-hidden />
          <input
            type="search"
            placeholder="Search order #, table, guest…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
        </label>
      </header>

      <main className="kds-ticket-grid" aria-live="polite">
        {gridOrders.length === 0 ? (
          <div className="kds-ticket-grid__empty">No tickets in this column.</div>
        ) : (
          gridOrders.map((order) => {
            const variant = ticketVisualVariant(order);
            const table = orderTableLabel(order);
            const tableLine = table ? `Table ${table}` : orderCustomer(order) || 'Walk-in';
            const placed = formatPlacedTime(orderTimestamp(order));
            const elapsed = getElapsedMinutes(orderTimestamp(order));
            const elapsedLabel = `${elapsed} min${elapsed === 1 ? '' : 's'}`;
            const typeBadge = orderTypeLabel(order);
            const items = orderItemsList(order);
            const st = statusKey(order);

            return (
              <article key={order.id} className={`kds-ticket kds-ticket--${variant}`} data-print-order={order.id}>
                <header className="kds-ticket__head">
                  <div className="kds-ticket__head-main">
                    <div className="kds-ticket__table-line">
                      <LayoutGrid size={16} strokeWidth={2} aria-hidden />
                      <span>{tableLine}</span>
                    </div>
                    <div className="kds-ticket__order-no">Order #{order.id}</div>
                    <div className="kds-ticket__placed">{placed}</div>
                  </div>
                  <div className="kds-ticket__head-aside">
                    <span className="kds-ticket__type-pill">{typeBadge}</span>
                    <span className="kds-ticket__elapsed">{elapsedLabel}</span>
                  </div>
                </header>

                <div className="kds-ticket__body">
                  <ul className="kds-ticket__items">
                    {items.length === 0 ? (
                      <li className="kds-ticket__item kds-ticket__item--empty">No line items</li>
                    ) : (
                      items.map((it, idx) => (
                        <li key={idx} className="kds-ticket__item">
                          <div className="kds-ticket__item-line">
                            <span className="kds-ticket__qty">{it.quantity}×</span>
                            <span className="kds-ticket__name">{it.name}</span>
                          </div>
                          {it.modifier ? <p className="kds-ticket__modifier">{it.modifier}</p> : null}
                        </li>
                      ))
                    )}
                  </ul>

                  <footer className="kds-ticket__foot">
                    {(st === 'pending' || st === 'received') && (
                      <div className="kds-ticket__actions kds-ticket__actions--pair">
                        <button type="button" className="kds-ticket__btn kds-ticket__btn--primary" onClick={() => void updateOrderStatus(order.id, 'Preparing')}>
                          Start
                        </button>
                        <button type="button" className="kds-ticket__btn kds-ticket__btn--disabled" disabled title="Start the ticket first">
                          Finish
                        </button>
                      </div>
                    )}
                    {st === 'preparing' && (
                      <div className="kds-ticket__actions kds-ticket__actions--pair">
                        <button
                          type="button"
                          className="kds-ticket__btn kds-ticket__btn--muted"
                          onClick={() => void updateOrderStatus(order.id, 'Pending')}
                          title="Send back to new"
                        >
                          Pause
                        </button>
                        <button type="button" className="kds-ticket__btn kds-ticket__btn--primary" onClick={() => void updateOrderStatus(order.id, 'Ready')}>
                          Finish
                        </button>
                      </div>
                    )}
                    {st === 'ready' && (
                      <div className="kds-ticket__actions kds-ticket__actions--stack">
                        <button
                          type="button"
                          className="kds-ticket__btn kds-ticket__btn--wide"
                          onClick={() => window.print()}
                        >
                          <Printer size={16} strokeWidth={2} aria-hidden />
                          Print
                        </button>
                        <button type="button" className="kds-ticket__btn kds-ticket__btn--inline" onClick={() => void updateOrderStatus(order.id, 'Served')}>
                          Mark served
                        </button>
                      </div>
                    )}
                    {(st === 'served' || st === 'completed') && <div className="kds-ticket__done">Served</div>}
                  </footer>
                </div>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Kitchen;
