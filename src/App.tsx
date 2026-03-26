import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  LayoutDashboard, 
  Utensils, 
  Grid, 
  Plus, 
  Trash2, 
  Edit2, 
  ClipboardList,
  CheckCircle
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

interface FoodItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface Table {
  id: string;
  name: string;
}

interface Order {
  id: number;
  customerName: string;
  tableId: string;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'tables'>('orders');
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newTable, setNewTable] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchOrders, 10000); // Poll orders every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, tablesRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu`),
        axios.get(`${API_BASE_URL}/tables`),
        axios.get(`${API_BASE_URL}/orders`)
      ]);
      setMenu(menuRes.data);
      setTables(tablesRes.data);
      setOrders(ordersRes.data.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(res.data.reverse());
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

  const handleSaveMenu = async (items: FoodItem[]) => {
    try {
      await axios.post(`${API_BASE_URL}/menu`, items);
      setMenu(items);
      setEditingItem(null);
    } catch (error) {
      alert('Failed to save menu');
    }
  };

  const handleSaveTables = async (newTables: Table[]) => {
    try {
      await axios.post(`${API_BASE_URL}/tables`, newTables);
      setTables(newTables);
    } catch (error) {
      alert('Failed to save tables');
    }
  };

  const addTable = () => {
    if (!newTable) return;
    const updated = [...tables, { id: Date.now().toString(), name: newTable }];
    handleSaveTables(updated);
    setNewTable('');
  };

  const deleteTable = (id: string) => {
    const updated = tables.filter(t => t.id !== id);
    handleSaveTables(updated);
  };

  const deleteMenuItem = (id: number) => {
    const updated = menu.filter(m => m.id !== id);
    handleSaveMenu(updated);
  };

  const saveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    let updated;
    if (editingItem.id === 0) {
      // New item
      updated = [...menu, { ...editingItem, id: Date.now() }];
    } else {
      // Edit item
      updated = menu.map(m => m.id === editingItem.id ? editingItem : m);
    }
    handleSaveMenu(updated);
  };

  if (loading) return <div className="loading">Loading Admin Panel...</div>;

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo">
          <LayoutDashboard size={24} />
          <span>QR Order Admin</span>
        </div>
        <nav>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={20} /> Orders
          </button>
          <button 
            className={activeTab === 'menu' ? 'active' : ''} 
            onClick={() => setActiveTab('menu')}
          >
            <Utensils size={20} /> Menu
          </button>
          <button 
            className={activeTab === 'tables' ? 'active' : ''} 
            onClick={() => setActiveTab('tables')}
          >
            <Grid size={20} /> Tables
          </button>
        </nav>
      </aside>

      <main className="content">
        <header>
          <h1>{activeTab.charAt(0) + activeTab.slice(1)} Management</h1>
          <div className="user-profile">Restaurant Owner</div>
        </header>

        {activeTab === 'orders' && (
          <div className="tab-content orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id.toString().slice(-4)}</h3>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div className="order-info">
                  <p><strong>Table:</strong> {tables.find(t => t.id === order.tableId)?.name || order.tableId}</p>
                  <p><strong>Customer:</strong> {order.customerName}</p>
                </div>
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="order-actions" style={{ marginTop: '15px' }}>
                  {order.status === 'Preparing' && (
                    <button 
                      className="btn-primary btn-sm" 
                      style={{ width: '100%', background: '#2C7A7B' }}
                      onClick={() => updateOrderStatus(order.id, 'Served')}
                    >
                      <CheckCircle size={16} /> Mark as Served
                    </button>
                  )}
                </div>
                <div className="order-time">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="tab-content">
            <div className="toolbar">
              <button className="btn-primary" onClick={() => setEditingItem({ id: 0, name: '', price: 0, category: 'Main', description: '', image: '' })}>
                <Plus size={18} /> Add New Item
              </button>
            </div>

            <div className="menu-list">
              {menu.map(item => (
                <div key={item.id} className="menu-item-card">
                  <img src={item.image} alt={item.name} />
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <p className="category">{item.category}</p>
                    <p className="description">{item.description}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="actions">
                    <button onClick={() => setEditingItem(item)}><Edit2 size={16} /></button>
                    <button onClick={() => deleteMenuItem(item.id)} className="delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            {editingItem && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>{editingItem.id === 0 ? 'Add New' : 'Edit'} Menu Item</h2>
                  <form onSubmit={saveMenuItem}>
                    <div className="form-group">
                      <label>Name</label>
                      <input 
                        type="text" 
                        value={editingItem.name} 
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Price</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={editingItem.price} 
                        onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        value={editingItem.category} 
                        onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                      >
                        <option>Starters</option>
                        <option>Main</option>
                        <option>Beverages</option>
                        <option>Desserts</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        value={editingItem.description} 
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input 
                        type="text" 
                        value={editingItem.image} 
                        onChange={e => setEditingItem({...editingItem, image: e.target.value})} 
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="add-table-form">
                <input 
                  type="text" 
                  placeholder="Table Name (e.g. Table 4)" 
                  value={newTable} 
                  onChange={e => setNewTable(e.target.value)} 
                />
                <button className="btn-primary" onClick={addTable}>
                  <Plus size={18} /> Add Table
                </button>
              </div>
            </div>

            <div className="tables-grid">
              {tables.map(table => (
                <div key={table.id} className="table-card">
                  <div className="table-header">
                    <h3>{table.name}</h3>
                    <button onClick={() => deleteTable(table.id)} className="delete-btn"><Trash2 size={16} /></button>
                  </div>
                  <div className="qr-container">
                    <QRCodeSVG 
                      value={`http://localhost:5174/?tableId=${table.id}`} 
                      size={150} 
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="qr-hint">Scan to Order</p>
                  <button className="btn-secondary btn-sm" onClick={() => window.print()}>Print QR</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
