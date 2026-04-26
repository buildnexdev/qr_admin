import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Package, AlertTriangle, ArrowUpCircle, Edit2, Trash2, Save, Loader2, X } from 'lucide-react';
import type { RootState } from '../../store';
import { setStockItems, setStockLoading, type StockItem } from '../../store/stockSlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { API_BASE_URL } from '../../router/const';

const CATEGORY_PRESETS = [
  'Vegetables',
  'Groceries',
  'Dairy',
  'Meat',
  'Seafood',
  'Pantry',
  'Beverages',
  'Spices',
  'General',
];

const Stocks: React.FC = () => {
  const dispatch = useDispatch();
  const { items: stocks, loading } = useSelector((state: RootState) => state.stocks);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '0',
    unit: 'kg',
    minThreshold: '0',
    lastRestocked: '',
    notes: '',
  });

  const fetchStocks = async () => {
    dispatch(setStockLoading(true));
    try {
      const res = await axios.get<StockItem[]>(`${API_BASE_URL}/stocks`);
      dispatch(setStockItems(res.data));
    } catch (err) {
      console.error(err);
      triggerToast('Could not load stock', 'error', getApiErrorMessage(err, 'Failed to load inventory'));
    }
    dispatch(setStockLoading(false));
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const openModal = (row?: StockItem) => {
    if (row) {
      setEditing(row);
      setForm({
        name: row.name,
        category: row.category || 'General',
        quantity: String(row.quantity),
        unit: row.unit || 'kg',
        minThreshold: String(row.minThreshold),
        lastRestocked: row.lastRestocked || '',
        notes: row.notes || '',
      });
    } else {
      setEditing(null);
      setForm({
        name: '',
        category: 'Vegetables',
        quantity: '0',
        unit: 'kg',
        minThreshold: '0',
        lastRestocked: '',
        notes: '',
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveItem = async () => {
    if (!form.name.trim()) {
      triggerToast('Validation', 'error', 'Item name is required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim() || 'kg',
      minThreshold: Number(form.minThreshold) || 0,
      lastRestocked: form.lastRestocked.trim() || null,
      notes: form.notes.trim(),
    };
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API_BASE_URL}/stocks/${editing.id}`, payload);
        triggerToast('Updated', 'success', 'Stock item saved.');
      } else {
        await axios.post(`${API_BASE_URL}/stocks`, payload);
        triggerToast('Added', 'success', 'New stock item created.');
      }
      await fetchStocks();
      closeModal();
    } catch (err) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Could not save item'));
    }
    setSaving(false);
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Delete this stock item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/stocks/${id}`);
      await fetchStocks();
      triggerToast('Deleted', 'success', 'Item removed.');
    } catch (err) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Could not delete'));
    }
  };

  const markRestocked = async (row: StockItem) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await axios.put(`${API_BASE_URL}/stocks/${row.id}`, {
        name: row.name,
        category: row.category,
        quantity: row.quantity,
        unit: row.unit,
        minThreshold: row.minThreshold,
        lastRestocked: today,
        notes: row.notes,
      });
      await fetchStocks();
      triggerToast('Recorded', 'success', `Restock date set to ${today} for ${row.name}.`);
    } catch (err) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Could not update'));
    }
  };

  const filteredStocks = stocks.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: 'Item',
      render: (row: StockItem) => <span className="fw-bold text-white">{row.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: StockItem) => <span className="text-muted">{row.category}</span>,
    },
    {
      key: 'qty',
      header: 'Stock level',
      align: 'center' as const,
      render: (row: StockItem) => {
        const isLow = row.quantity <= row.minThreshold;
        return (
          <div className="d-flex align-items-center justify-content-center gap-2">
            <span style={{ color: isLow ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '15px' }}>
              {row.quantity} {row.unit}
            </span>
            {isLow && <AlertTriangle size={14} color="#EF4444" />}
          </div>
        );
      },
    },
    {
      key: 'threshold',
      header: 'Min threshold',
      align: 'center' as const,
      render: (row: StockItem) => `${row.minThreshold} ${row.unit}`,
    },
    {
      key: 'lastRestocked',
      header: 'Last restocked',
      render: (row: StockItem) => row.lastRestocked || '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as const,
      render: (row: StockItem) => (
        <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => markRestocked(row)}
            className="btn btn-sm btn-outline-warning border-0 d-flex align-items-center gap-1"
            title="Set last restocked to today"
          >
            <ArrowUpCircle size={15} /> Restock
          </button>
          <button
            type="button"
            onClick={() => openModal(row)}
            className="btn btn-sm btn-outline-light border-0 d-flex align-items-center gap-1"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={() => deleteItem(row.id)}
            className="btn btn-sm btn-outline-danger border-0 d-flex align-items-center gap-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex flex-column h-100">
      <CommonHeader
        title="Inventory Stocks"
        icon={Package}
        searchPlaceholder="Search groceries, vegetables, category…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => openModal()}
        addButtonLabel="Add item"
      />

      <div className="flex-grow-1 px-2 py-3 px-md-4 py-md-4" style={{ overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center text-muted py-5">Loading stock data…</div>
        ) : (
          <div
            className="bg-dark rounded-4 p-2 shadow-sm border"
            style={{ borderColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <CommonTable
              columns={columns}
              data={filteredStocks}
              emptyMessage="No stock items yet. Add groceries, vegetables, and other inventory."
            />
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          role="presentation"
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14, 11, 8, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100vw)',
          maxWidth: '100%',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 1050,
          transform: modalOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: modalOpen ? 'auto' : 'none',
        }}
        aria-hidden={!modalOpen}
      >
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--cream)',
            }}
          >
            {editing ? 'Edit stock item' : 'Add stock item'}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: 'none',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--amber)',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Name *
            </label>
            <input
              className="dark-input w-100"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Tomatoes, Basmati rice"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Category
            </label>
            <input
              className="dark-input w-100"
              list="stock-category-presets"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Vegetables, Groceries, custom…"
            />
            <datalist id="stock-category-presets">
              {CATEGORY_PRESETS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min={0}
                className="dark-input w-100"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                Unit
              </label>
              <input
                className="dark-input w-100"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="kg, L, pcs"
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Min threshold (low-stock alert)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              className="dark-input w-100"
              value={form.minThreshold}
              onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Last restocked
            </label>
            <input
              type="date"
              className="dark-input w-100"
              style={{ colorScheme: 'dark' }}
              value={form.lastRestocked}
              onChange={(e) => setForm((f) => ({ ...f, lastRestocked: e.target.value }))}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              Notes
            </label>
            <textarea
              className="dark-input w-100"
              rows={3}
              style={{ resize: 'vertical', minHeight: 72 }}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Supplier, batch, storage…"
            />
          </div>
        </div>

        <div
          style={{
            padding: '20px 28px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 12,
            flexShrink: 0,
            background: 'var(--surface)',
          }}
        >
          <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={closeModal}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-premium btn-save d-flex align-items-center justify-content-center gap-2"
            style={{ flex: 2 }}
            onClick={() => void saveItem()}
            disabled={saving}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
