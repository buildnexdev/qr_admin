import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { setOrders } from '../store/orderSlice';
import type { RootState } from '../store';
import type { Order } from '../store/orderSlice';
import type { Table } from '../store/tableSlice';

const API_BASE_URL = 'http://localhost:5000/api';

const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const { tables } = useSelector((state: RootState) => state.tables);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`);
      dispatch(setOrders(res.data.reverse()));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.post(`${API_BASE_URL}/orders/update-status`, { orderId, status });
      fetchOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="tab-content">
      <div className="toolbar">
        <div className="title-section">
          <h1>Live Orders</h1>
          <p>Real-time updates from your dining floor</p>
        </div>
        <div className="order-stats">
          <div className="stat-pill">
            <span className="label">Active:</span>
            <span className="value">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="orders-grid">
        {orders.map((order: Order, index: number) => (
          <div 
            key={order.id} 
            className="order-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="order-header">
              <div className="id-group">
                <span className="hash">#</span>
                <h3>{order.id.toString().slice(-4)}</h3>
              </div>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-info">
              <div className="info-row">
                <span className="label">Table</span>
                <span className="value">
                  {tables.find((t: Table) => t.id === order.tableId)?.name || order.tableId}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Guest</span>
                <span className="value">{order.customerName}</span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="order-item">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span className="total-label">Total Amount</span>
              <span className="total-value">${order.total.toFixed(2)}</span>
            </div>

            <div className="order-actions" style={{ marginTop: '20px' }}>
              {order.status === 'Preparing' && (
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', background: '#10B981' }}
                  onClick={() => updateOrderStatus(order.id, 'Served')}
                >
                  <CheckCircle size={18} /> Complete Order
                </button>
              )}
            </div>
            
            <div className="order-time">
              Received at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
