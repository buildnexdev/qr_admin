import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, Edit2, Trash2, Utensils, Link, Upload, Camera } from 'lucide-react';
import type { RootState } from '../store';
import { setMenuItems, setLoading } from '../store/menuSlice';
import type { FoodItem } from '../store/menuSlice';
import Modal from '../components/Modal';

const API_BASE_URL = 'http://localhost:5000/api';

type ImageMode = 'link' | 'upload' | 'camera';

const CATEGORIES = ['Starters', 'Main', 'Beverages', 'Desserts', 'Sides', 'Specials'];

const Menu: React.FC = () => {
  const dispatch = useDispatch();
  const { items: menu, loading } = useSelector((state: RootState) => state.menu);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [imageMode, setImageMode] = useState<ImageMode>('link');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get(`${API_BASE_URL}/menu`);
      dispatch(setMenuItems(res.data));
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
    dispatch(setLoading(false));
  };

  const handleSaveMenu = async (items: FoodItem[]) => {
    try {
      await axios.post(`${API_BASE_URL}/menu`, items);
      dispatch(setMenuItems(items));
      setEditingItem(null);
    } catch (error) {
      alert('Failed to save menu');
    }
  };

  const deleteMenuItem = (id: number) => {
    const updated = menu.filter((m: FoodItem) => m.id !== id);
    handleSaveMenu(updated);
  };

  const saveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    let updated;
    if (editingItem.id === 0) {
      updated = [...menu, { ...editingItem, id: Date.now() }];
    } else {
      updated = menu.map((m: FoodItem) => m.id === editingItem.id ? editingItem : m);
    }
    handleSaveMenu(updated);
  };

  const openEdit = (item: FoodItem | null) => {
    const blank: FoodItem = { id: 0, name: '', price: 0, category: 'Main', description: '', image: '' };
    const target = item ?? blank;
    setEditingItem(target);
    setImageMode('link');
    setImagePreview(target.image || '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setEditingItem(prev => prev ? { ...prev, image: result } : prev);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading menu...</div>;

  return (
    <>
      <style>{`
        /* ── Image mode tabs ────────────────────────────────── */
        .img-mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .img-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .img-tab.active {
          border-color: #f59e0b;
          background: #fffbeb;
          color: #b45309;
        }
        .img-tab:hover:not(.active) {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        /* ── Image preview ──────────────────────────────────── */
        .img-preview {
          width: 100%;
          height: 130px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          margin-top: 8px;
        }
        .img-placeholder {
          width: 100%;
          height: 130px;
          border-radius: 10px;
          border: 2px dashed #e5e7eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 13px;
          margin-top: 8px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .img-placeholder:hover { border-color: #f59e0b; color: #b45309; }

        /* ── Category select fix ────────────────────────────── */
        .input-field select {
          background: transparent;
          border: none;
          width: 100%;
          outline: none;
          color: #18181b;
          font-size: 15px;
          font-family: inherit;
          cursor: pointer;
        }
        .input-field select option {
          color: #18181b;
          background: white;
        }

        /* ── ₹ price prefix ─────────────────────────────────── */
        .currency-prefix {
          font-size: 15px;
          font-weight: 600;
          color: #6b7280;
          margin-right: 4px;
          flex-shrink: 0;
        }
      `}</style>

      <div className="tab-content">
        <div className="toolbar">
          <div className="title-section">
            <h1>Menu Management</h1>
            <p>Create and refine your culinary offerings</p>
          </div>
          <button className="btn-primary" onClick={() => openEdit(null)}>
            <Plus size={20} strokeWidth={2.5} /> Add New Item
          </button>
        </div>

        <div className="menu-list">
          {menu.map((item: FoodItem, index: number) => (
            <div
              key={item.id}
              className="menu-item-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item.image && <img src={item.image} alt={item.name} />}
              {!item.image && <div className="no-image"><Utensils size={40} /></div>}

              <div className="menu-item-info">
                <p className="category" style={{ color: '#18181b' }}>{item.category}</p>
                <h3>{item.name}</h3>
                <p className="description">{item.description}</p>
                <div className="price-tag">
                  <span className="currency">₹</span>
                  <span className="amount">{Number(item.price).toFixed(2)}</span>
                </div>
              </div>

              <div className="actions">
                <button onClick={() => openEdit(item)} title="Edit Item" className="edit-btn">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteMenuItem(item.id)} className="delete-btn" title="Delete Item">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={editingItem !== null}
          onClose={() => setEditingItem(null)}
          title={editingItem?.id === 0 ? 'Add New Item' : 'Edit Menu Item'}
        >
          {editingItem && (
            <form onSubmit={saveMenuItem} className="premium-form">

              {/* Name */}
              <div className="input-group">
                <label>Plate Name</label>
                <div className="input-field">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                    placeholder="e.g. Grilled Salmon"
                  />
                </div>
              </div>

              {/* Price + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label>Price (₹)</label>
                  <div className="input-field" style={{ alignItems: 'center' }}>
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingItem.price}
                      onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      required
                      style={{ paddingLeft: 0 }}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <div className="input-field">
                    <select
                      value={editingItem.category}
                      onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="input-group">
                <label>Description</label>
                <div className="input-field" style={{ alignItems: 'flex-start' }}>
                  <textarea
                    value={editingItem.description}
                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                    style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', minHeight: '80px', paddingTop: '10px', fontFamily: 'inherit', fontSize: 15, color: '#18181b' }}
                    placeholder="Tell the story of this dish..."
                  />
                </div>
              </div>

              {/* Image — 3 modes */}
              <div className="input-group">
                <label>Dish Image</label>

                {/* Mode tabs */}
                <div className="img-mode-tabs">
                  <button type="button" className={`img-tab ${imageMode === 'link' ? 'active' : ''}`} onClick={() => setImageMode('link')}>
                    <Link size={14} /> Link
                  </button>
                  <button type="button" className={`img-tab ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>
                    <Upload size={14} /> Upload
                  </button>
                  <button type="button" className={`img-tab ${imageMode === 'camera' ? 'active' : ''}`} onClick={() => setImageMode('camera')}>
                    <Camera size={14} /> Camera
                  </button>
                </div>

                {/* Link input */}
                {imageMode === 'link' && (
                  <div className="input-field">
                    <input
                      type="text"
                      value={editingItem.image}
                      onChange={e => {
                        setEditingItem({ ...editingItem, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                )}

                {/* Upload */}
                {imageMode === 'upload' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <div className="img-placeholder" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={22} />
                      <span>Click to choose a file</span>
                    </div>
                  </>
                )}

                {/* Camera */}
                {imageMode === 'camera' && (
                  <>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <div className="img-placeholder" onClick={() => cameraInputRef.current?.click()}>
                      <Camera size={22} />
                      <span>Tap to take a photo</span>
                    </div>
                  </>
                )}

                {/* Preview */}
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="img-preview" />
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Offering
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Menu;
