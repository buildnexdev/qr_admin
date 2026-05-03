import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Utensils, Edit2, Trash2, Save } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchMenu,
  addMenu,
  editMenu,
  deleteMenu,
  type FoodItem,
} from '../../store/menuSlice';
import { fetchCategories, addCategory } from '../../store/categorySlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { confirmAlert, triggerToast } from '../../components/common/CommonAlert';
import AddMenu from './addMenu';
import { getApiErrorMessage } from '../../utils/apiError';
import './menuStyle.scss';

const FALLBACK_CATEGORIES = ['Starters', 'Main', 'Beverages', 'Desserts', 'Sides', 'Specials'];

const Menu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: menu, loading } = useSelector((state: RootState) => state.menu);
  const { categories } = useSelector((state: RootState) => state.categories);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryNames = useMemo(() => {
    const names = categories.map((c) => c.name).filter(Boolean);
    return names.length ? names : FALLBACK_CATEGORIES;
  }, [categories]);

  useEffect(() => {
    void dispatch(fetchMenu());
    void dispatch(fetchCategories());
  }, [dispatch]);

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
      categories: data.categories,
      description: data.description ?? '',
      image: data.image ?? '',
      status: data.status !== false,
      rate: data.rate,
      code: data.code ?? '',
    };
    try {
      if (editingItem) {
        await dispatch(editMenu({ id: editingItem.id, payload })).unwrap();
        triggerToast('Menu updated', 'success', 'The dish was saved successfully.');
      } else {
        await dispatch(addMenu(payload)).unwrap();
        triggerToast('Menu item added', 'success', 'The new dish was added to the menu.');
      }
      setIsOffcanvasOpen(false);
    } catch (e: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(e, 'Failed to save menu item'));
    }
    setSaving(false);
  };

  const deleteMenuItem = async (id: number) => {
    const confirmation = await confirmAlert(
      'Delete Menu Item?',
      'Are you sure you want to remove this dish from the menu?'
    );
    if (!confirmation.isConfirmed) return;
    try {
      await dispatch(deleteMenu(id)).unwrap();
      triggerToast('Menu item deleted', 'success', 'The dish was removed from the menu.');
    } catch (e: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(e, 'Failed to delete menu item'));
    }
  };

  const q = searchTerm.toLowerCase();
  const filteredMenu = menu.filter((item) => {
    const catBlob = (item.category || '').toLowerCase();
    const codeStr = String(item.code ?? '').toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      catBlob.includes(q) ||
      codeStr.includes(q)
    );
  });

  const handleQuickAddCategory = async (name: string) => {
    try {
      await dispatch(addCategory({ name: name.trim(), description: '' })).unwrap();
      await dispatch(fetchCategories());
      triggerToast('Category added', 'success', 'Select it above if needed.');
    } catch (e: unknown) {
      triggerToast('Could not add category', 'error', getApiErrorMessage(e, 'Try another name'));
      throw e;
    }
  };

  return (
    <div className="menu-page-container">
      <CommonHeader
        title="Menu Management"
        icon={Utensils}
        searchPlaceholder="Search dishes or categories..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenOffcanvas()}
        addButtonLabel="Add New Item"
      />

      <div className="">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center menu-loading-state">
            <span className="menu-loading-text">Loading culinary delights...</span>
          </div>
        ) : (
          <div className="menu-card-grid">
            {filteredMenu.map((item) => (
              <div key={item.id} className="menu-card">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="menu-card-img" />
                ) : (
                  <div className="menu-img-placeholder">
                    <Utensils size={40} />
                  </div>
                )}

                <div className="menu-card-content">
                  <div className="menu-card-badges">
                    {(item.category || '')
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((cat) => (
                        <span key={cat} className="menu-category-badge">
                          {cat}
                        </span>
                      ))}
                  </div>
                  {item.code ? <div className="menu-card-code">Code {item.code}</div> : null}
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-desc">{item.description}</p>

                  {item.rate != null && Number(item.rate) > 0 && (
                    <div className="menu-card-rating">
                      <span className="menu-card-rating-star">★</span>
                      <span className="menu-card-rating-val">{item.rate}/5</span>
                    </div>
                  )}

                  <div className="menu-card-price">
                    <span className="menu-card-price-currency">₹</span>
                    {Number(item.price).toFixed(2)}
                  </div>
                </div>

                <div className="menu-actions">
                  <button
                    type="button"
                    onClick={() => handleOpenOffcanvas(item)}
                    className="btn-icon-edit"
                    title="Edit Item"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMenuItem(item.id)}
                    className="btn-icon-delete"
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {filteredMenu.length === 0 && (
              <div className="menu-empty-state">No menu items found. Try a different search!</div>
            )}
          </div>
        )}
      </div>

      <CommonOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Item'}
        width="480px"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsOffcanvasOpen(false)}
              className="btn-cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" form="menu-form" className="btn-premium btn-save" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving…' : editingItem ? 'Save Updates' : 'Publish Dish'}
            </button>
          </>
        }
      >
        <AddMenu
          key={editingItem ? `edit-${editingItem.id}` : `add-${categoryNames[0] ?? 'x'}`}
          initialData={editingItem}
          categoryNames={categoryNames}
          onQuickAddCategory={handleQuickAddCategory}
          onSave={(data) => {
            void saveMenuItem(data);
          }}
        />
      </CommonOffcanvas>
    </div>
  );
};

export default Menu;
