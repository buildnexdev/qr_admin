import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Utensils, Edit2, Trash2, Save } from 'lucide-react';
import type { RootState } from '../../store';
import { setMenuItems, setLoading } from '../../store/menuSlice';
import type { FoodItem } from '../../store/menuSlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { confirmAlert, triggerToast } from '../../components/common/CommonAlert';
import AddMenu from './addMenu';
import { getApiErrorMessage } from '../../utils/apiError';
import './menuStyle.scss';

const API_BASE_URL = 'http://localhost:5000/api';

const Menu: React.FC = () => {
  const dispatch = useDispatch();
  const { items: menu, loading } = useSelector((state: RootState) => state.menu);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchMenu(); 
  }, []);

  const fetchMenu = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get<FoodItem[]>(`${API_BASE_URL}/menu`);
      dispatch(setMenuItems(res.data));
    } catch (error) {
      console.error('Error fetching menu:', error);
      triggerToast('Could not load menu', 'error', getApiErrorMessage(error, 'Failed to load menu'));
    }
    dispatch(setLoading(false));
  };

  const handleOpenOffcanvas = (item?: FoodItem) => {
    setEditingItem(item || null);
    setIsOffcanvasOpen(true);
  };

  const saveMenuItem = async (data: Record<string, unknown>) => {
    setSaving(true);
    const payload = {
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description ?? '',
      image: data.image ?? '',
      status: data.status !== false,
      rate: data.rate,
    };
    try {
      if (editingItem) {
        await axios.put(`${API_BASE_URL}/menu/${editingItem.id}`, payload);
        triggerToast('Menu updated', 'success', 'The dish was saved successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/menu`, payload);
        triggerToast('Menu item added', 'success', 'The new dish was added to the menu.');
      }
      await fetchMenu();
      setIsOffcanvasOpen(false);
    } catch (err) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Failed to save menu item'));
    }
    setSaving(false);
  };

  const deleteMenuItem = async (id: number) => {
    const confirmation = await confirmAlert('Delete Menu Item?', 'Are you sure you want to remove this dish from the menu?');
    if (!confirmation.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/menu/${id}`);
      await fetchMenu();
      triggerToast('Menu item deleted', 'success', 'The dish was removed from the menu.');
    } catch (err) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete menu item'));
    }
  };

  const filteredMenu = menu.filter(
    (item) =>
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
      <div className="">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="text-muted">Loading culinary delights...</span>
          </div>
        ) : (
          <div className="menu-card-grid">
            {filteredMenu.map((item) => (
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
            <button type="button" onClick={() => setIsOffcanvasOpen(false)} className="btn-cancel" disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="menu-form" className="btn-premium btn-save" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving…' : editingItem ? 'Save Updates' : 'Publish Dish'}
            </button>
          </>
        }
      >
        <AddMenu
          initialData={editingItem}
          onSave={(data) => {
            void saveMenuItem(data);
          }}
        />
      </CommonOffcanvas>
    </div>
  );
};

export default Menu;
