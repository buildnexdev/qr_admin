import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tags, Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  setCategoryActive,
  deleteCategory,
  type MenuCategory,
} from '../../store/categorySlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { fetchNextCategoryCode } from '../../api/categoryApi';
import './Categories.scss';

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories: categoryData, loading, error } = useSelector((state: RootState) => state.categories);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  /** Next DB code for “Add” only — matches GET .../categories/next-code (same as create). */
  const [nextCodePreview, setNextCodePreview] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen || editingCategory) return;
    let cancelled = false;
    setNextCodePreview(null);
    void fetchNextCategoryCode()
      .then((r) => {
        if (!cancelled) setNextCodePreview(r.nextCode);
      })
      .catch(() => {
        if (!cancelled) setNextCodePreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isModalOpen, editingCategory]);

  const handleOpenModal = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNextCodePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      triggerToast('Validation', 'error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await dispatch(
          updateCategory({
            id: editingCategory.id,
            payload: {
              name: formData.name.trim(),
              description: formData.description.trim(),
            },
          })
        ).unwrap();
        triggerToast('Category updated', 'success', 'Your changes were saved.');
      } else {
        await dispatch(
          addCategory({
            name: formData.name.trim(),
            description: formData.description.trim(),
          })
        ).unwrap();
        triggerToast('Category added', 'success', 'The new category was created.');
      }
      handleCloseModal();
    } catch (e: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(e, 'Could not save category'));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      triggerToast('Category deleted', 'success', 'The category was removed.');
    } catch (e: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(e, 'Could not delete category'));
    }
  };

  const handleToggleActive = async (cat: MenuCategory) => {
    try {
      await dispatch(setCategoryActive({ id: cat.id, isActive: !cat.status })).unwrap();
    } catch (e: unknown) {
      triggerToast('Status', 'error', getApiErrorMessage(e, 'Could not update active status'));
    }
  };

  const filteredData = categoryData.filter((cat) => {
    const q = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.description || '').toLowerCase().includes(q) ||
      String(cat.code ?? '').includes(q)
    );
  });

  return (
    <div className="categories-page page-container">
      <header className="categories-page__header app-header">
        <div className="categories-page__header-left">
          <div className="categories-page__icon-wrap">
            <Tags size={18} />
          </div>
          <div className="categories-page__title-block">
            <h2 className="categories-page__title">
              <em className="categories-page__title-em">Category</em> Management
            </h2>
          </div>
        </div>

        <div className="categories-page__header-right header-right">
          <div className="categories-page__search-wrap">
            <Search size={16} className="categories-page__search-icon" />
            <input
              type="text"
              placeholder="Search by code, name…"
              className="categories-page__search-input dark-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="btn-add" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Category
          </button>
        </div>
      </header>

      {error && <div className="categories-page__error-banner">{error}</div>}

      <div className="categories-page__scroll">
        <div className="categories-page__card-grid">
          {loading ? (
            <div className="categories-page__state-msg">Loading categories…</div>
          ) : filteredData.length > 0 ? (
            filteredData.map((cat) => (
              <div key={cat.id} className="categories-page__cat-card">
                <div className="categories-page__cat-body">
                  <div className="categories-page__cat-head">
                    <div className="categories-page__cat-code">
                      CODE {cat.code != null ? String(cat.code).padStart(3, '0') : '—'}
                    </div>
                    <h3 className="categories-page__cat-name">{cat.name}</h3>
                    <div className="categories-page__active-row">
                      <span className="categories-page__active-label">Active</span>
                      <label className="toggle-switch categories-page__toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(cat.status)}
                          onChange={() => void handleToggleActive(cat)}
                        />
                        <span
                          className={`toggle-switch-slider categories-page__toggle-slider${cat.status ? ' categories-page__toggle-slider--on' : ''}`}
                        />
                      </label>
                    </div>
                  </div>

                  <p className="categories-page__cat-desc">{cat.description || 'No description.'}</p>

                  {!cat.status && <span className="categories-page__inactive-pill">Inactive</span>}
                </div>

                <div className="categories-page__cat-actions">
                  <button type="button" className="categories-page__btn-edit" onClick={() => handleOpenModal(cat)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button type="button" className="categories-page__btn-delete" onClick={() => void handleDelete(cat.id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="categories-page__state-msg categories-page__state-msg--empty">No categories found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div role="presentation" className="categories-page__backdrop" onClick={handleCloseModal} />
      )}

      <div className={`categories-page__panel${isModalOpen ? ' categories-page__panel--open' : ''}`}>
        <div className="categories-page__panel-head">
          <h2 className="categories-page__panel-title">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button type="button" className="categories-page__btn-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>

        <div className="categories-page__panel-body">
          <div className="input-group">
            <label className="categories-page__field-label" htmlFor="cat-field-code">
              Code
            </label>
            <input
              id="cat-field-code"
              type="text"
              disabled
              value={
                editingCategory
                  ? String(editingCategory.code).padStart(3, '0')
                  : nextCodePreview != null
                    ? String(nextCodePreview).padStart(3, '0')
                    : '…'
              }
              className="dark-input"
            />
          </div>

          <div className="input-group">
            <label className="categories-page__field-label" htmlFor="cat-field-name">
              Name *
            </label>
            <input
              id="cat-field-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="e.g. Starters"
              className="dark-input"
            />
          </div>

          <div className="input-group">
            <label className="categories-page__field-label" htmlFor="cat-field-desc">
              Description
            </label>
            <textarea
              id="cat-field-desc"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief details about the category…"
              rows={4}
              className="dark-input categories-page__textarea"
            />
          </div>
        </div>

        <div className="categories-page__panel-footer">
          <button type="button" className="categories-page__btn-cancel" onClick={handleCloseModal}>
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="btn-add categories-page__btn-submit"
          >
            <Save size={18} /> {saving ? 'Saving…' : editingCategory ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
