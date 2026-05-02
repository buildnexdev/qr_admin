import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Minus, Plus, ShoppingBag, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../routes/const';
import type { MenuItemDto } from '../../api/menuApi';
import './CustomerOrderPage.scss';

type TableContext = {
  tableId: number;
  tableName: string;
  tableCode: string | null;
  selfOrdering: boolean;
  qrEnabled: boolean;
  companyName: string;
};

async function fetchTableContext(companySlug: string, tableKey: string): Promise<TableContext> {
  const { data } = await axios.get<TableContext>(
    `${API_BASE_URL}api/public/table-context/${encodeURIComponent(companySlug)}/${encodeURIComponent(tableKey)}`
  );
  return data;
}

async function fetchPublicMenu(): Promise<MenuItemDto[]> {
  const { data } = await axios.get<MenuItemDto[]>(`${API_BASE_URL}api/menu`);
  return data;
}

type CartLine = { item: MenuItemDto; qty: number };

/** Avoid stealing `/admin/table/...` from app routes */
const RESERVED_COMPANY_SLUGS = new Set(['admin', 'login', 'register']);

const CustomerOrderPage: React.FC = () => {
  const { companySlug = '', tableKey = '' } = useParams<{ companySlug: string; tableKey: string }>();

  const [ctx, setCtx] = useState<TableContext | null>(null);
  const [ctxError, setCtxError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItemDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setCtxError(null);
    setMenuLoading(true);
    try {
      const [c, m] = await Promise.all([fetchTableContext(companySlug, tableKey), fetchPublicMenu()]);
      setCtx(c);
      setMenu(Array.isArray(m) ? m : []);
    } catch (e: unknown) {
      let msg = 'Could not load this table. Check the link or ask staff.';
      if (axios.isAxiosError(e)) {
        if (!e.response) {
          msg =
            'Cannot reach the API server. Start the backend (e.g. port 5000) and check VITE / API_BASE_URL matches.';
        } else if (e.response.data && typeof e.response.data === 'object' && 'error' in e.response.data) {
          msg = String((e.response.data as { error?: string }).error);
        }
      }
      setCtxError(msg);
      setCtx(null);
    } finally {
      setMenuLoading(false);
    }
  }, [companySlug, tableKey]);

  useEffect(() => {
    if (RESERVED_COMPANY_SLUGS.has(companySlug.toLowerCase())) {
      setCtxError('Use the QR link from your table — this URL is not a customer menu.');
      setCtx(null);
      setMenu([]);
      setMenuLoading(false);
      return;
    }
    void load();
  }, [companySlug, tableKey, load]);

  const availableMenu = useMemo(
    () => menu.filter((it) => it.status !== false && Number(it.price) >= 0),
    [menu]
  );

  const cartLines = useMemo(() => Object.values(cart).filter((l) => l.qty > 0), [cart]);

  const subtotal = useMemo(
    () => cartLines.reduce((s, l) => s + Number(l.item.price) * l.qty, 0),
    [cartLines]
  );

  const addOne = (item: MenuItemDto) => {
    setPlacedOrderId(null);
    setOrderError(null);
    setCart((prev) => {
      const cur = prev[item.id]?.qty ?? 0;
      return { ...prev, [item.id]: { item, qty: cur + 1 } };
    });
  };

  const removeOne = (itemId: number) => {
    setCart((prev) => {
      const line = prev[itemId];
      if (!line) return prev;
      const nextQty = line.qty - 1;
      if (nextQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...line, qty: nextQty } };
    });
  };

  const placeOrder = async () => {
    if (!ctx?.selfOrdering) return;
    if (cartLines.length === 0) {
      setOrderError('Add at least one item to your order.');
      return;
    }
    setSubmitting(true);
    setOrderError(null);
    try {
      const { data } = await axios.post<{ id: number }>(`${API_BASE_URL}api/orders`, {
        customerName: customerName.trim() || 'Guest',
        tableId: ctx.tableId,
        items: cartLines.map((l) => ({
          id: l.item.id,
          quantity: l.qty,
          price: Number(l.item.price),
        })),
        total: subtotal,
      });
      setPlacedOrderId(data.id);
      setCart({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setOrderError('Could not send your order. Please try again or ask staff.');
    } finally {
      setSubmitting(false);
    }
  };

  if (ctxError) {
    return (
      <div className="customer-order customer-order--center">
        <div className="customer-order__panel customer-order__panel--error">
          <AlertCircle size={40} strokeWidth={1.75} aria-hidden />
          <h1 className="customer-order__error-title">Unable to open menu</h1>
          <p className="customer-order__error-msg">{ctxError}</p>
        </div>
      </div>
    );
  }

  if (!ctx || menuLoading) {
    return (
      <div className="customer-order customer-order--center">
        <Loader2 className="customer-order__spinner" size={36} strokeWidth={2} aria-hidden />
        <p className="customer-order__loading-text">Loading your table…</p>
      </div>
    );
  }

  if (!ctx.selfOrdering) {
    return (
      <div className="customer-order customer-order--center">
        <div className="customer-order__panel">
          <h1 className="customer-order__brand">{ctx.companyName}</h1>
          <p className="customer-order__table-label">Table {ctx.tableName}</p>
          <p className="customer-order__muted">Self-ordering is turned off for this table. Please ask staff to order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-order">
      <header className="customer-order__header">
        <div className="customer-order__header-inner">
          <div>
            <p className="customer-order__eyebrow">{ctx.companyName}</p>
            <h1 className="customer-order__title">Table {ctx.tableName}</h1>
            {ctx.tableCode ? (
              <p className="customer-order__meta">Code {ctx.tableCode}</p>
            ) : null}
          </div>
          <div className="customer-order__header-icon" aria-hidden>
            <ShoppingBag size={22} strokeWidth={2} />
          </div>
        </div>
      </header>

      {placedOrderId != null && (
        <div className="customer-order__success" role="status">
          <CheckCircle2 size={22} aria-hidden />
          <div>
            <strong>Order #{placedOrderId} sent.</strong>
            <span> The kitchen has received it.</span>
          </div>
        </div>
      )}

      <main className="customer-order__main">
        <section className="customer-order__menu" aria-label="Menu">
          {availableMenu.length === 0 ? (
            <p className="customer-order__empty-menu">No dishes available right now.</p>
          ) : (
            <ul className="customer-order__list">
              {availableMenu.map((item) => {
                const line = cart[item.id];
                const qty = line?.qty ?? 0;
                return (
                  <li key={item.id} className="customer-order__item">
                    <div className="customer-order__item-media">
                      {item.image ? (
                        <img src={item.image} alt="" className="customer-order__item-img" loading="lazy" />
                      ) : (
                        <div className="customer-order__item-placeholder" aria-hidden>
                          ◆
                        </div>
                      )}
                    </div>
                    <div className="customer-order__item-body">
                      <div className="customer-order__item-top">
                        <h2 className="customer-order__item-name">{item.name}</h2>
                        <span className="customer-order__item-price">₹ {Number(item.price).toFixed(2)}</span>
                      </div>
                      {item.category ? (
                        <p className="customer-order__item-cat">{item.category}</p>
                      ) : null}
                      {item.description ? (
                        <p className="customer-order__item-desc">{item.description}</p>
                      ) : null}
                      <div className="customer-order__item-actions">
                        {qty === 0 ? (
                          <button type="button" className="customer-order__add" onClick={() => addOne(item)}>
                            Add
                          </button>
                        ) : (
                          <div className="customer-order__stepper">
                            <button
                              type="button"
                              className="customer-order__step"
                              onClick={() => removeOne(item.id)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="customer-order__qty">{qty}</span>
                            <button
                              type="button"
                              className="customer-order__step"
                              onClick={() => addOne(item)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="customer-order__cart" aria-label="Your order">
          <div className="customer-order__cart-inner">
            <h2 className="customer-order__cart-title">Your order</h2>
            {cartLines.length === 0 ? (
              <p className="customer-order__cart-empty">Tap Add on dishes you’d like.</p>
            ) : (
              <ul className="customer-order__cart-lines">
                {cartLines.map((l) => (
                  <li key={l.item.id} className="customer-order__cart-line">
                    <span className="customer-order__cart-name">
                      {l.qty}× {l.item.name}
                    </span>
                    <span className="customer-order__cart-amt">
                      ₹ {(Number(l.item.price) * l.qty).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <label className="customer-order__label" htmlFor="co-name">
              Name (optional)
            </label>
            <input
              id="co-name"
              className="customer-order__input"
              placeholder="For your receipt"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoComplete="name"
            />

            <div className="customer-order__total-row">
              <span>Total</span>
              <strong>₹ {subtotal.toFixed(2)}</strong>
            </div>

            {orderError ? <p className="customer-order__form-error">{orderError}</p> : null}

            <button
              type="button"
              className="customer-order__submit"
              disabled={submitting || cartLines.length === 0}
              onClick={() => void placeOrder()}
            >
              {submitting ? 'Sending…' : 'Place order'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CustomerOrderPage;
