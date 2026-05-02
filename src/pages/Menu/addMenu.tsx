import React, { useState, useEffect, useRef } from 'react';
import { Link, Upload, Camera, Plus } from 'lucide-react';

interface AddMenuProps {
  initialData?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => void;
  /** Category names from API (menu_categories); order preserved */
  categoryNames: string[];
  /** Creates a new category in DB and refreshes the parent list */
  onQuickAddCategory?: (name: string) => Promise<void>;
}

type ImageMode = 'link' | 'upload' | 'camera';

type FormState = {
  name: string;
  code: string;
  selectedCategories: string[];
  price: string;
  rate: string;
  description: string;
  image: string;
  status: boolean;
};

const parseCategoriesFromInitial = (raw: unknown, categoryNames: string[]): string[] => {
  const s = String(raw || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const known = new Set(categoryNames);
  const picked = s.filter((c) => known.has(c));
  if (picked.length) return picked;
  if (categoryNames[0]) return [categoryNames[0]];
  return [];
};

const AddMenu: React.FC<AddMenuProps> = ({ initialData, onSave, categoryNames, onQuickAddCategory }) => {
  const defaultCategory = categoryNames[0] || 'Main';

  const [formData, setFormData] = useState<FormState>({
    name: '',
    code: '',
    selectedCategories: defaultCategory ? [defaultCategory] : [],
    price: '',
    rate: '',
    description: '',
    image: '',
    status: true,
  });

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [imageMode, setImageMode] = useState<ImageMode>('link');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      const selected = parseCategoriesFromInitial(initialData.category, categoryNames);
      setFormData({
        name: String(initialData.name || ''),
        code: String(initialData.code || ''),
        selectedCategories: selected.length ? selected : defaultCategory ? [defaultCategory] : [],
        price: initialData.price != null ? String(initialData.price) : '',
        rate: initialData.rate != null ? String(initialData.rate) : '',
        description: String(initialData.description || ''),
        image: String(initialData.image || ''),
        status: initialData.status !== undefined ? Boolean(initialData.status) : true,
      });
      setImagePreview(String(initialData.image || ''));
      setImageMode('link');
    } else {
      setFormData({
        name: '',
        code: '',
        selectedCategories: defaultCategory ? [defaultCategory] : [],
        price: '',
        rate: '',
        description: '',
        image: '',
        status: true,
      });
      setImagePreview('');
      setImageMode('link');
    }
    setCategoryError('');
    setNewCategoryInput('');
  }, [initialData, categoryNames, defaultCategory]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (name: string) => {
    setCategoryError('');
    setFormData((prev) => {
      const set = new Set(prev.selectedCategories);
      if (set.has(name)) set.delete(name);
      else set.add(name);
      return { ...prev, selectedCategories: Array.from(set) };
    });
  };

  const handleQuickAddCategoryClick = async () => {
    const raw = newCategoryInput.trim();
    if (!raw) return;
    if (!onQuickAddCategory) return;
    if (categoryNames.some((c) => c.toLowerCase() === raw.toLowerCase())) {
      setCategoryError('That category already exists.');
      return;
    }
    setAddingCategory(true);
    setCategoryError('');
    try {
      await onQuickAddCategory(raw);
      setNewCategoryInput('');
      setFormData((prev) => ({
        ...prev,
        selectedCategories: prev.selectedCategories.includes(raw)
          ? prev.selectedCategories
          : [...prev.selectedCategories, raw],
      }));
    } catch {
      /* parent shows toast */
    } finally {
      setAddingCategory(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, status: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedCategories.length) {
      setCategoryError('Select at least one category.');
      return;
    }
    setCategoryError('');
    onSave({
      name: formData.name,
      code: formData.code.trim(),
      price: parseFloat(formData.price) || 0,
      rate: parseFloat(formData.rate) || 0,
      description: formData.description,
      image: formData.image,
      status: formData.status,
      category: formData.selectedCategories.join(', '),
      categories: formData.selectedCategories,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form id="menu-form" onSubmit={handleSubmit} className="d-flex flex-column gap-2 menu-add-form">
      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Menu Name *</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          type="text"
          placeholder="e.g. Grilled Salmon"
          className="dark-input"
          required
        />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Code</label>
        <input
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          type="text"
          placeholder="e.g. M-102 or SKU"
          className="dark-input"
          autoComplete="off"
        />
      </div>

      <div className="input-group d-flex flex-column gap-1 menu-form-categories">
        <label className="input-label">Categories *</label>
        <div className="menu-form-cat-list" role="group" aria-label="Select categories">
          {categoryNames.length === 0 ? (
            <span className="text-muted small">No categories yet — add one below.</span>
          ) : (
            categoryNames.map((c) => (
              <label key={c} className="menu-form-cat-item">
                <input
                  type="checkbox"
                  checked={formData.selectedCategories.includes(c)}
                  onChange={() => toggleCategory(c)}
                />
                <span>{c}</span>
              </label>
            ))
          )}
        </div>
        {categoryError ? (
          <span className="small" style={{ color: '#f87171' }}>
            {categoryError}
          </span>
        ) : null}
        <div className="d-flex gap-2 align-items-stretch flex-wrap">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleQuickAddCategoryClick();
              }
            }}
            placeholder="New category name…"
            className="dark-input flex-grow-1"
            style={{ minWidth: '140px' }}
            disabled={!onQuickAddCategory || addingCategory}
          />
          <button
            type="button"
            className="btn-premium d-inline-flex align-items-center justify-content-center gap-1 px-3"
            style={{ height: '42px', whiteSpace: 'nowrap' }}
            onClick={() => void handleQuickAddCategoryClick()}
            disabled={!onQuickAddCategory || addingCategory || !newCategoryInput.trim()}
          >
            <Plus size={16} /> {addingCategory ? 'Adding…' : 'Add category'}
          </button>
        </div>
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Price (₹) *</label>
        <input
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          className="dark-input"
          required
        />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Rating (Optional)</label>
        <input
          name="rate"
          value={formData.rate}
          onChange={handleInputChange}
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="e.g. 4.5"
          className="dark-input"
        />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Tell the story of this dish..."
          rows={3}
          className="dark-input"
        />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Dish Image</label>
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

        {imageMode === 'link' && (
          <input
            type="text"
            value={formData.image}
            onChange={(e) => {
              const v = e.target.value;
              setFormData((prev) => ({ ...prev, image: v }));
              setImagePreview(v);
            }}
            placeholder="https://images.unsplash.com/..."
            className="dark-input mb-2"
          />
        )}

        {imageMode === 'upload' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
            <div className="upload-placeholder mb-3" onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} />
              <span className="fw-semibold">Click to choose a file</span>
            </div>
          </>
        )}

        {imageMode === 'camera' && (
          <>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="d-none" onChange={handleFileChange} />
            <div className="upload-placeholder mb-3" onClick={() => cameraInputRef.current?.click()}>
              <Camera size={24} />
              <span className="fw-semibold">Tap to take a photo</span>
            </div>
          </>
        )}

        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-100 object-fit-cover border rounded-3 mt-2 border-secondary"
            style={{ height: '140px', borderColor: 'var(--border) !important' }}
          />
        ) : null}
      </div>

      <div className="d-flex align-items-center gap-2 mt-2">
        <label className="input-label mb-0">Publish Status</label>
        <label className="toggle-switch m-0 ms-2">
          <input type="checkbox" checked={formData.status} onChange={handleStatusChange} />
          <span className="toggle-switch-slider"></span>
        </label>
      </div>
    </form>
  );
};

export default AddMenu;
