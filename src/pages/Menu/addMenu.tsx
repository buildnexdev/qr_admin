import React, { useState, useEffect, useRef } from 'react';
import { Link, Upload, Camera } from 'lucide-react';

interface AddMenuProps {
  initialData?: any;
  onSave: (data: any) => void;
}

type ImageMode = 'link' | 'upload' | 'camera';
const CATEGORIES = ['Starters', 'Main', 'Beverages', 'Desserts', 'Sides', 'Specials'];

const AddMenu: React.FC<AddMenuProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main',
    rate: '', // Support for user requested rate field
    description: '',
    image: '',
    status: true
  });

  const [imageMode, setImageMode] = useState<ImageMode>('link');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || 'Main',
        rate: initialData.rate?.toString() || '',
        description: initialData.description || '',
        image: initialData.image || '',
        status: initialData.status !== undefined ? initialData.status : true
      });
      setImagePreview(initialData.image || '');
      setImageMode('link');
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, price: parseFloat(formData.price) || 0, rate: parseFloat(formData.rate) || 0 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form id="menu-form" onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Menu Name *</label>
        <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Grilled Salmon" className="dark-input" required />
      </div>

      <div className="d-flex w-100 gap-3">
        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Category *</label>
          <select name="category" value={formData.category} onChange={handleInputChange} className="dark-input dark-select">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Price (₹) *</label>
          <input name="price" value={formData.price} onChange={handleInputChange} type="number" step="0.01" min="0" placeholder="0.00" className="dark-input" required />
        </div>
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Rating (Optional)</label>
        <input name="rate" value={formData.rate} onChange={handleInputChange} type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" className="dark-input" />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Description</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Tell the story of this dish..." rows={3} className="dark-input" />
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
            onChange={e => {
              setFormData({ ...formData, image: e.target.value });
              setImagePreview(e.target.value);
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

        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="w-100 object-fit-cover border rounded-3 mt-2 border-secondary" style={{ height: '140px', borderColor: 'var(--border) !important' }} />
        )}
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
