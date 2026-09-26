import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { setOrders } from '../../store/orderSlice';
import type { RootState } from '../../store';
import type { Order } from '../../store/orderSlice';
import type { Table } from '../../store/tableSlice';
import CommonHeader from '../../components/common/CommonHeader';
import { API_BASE_URL } from '../../routes/const';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';

function orderTotal(order: Order) {
  const anyOrder = order as Order & { total_amount?: number | string };
  return Number(order.total ?? anyOrder.total_amount ?? 0) || 0;
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s === 'served' || s === 'completed') return 'success';
  if (s === 'preparing' || s === 'pending') return 'warning';
  return 'default';
}

const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const { tables } = useSelector((state: RootState) => state.tables);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}api/orders`);
      const list = Array.isArray(res.data) ? res.data : [];
      dispatch(setOrders([...list].reverse()));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(() => void fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      await axios.post(`${API_BASE_URL}api/orders/update-status`, { orderId, status });
      triggerToast('Order updated', 'success', `Marked as ${status}`);
      await fetchOrders();
    } catch (error) {
      triggerToast('Update failed', 'error', getApiErrorMessage(error, 'Failed to update status'));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <CommonHeader
        title="Orders"
        icon={ShoppingBag}
        searchPlaceholder="Search guest or order #"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {loading && orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Synchronizing floor data…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          No orders found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order: Order) => {
            const status = String(order.status || 'pending');
            const canServe = ['preparing', 'pending', 'confirmed'].includes(status.toLowerCase());
            return (
              <Card key={order.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">#{order.id.toString().slice(-4)}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(
                          order.timestamp ||
                            (order as Order & { created_at?: string }).created_at ||
                            Date.now()
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        'capitalize',
                        statusTone(status) === 'success' && 'bg-success/15 text-success hover:bg-success/15',
                        statusTone(status) === 'warning' && 'bg-warning/15 text-warning hover:bg-warning/15'
                      )}
                      variant="secondary"
                    >
                      {status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Guest</span>
                      <span className="font-medium">{order.customerName || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Table</span>
                      <span className="font-medium">
                        {tables.find((t: Table) => t.id === order.tableId)?.name || order.tableId || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 border-y border-border py-3">
                    {(order.items || []).map((item, idx) => {
                      const anyItem = item as { price?: number; price_at_time?: number; quantity?: number; name?: string };
                      const itemPrice = anyItem.price ?? anyItem.price_at_time ?? 0;
                      const qty = anyItem.quantity || 1;
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 truncate">
                            <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                              {qty}×
                            </span>
                            {anyItem.name}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {formatCurrency(Number(itemPrice) * qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Total
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(orderTotal(order))}
                      </span>
                    </div>

                    {canServe && (
                      <Button
                        className="w-full"
                        disabled={updatingId === order.id}
                        onClick={() => void updateOrderStatus(order.id, 'Served')}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {updatingId === order.id ? 'Updating…' : 'Mark as served'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
