import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  Trash2,
  PrinterIcon,
  UtensilsCrossed,
  Eye,
  Receipt,
  RefreshCw,
  Pencil,
  Armchair,
} from 'lucide-react';
import { setTables, setLoading } from '../../store/tableSlice';
import Modal from '../../components/Modal';
import { confirmAlert, triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  fetchTablesList,
  fetchTableDetail,
  fetchNextTableCode,
  createTable,
  updateTable,
  patchTableStatus,
  deleteTable,
  type TableListItem,
} from '../../api/tableApi';
import { fetchBranches } from '../../api/branchApi';
import './Tables.scss';

type Filter = 'all' | 'Available' | 'Occupied' | 'Reserved';

type BranchRow = { branchID: number; branchName: string; [k: string]: unknown };

function formatDuration(iso: string | null | undefined) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const ms = Date.now() - t;
  if (ms < 0) return '—';
  const m = Math.floor(ms / 60000);
  if (m < 1) return '<1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function menuPublicOrigin() {
  const v = import.meta.env.VITE_MENU_PUBLIC_URL as string | undefined;
  if (v) return v.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

const defaultForm = {
  name: '',
  tableCode: '',
  useAutoCode: true,
  capacity: 4,
  branchId: '' as string | number,
  floorSection: '',
  qrEnabled: true,
  selfOrdering: true,
  isActive: true,
  status: 'Available' as TableListItem['status'],
};

