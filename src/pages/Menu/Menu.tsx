import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Utensils, Edit2, Trash2, Save } from 'lucide-react';
import type { RootState } from '../../store';
import { setMenuItems, setLoading } from '../../store/menuSlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { triggerToast, confirmAlert } from '../../components/common/CommonAlert';
import AddMenu from './addMenu';
import './menuStyle.scss';

const API_BASE_URL = 'http://localhost:5000/api';

const Menu: React.FC = () => {
  const dispatch = useDispatch();
  const { items: menu, loading } = useSelector((state: RootState) => state.menu);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => { 
    fetchMenu(); 
  }, []);

  const fetchMenu = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get(`${API_BASE_URL}/menu`);
      dispatch(setMenuItems(res.data));
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Fallback mock data if server fails
      if (menu.length === 0) {
        dispatch(setMenuItems([
          { id: 1, name: 'Truffle Pasta', price: 450, category: 'Main', rate: 4.8, description: 'Homemade pasta with black truffle cream sauce.', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80', status: true },
          { id: 2, name: 'Classic Burger', price: 250, category: 'Main', rate: 4.2, description: 'Double beef patty with melted cheese and house sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', status: true },
          { id: 3, name: 'Mango Smoothie', price: 120, category: 'Beverages', rate: 4.5, description: 'Fresh organic mangoes blended with coconut milk.', image: 'https://images.unsplash.com/photo-1546888636-237435f9dd7b?w=500&q=80', status: true }
        ]));
      }
    }
    dispatch(setLoading(false));
  };

  const handleOpenOffcanvas = (item?: any) => {
    setEditingItem(item || null);
    setIsOffcanvasOpen(true);
  };

  const saveMenuItem = async (data: any) => {
    let updated;
    if (editingItem) {
      updated = menu.map((m: any) => m.id === editingItem.id ? { ...m, ...data } : m);
      triggerToast('Menu item updated successfully!', 'success');
    } else {
      updated = [{ ...data, id: Date.now() }, ...menu];
      triggerToast('New menu item added!', 'success');
    }
    
    // Attempt API Request, gracefully fallback to local redux state if failed
    try {
      await axios.post(`${API_BASE_URL}/menu`, updated);
    } catch (error) {
      console.warn('API sync failed, using local redux store');
    }
    
    dispatch(setMenuItems(updated));
    setIsOffcanvasOpen(false);
  };

  const deleteMenuItem = async (id: number) => {
    const confirmation = await confirmAlert('Delete Menu Item?', 'Are you sure you want to remove this dish from the menu?');
    if (confirmation.isConfirmed) {
      const updated = menu.filter((m: any) => m.id !== id);
      try {
        await axios.post(`${API_BASE_URL}/menu`, updated);
      } catch (error) { }
      dispatch(setMenuItems(updated));
      triggerToast('Menu item deleted', 'error');
    }
  };

  // Filter Data
  const filteredMenu = menu.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="menu-page-container">
      {/* Header */}
      <CommonHeader 
        title="Menu Management" 
        icon={Utensils} 
        searchPlaceholder="Search dishes or categories..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenOffcanvas()}
        addButtonLabel="Add New Item"
      />

      {/* Card Grid Content */}
      <div className="flex-grow-1 overflow-auto">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="text-muted">Loading culinary delights...</span>
          </div>
        ) : (
          <div className="menu-card-grid">
            {filteredMenu.map((item: any) => (
              <div key={item.id} className="menu-card">
                
                {/* Image Section */}
                {item.image ? (
                  <img src={item.image} alt={item.name} className="menu-card-img" />
                ) : (
                  <div className="menu-img-placeholder">
                    <Utensils size={40} />
                  </div>
                )}

                {/* Content Section */}
                <div className="menu-card-content">
                  <span className="menu-category-badge">{item.category}</span>
                  <h3 className="fs-5 fw-bold mb-2 text-white">{item.name}</h3>
                  <p className="text-white-50 small mb-2 text-truncate" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal' }}>
                    {item.description}
                  </p>
                  
                  {item.rate && (
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <span className="text-warning">★</span>
                      <span className="text-muted small fw-semibold">{item.rate}/5</span>
                    </div>
                  )}

                  <div className="menu-card-price">
                    <span className="text-muted pe-1 fs-6">₹</span>
                    {Number(item.price).toFixed(2)}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="menu-actions">
                  <button onClick={() => handleOpenOffcanvas(item)} className="btn-icon-edit" title="Edit Item">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteMenuItem(item.id)} className="btn-icon-delete" title="Delete Item">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredMenu.length === 0 && (
              <div className="col-12 py-5 text-center text-muted">
                No menu items found. Try a different search!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offcanvas Form */}
      <CommonOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        title={editingItem ? "Edit Menu Item" : "Add New Item"}
        width="480px"
        footer={
          <>
            <button onClick={() => setIsOffcanvasOpen(false)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" form="menu-form" className="btn-premium btn-save">
              <Save size={18} /> {editingItem ? 'Save Updates' : 'Publish Dish'}
            </button>
          </>
        }
      >
        <AddMenu
          initialData={editingItem}
          onSave={saveMenuItem}
        />
      </CommonOffcanvas>
    </div>
  );
};

export default Menu;
