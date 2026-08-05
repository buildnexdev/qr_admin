/** Same channel rules as dashboard / kitchen — off-premise defaults to delivery when type is unknown */

export type OrderChannel = 'dine' | 'delivery' | 'takeaway';

export function orderChannel(o: Record<string, unknown>): OrderChannel {
  const raw = String(o.orderType ?? o.order_type ?? '').toLowerCase();
  if (raw.includes('deliver')) return 'delivery';
  if (raw.includes('take') || raw.includes('pickup') || raw.includes('parcel')) return 'takeaway';
  if (raw.includes('dine')) return 'dine';
  const table = o.tableId ?? o.table_id;
  const t = table != null ? String(table).trim() : '';
  if (t !== '' && t.toLowerCase() !== 'general') return 'dine';
  return 'delivery';
}

export function isDeliveryOrder(o: Record<string, unknown>): boolean {
  return orderChannel(o) === 'delivery';
}

export function orderTs(o: { timestamp?: string; created_at?: string }) {
  return (o.timestamp ?? o.created_at) as string | undefined;
}

export function statusKey(o: { status?: string }) {
  return String(o.status ?? '')
    .trim()
    .toLowerCase();
}

const DISPATCH_PREFIX = 'nammaqr_delivery_dispatch_';

export type DispatchMeta = {
  riderName: string;
  riderPhone?: string;
  etaMins: number;
  dispatchedAt: string;
};

export function getDispatchMeta(orderId: number): DispatchMeta | null {
  try {
    const raw = sessionStorage.getItem(DISPATCH_PREFIX + orderId);
    if (!raw) return null;
    return JSON.parse(raw) as DispatchMeta;
  } catch {
    return null;
  }
}

export function setDispatchMeta(orderId: number, meta: DispatchMeta) {
  sessionStorage.setItem(DISPATCH_PREFIX + orderId, JSON.stringify(meta));
}

export function clearDispatchMeta(orderId: number) {
  sessionStorage.removeItem(DISPATCH_PREFIX + orderId);
}

export type DeliveryStage = 'new' | 'kitchen' | 'ready' | 'out' | 'done' | 'cancelled';

export function getDeliveryStage(o: { id: number; status?: string }): DeliveryStage {
  const st = statusKey(o);
  if (st === 'cancelled') return 'cancelled';
  if (st === 'served' || st === 'completed') return 'done';
  if (st === 'ready') {
    return getDispatchMeta(o.id) ? 'out' : 'ready';
  }
  if (st === 'preparing') return 'kitchen';
  if (st === 'pending' || st === 'received') return 'new';
  return 'new';
}