const Tables: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState<TableListItem[]>([]);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TableListItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchTableDetail>> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const [list, br] = await Promise.all([fetchTablesList(), fetchBranches().catch(() => [])]);
      setRows(list);
      setBranches(Array.isArray(br) ? (br as BranchRow[]) : []);
      dispatch(
        setTables(
          list.map((t) => ({
            id: String(t.id),
            name: t.name,
            status: t.status,
          }))
        )
      );
    } catch (e: unknown) {
      triggerToast('Tables', 'error', getApiErrorMessage(e, 'Failed to load tables'));
    }
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((t) => t.status === filter);
  }, [rows, filter]);

  const openAdd = async () => {
    setEditing(null);
    setForm({ ...defaultForm });
    try {
      const n = await fetchNextTableCode();
      setForm((f) => ({
        ...f,
        tableCode: String(n.nextCode),
        name: n.suggestedLabel,
      }));
    } catch {
      setForm(defaultForm);
    }
    setFormOpen(true);
  };

  const openEdit = (t: TableListItem) => {
    setEditing(t);
    setForm({
      name: t.name,
      tableCode: t.tableCode || '',
      useAutoCode: false,
      capacity: t.capacity,
      branchId: t.branchId ?? '',
      floorSection: t.floorSection || '',
      qrEnabled: t.qrEnabled,
      selfOrdering: t.selfOrdering,
      isActive: t.isActive,
      status: t.status,
    });
    setFormOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      triggerToast('Validation', 'error', 'Table name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        table_code: form.tableCode.trim() || null,
        capacity: Number(form.capacity) || 4,
        branch_id: form.branchId === '' ? null : Number(form.branchId),
        floor_section: form.floorSection.trim() || null,
        qr_enabled: form.qrEnabled,
        self_ordering: form.selfOrdering,
        is_active: form.isActive,
        status: form.status,
      };
      if (editing) {
        await updateTable(editing.id, payload);
        triggerToast('Saved', 'success', 'Table updated');
      } else {
        await createTable(payload);
        triggerToast('Created', 'success', 'Table added');
      }
      setFormOpen(false);
      await load();
    } catch (err: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Could not save table'));
    }
    setSaving(false);
  };

  const handleDelete = async (t: TableListItem) => {
    const { isConfirmed } = await confirmAlert(
      'Remove table?',
      `Delete "${t.name}"? This cannot be undone.`
    );
    if (!isConfirmed) return;
    try {
      await deleteTable(t.id);
      triggerToast('Removed', 'success', 'Table deleted');
      await load();
    } catch (err: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Could not delete'));
    }
  };

  const changeStatus = async (t: TableListItem, status: TableListItem['status']) => {
    try {
      await patchTableStatus(t.id, status);
      await load();
    } catch (err: unknown) {
      triggerToast('Status', 'error', getApiErrorMessage(err, 'Could not update status'));
    }
  };

  const openDetail = async (id: number) => {
    try {
      const d = await fetchTableDetail(id);
      setDetail(d);
      setDetailOpen(true);
    } catch (err: unknown) {
      triggerToast('Detail', 'error', getApiErrorMessage(err, 'Could not load table'));
    }
  };

  const qrValue = (tableId: number) =>
    `${menuPublicOrigin()}/?tableId=${encodeURIComponent(String(tableId))}`;

  const statusBar = (s: TableListItem['status']) => {
    if (s === 'Occupied') return 'occ';
    if (s === 'Reserved') return 'res';
    return 'avail';
  };

  const statusLabel = (s: TableListItem['status']) => {
    if (s === 'Occupied') return 'Occupied';
    if (s === 'Reserved') return 'Reserved';
    return 'Available';
  };

  return (
    <div className="tables-mgmt">
      <div className="tables-mgmt__toolbar">
        <div className="tables-mgmt__toolbar-main">
          <h1 className="tables-mgmt__title">
            <em>Table</em> Management
          </h1>
          <p className="tables-mgmt__sub">
            Manage seating, QR codes, and live order totals for dine-in.
          </p>
          <div className="tables-mgmt__stat">
            <span className="tables-mgmt__stat-dot" />
            {rows.length} {rows.length === 1 ? 'table' : 'tables'} active
          </div>
        </div>
        <button
          type="button"
          className="btn-premium tables-mgmt__toolbar-action d-inline-flex align-items-center gap-2 px-3"
          onClick={() => void openAdd()}
        >
          <Plus size={18} /> Add New Table
        </button>
      </div>

      <div className="tables-mgmt__filters">
        {(['all', 'Available', 'Occupied', 'Reserved'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`tables-mgmt__filter-btn${filter === f ? ' tables-mgmt__filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All tables' : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && rows.length === 0 && (
        <div className="tables-mgmt__empty">
          <div className="tables-mgmt__empty-icon">🪑</div>
          <h2 className="tables-mgmt__empty-title">No tables yet</h2>
          <p className="tables-mgmt__empty-sub">Add a table to generate QR codes and track orders.</p>
          <button type="button" className="btn-premium d-inline-flex align-items-center gap-2 px-3" style={{ height: 40 }} onClick={() => void openAdd()}>
            <Plus size={18} /> Add Your First Table
          </button>
        </div>
      )}

      {filtered.length === 0 && rows.length > 0 && (
        <div className="tables-mgmt__empty">
          <p className="tables-mgmt__empty-sub mb-0">No tables match this filter.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="tables-mgmt__grid">
          {filtered.map((t) => (
            <div key={t.id} className={`tables-card${t.isActive ? '' : ' tables-card--inactive'}`}>
              <div className={`tables-card__bar tables-card__bar--${statusBar(t.status)}`} />
              <div className="tables-card__head">
                <div>
                  <h3 className="tables-card__name">{t.name}</h3>
                  <div className="tables-card__meta">
                    {t.tableCode ? <>Code {t.tableCode}</> : 'No code'} · {t.capacity} seats
                    {t.floorSection ? <> · {t.floorSection}</> : null}
                  </div>
                </div>
                <span className={`tables-card__badge tables-card__badge--${statusBar(t.status)}`}>{statusLabel(t.status)}</span>
              </div>

              <div className="tables-card__stats">
                <div>
                  <span className="tables-card__stat-label">Order total</span>
                  <span className="tables-card__stat-val">
                    {t.currentOrderTotal > 0 ? `₹ ${Number(t.currentOrderTotal).toFixed(2)}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="tables-card__stat-label">Active since</span>
                  <span className="tables-card__stat-val">{formatDuration(t.sessionStartedAt)}</span>
                </div>
              </div>

              {t.qrEnabled && (
                <div className="tables-card__qr">
                  <QRCodeSVG value={qrValue(t.id)} size={112} level="H" includeMargin={false} fgColor="#0f172a" />
                </div>
              )}

              <div className="tables-card__actions">
                <button
                  type="button"
                  className="tables-card__btn tables-card__btn--primary"
                  onClick={() => navigate(`/admin/orders`, { state: { highlightTableId: t.id } })}
                  title="Open orders"
                >
                  <UtensilsCrossed size={14} /> Order
                </button>
                <button type="button" className="tables-card__btn" onClick={() => void openDetail(t.id)}>
                  <Eye size={14} /> View
                </button>
                <button
                  type="button"
                  className="tables-card__btn"
                  onClick={() => navigate('/admin/bills', { state: { tableId: t.id } })}
                >
                  <Receipt size={14} /> Bill
                </button>
                <button type="button" className="tables-card__btn" onClick={() => openEdit(t)}>
                  <Pencil size={14} /> Edit
                </button>
                <select
                  className="tables-card__select"
                  aria-label="Change status"
                  value={t.status}
                  onChange={(e) => void changeStatus(t, e.target.value as TableListItem['status'])}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
                <button type="button" className="tables-card__btn tables-card__btn--danger" onClick={() => void handleDelete(t)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              <div className="tables-card__actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                <button type="button" className="tables-card__btn" onClick={() => window.print()} title="Print QR">
                  <PrinterIcon size={14} /> Print QR
                </button>
                <button type="button" className="tables-card__btn" disabled title="Coming soon">
                  <RefreshCw size={14} /> Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Table' : 'Add New Table'}>
        <form onSubmit={(e) => void submitForm(e)} className="d-flex flex-column gap-3">
          <div className="input-group d-flex flex-column gap-1">
            <label className="input-label">Table name *</label>
            <input
              className="dark-input"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              placeholder="e.g. T1"
            />
          </div>
          <div className="tables-form-grid">
            <div className="input-group d-flex flex-column gap-1">
              <label className="input-label">Table code</label>
              <input
                className="dark-input"
                value={form.tableCode}
                onChange={(e) => setForm((s) => ({ ...s, tableCode: e.target.value, useAutoCode: false }))}
                placeholder="Auto"
              />
            </div>
            <div className="input-group d-flex flex-column gap-1">
              <label className="input-label">Capacity *</label>
              <input
                type="number"
                min={1}
                className="dark-input"
                value={form.capacity}
                onChange={(e) => setForm((s) => ({ ...s, capacity: Number(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <div className="tables-form-grid">
            <div className="input-group d-flex flex-column gap-1">
              <label className="input-label">Branch</label>
              <select
                className="dark-input dark-select"
                value={form.branchId === '' ? '' : String(form.branchId)}
                onChange={(e) =>
                  setForm((s) => ({ ...s, branchId: e.target.value === '' ? '' : Number(e.target.value) }))
                }
              >
                <option value="">— Select branch —</option>
                {branches.map((b) => (
                  <option key={b.branchID} value={b.branchID}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group d-flex flex-column gap-1">
              <label className="input-label">Floor / section</label>
              <input
                className="dark-input"
                value={form.floorSection}
                onChange={(e) => setForm((s) => ({ ...s, floorSection: e.target.value }))}
                placeholder="Ground floor, Patio…"
              />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <label className="d-flex align-items-center gap-2 small">
              <input
                type="checkbox"
                checked={form.qrEnabled}
                onChange={(e) => setForm((s) => ({ ...s, qrEnabled: e.target.checked }))}
              />
              QR enabled
            </label>
            <label className="d-flex align-items-center gap-2 small">
              <input
                type="checkbox"
                checked={form.selfOrdering}
                onChange={(e) => setForm((s) => ({ ...s, selfOrdering: e.target.checked }))}
              />
              Self-ordering
            </label>
            <label className="d-flex align-items-center gap-2 small">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>
          <div className="input-group d-flex flex-column gap-1">
            <label className="input-label">Default status</label>
            <select
              className="dark-input dark-select"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value as TableListItem['status'] }))
              }
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-2">
            <button type="button" className="btn-cancel" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-premium px-4" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create table'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Table details">
        {detail && (
          <div className="d-flex flex-column gap-3">
            <div>
              <strong>{detail.name}</strong>
              <div className="small text-muted">
                Code {detail.tableCode || '—'} · {detail.capacity} seats · {detail.status}
              </div>
              {detail.floorSection ? <div className="small">{detail.floorSection}</div> : null}
            </div>
            <div>
              <div className="small text-uppercase text-muted mb-1">Open orders total</div>
              <div className="fs-5 fw-bold">₹ {Number(detail.openTotal).toFixed(2)}</div>
              <div className="small text-muted">Session since {formatDuration(detail.sessionStart)}</div>
            </div>
            <div>
              <div className="small text-uppercase text-muted mb-2">Orders</div>
              <ul className="tables-detail-list">
                {detail.orders.length === 0 ? (
                  <li className="text-muted border-0">No orders for this table.</li>
                ) : (
                  detail.orders.map((o) => (
                    <li key={o.id}>
                      <span>
                        #{o.id} · {o.status}
                      </span>
                      <span className="fw-semibold">₹ {Number(o.total).toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <button type="button" className="btn-premium w-100" onClick={() => navigate('/admin/orders', { state: { highlightTableId: detail.id } })}>
              <Armchair size={18} className="me-2" /> Go to orders
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tables;
