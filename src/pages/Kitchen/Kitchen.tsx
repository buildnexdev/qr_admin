import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Flame, Clock, CheckCircle, ChefHat, BellRing } from 'lucide-react';
import type { RootState } from '../../store';
import { setOrders } from '../../store/orderSlice';
import type { Order } from '../../store/orderSlice';
import CommonHeader from '../../components/common/CommonHeader';
import { triggerToast } from '../../components/common/CommonAlert';
import './kitchenStyle.scss';

const API_BASE_URL = 'http://localhost:5000/api';

const Kitchen: React.FC = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live orders periodically
  useEffect(() => {
    fetchOrders();
    const orderInterval = setInterval(fetchOrders, 10000);
    return () => clearInterval(orderInterval);
  }, []);

  // Update elapsed time every minute to avoid heavy react re-renders
  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`);
      dispatch(setOrders(res.data.reverse()));
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      // Optional: you can mock orders here if API is down for demo purposes
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/update-status`, { orderId, status });
      fetchOrders();
      triggerToast(`Order #${orderId.toString().slice(-4)} marked as ${status}`, 'success');
    } catch (error) {
      triggerToast('Failed to update order status', 'error');
    }
  };

  // Helper: calculate elapsed minutes
  const getElapsedMinutes = (timestamp: string | Date) => {
    const orderTime = new Date(timestamp).getTime();
    const now = currentTime.getTime();
    return Math.floor((now - orderTime) / 60000);
  };

  // Filter conditions
  const filteredOrders = orders.filter((order) => {
    const searchMatch = order.id.toString().includes(searchTerm) || 
                       (order.tableId && order.tableId.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Received');
  const preparingOrders = filteredOrders.filter(o => o.status === 'Preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'Ready');

  const getTimerStyles = (minutes: number) => {
    if (minutes >= 20) return 'danger';
    if (minutes >= 10) return 'warning';
    return 'normal';
  };

  const TicketCard = ({ order, statusType }: { order: Order; statusType: 'pending' | 'preparing' | 'ready' }) => {
    const elapsed = getElapsedMinutes(order.timestamp);

    return (
      <div className="ticket-card" style={{ animationDelay: `${Math.random() * 0.2}s` }}>
        <div className="ticket-header">
          <div className="ticket-id">
            <span>#{order.id.toString().slice(-4)}</span>
            <span className="table-badge">Table {order.tableId}</span>
          </div>
          <div className={`ticket-time ${getTimerStyles(elapsed)}`}>
            <Clock size={14} />
            <span>{elapsed}m</span>
          </div>
        </div>

        <div className="ticket-items">
          {order.items.map((item, idx) => (
            <div key={idx} className="ticket-item">
              <span className="item-qty">{item.quantity}</span>
              <span className="item-name">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="ticket-footer">
          {statusType === 'pending' && (
            <button className="btn-kds-action btn-prepare" onClick={() => updateOrderStatus(order.id, 'Preparing')}>
              <Flame size={16} /> Start Preparing
            </button>
          )}
          {statusType === 'preparing' && (
            <button className="btn-kds-action btn-ready" onClick={() => updateOrderStatus(order.id, 'Ready')}>
              <CheckCircle size={16} /> Mark as Ready
            </button>
          )}
          {statusType === 'ready' && (
            <button className="btn-kds-action btn-serve" onClick={() => updateOrderStatus(order.id, 'Served')}>
              <BellRing size={16} /> Serve Order
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="kitchen-board">
      <CommonHeader 
        title="Kitchen Display System" 
        icon={ChefHat} 
        searchPlaceholder="Search order # or table..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="kds-grid mt-4">
        {/* === PENDING COLUMN === */}
        <div className="kds-column">
          <div className="kds-column-header">
            <h3 className="kds-column-title">
              Incoming <span className="kds-count-badge">{pendingOrders.length}</span>
            </h3>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="kds-empty">
              <ChefHat size={48} />
              <p>No new orders waiting.</p>
            </div>
          ) : (
            pendingOrders.map(order => <TicketCard key={order.id} order={order} statusType="pending" />)
          )}
        </div>

        {/* === PREPARING COLUMN === */}
        <div className="kds-column">
          <div className="kds-column-header">
            <h3 className="kds-column-title" style={{ color: '#ea580c' }}>
              Preparing <span className="kds-count-badge" style={{ color: '#ea580c', background: 'rgba(234, 88, 12, 0.15)' }}>{preparingOrders.length}</span>
            </h3>
          </div>
          {preparingOrders.length === 0 ? (
            <div className="kds-empty">
              <Flame size={48} />
              <p>No orders currently matching this status.</p>
            </div>
          ) : (
            preparingOrders.map(order => <TicketCard key={order.id} order={order} statusType="preparing" />)
          )}
        </div>

        {/* === READY COLUMN === */}
        <div className="kds-column">
          <div className="kds-column-header">
            <h3 className="kds-column-title" style={{ color: '#10B981' }}>
              Ready to Serve <span className="kds-count-badge" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)' }}>{readyOrders.length}</span>
            </h3>
          </div>
          {readyOrders.length === 0 ? (
            <div className="kds-empty">
              <CheckCircle size={48} />
              <p>All prepared orders have been served.</p>
            </div>
          ) : (
            readyOrders.map(order => <TicketCard key={order.id} order={order} statusType="ready" />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
