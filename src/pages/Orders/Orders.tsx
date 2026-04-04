import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { setOrders } from '../../store/orderSlice';
import type { RootState } from '../../store';
import type { Order } from '../../store/orderSlice';
import type { Table } from '../../store/tableSlice';
import CommonHeader from '../../components/common/CommonHeader';

const API_BASE_URL = 'http://localhost:5000/api';

const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const { tables } = useSelector((state: RootState) => state.tables);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredOrders = orders.filter(
    o => o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         o.id.toString().includes(searchTerm)
  );

  return (
    <div className="d-flex flex-column h-100" style={{ background: 'var(--bg)' }}>
      <CommonHeader 
        title="Live Orders Overview"
        icon={ShoppingBag}
        searchPlaceholder="Search guest or order #"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-5" style={{ color: 'var(--muted)' }}>Synchronizing floor data...</div>
        ) : (
          <div className="row g-4">
            {filteredOrders.length === 0 && (
               <div className="col-12 py-5 text-center text-muted">
                 No orders found matching your criteria.
               </div>
            )}
            {filteredOrders.map((order: Order, index: number) => (
              <div key={order.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="rounded-4 p-4 h-100 d-flex flex-column" 
                  style={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    animation: `fadeUp 0.4s ease ${index * 0.05}s backwards`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="m-0 text-white" style={{ fontFamily: 'Playfair Display, serif'}}>
                        #{order.id.toString().slice(-4)}
                      </h4>
                      <small style={{ color: 'var(--muted)' }}><Clock size={12} className="me-1" />
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <span 
                      className="badge rounded-pill px-3 py-2 fw-semibold"
                      style={{ 
                        background: order.status.toLowerCase() === 'served' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: order.status.toLowerCase() === 'served' ? '#10B981' : '#f59e0b',
                        border: `1px solid ${order.status.toLowerCase() === 'served' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary small text-uppercase fw-semibold">GUEST</span>
                      <span className="text-white">{order.customerName}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary small text-uppercase fw-semibold">TABLE</span>
                      <span className="text-white fw-medium">
                        {tables.find((t: Table) => t.id === order.tableId)?.name || order.tableId}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow-1 border-top border-bottom py-3 mb-4" style={{ borderColor: 'rgba(128,128,128,0.1) !important' }}>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-white">
                          <span className="badge me-2" style={{ background: 'var(--card-hov)', color: 'var(--amber)' }}>{item.quantity}x</span>
                          {item.name}
                        </span>
                        <span style={{ color: 'var(--muted)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary small text-uppercase fw-bold">TOTAL AMOUNT</span>
                      <span className="fs-5 fw-bold" style={{ color: 'var(--cream)' }}>${order.total.toFixed(2)}</span>
                    </div>
                    
                    {order.status === 'Preparing' && (
                      <button 
                        className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', height: '44px', borderRadius: '10px' }}
                        onClick={() => updateOrderStatus(order.id, 'Served')}
                      >
                        <CheckCircle size={18} /> Mark as Served
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Orders;
