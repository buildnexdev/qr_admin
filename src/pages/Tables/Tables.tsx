import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, PrinterIcon } from 'lucide-react';
import { Base64 } from 'js-base64';
import type { RootState } from '../../store';
import { setTables, setLoading } from '../../store/tableSlice';
import type { Table } from '../../store/tableSlice';
import Modal from '../../components/Modal';

const API_BASE_URL = 'http://localhost:5000/api';

/* ─── Floating food particles (subtle, fewer than login) ─── */
const FOOD_PARTICLES = [
  { emoji: '🍽️', size: 28, x: 3, y: 15, duration: 18, delay: 0 },
  { emoji: '🥢', size: 22, x: 95, y: 25, duration: 22, delay: 3 },
  { emoji: '🍜', size: 26, x: 96, y: 65, duration: 16, delay: 6 },
  { emoji: '🥗', size: 20, x: 2, y: 70, duration: 20, delay: 9 },
  { emoji: '🧆', size: 18, x: 50, y: 96, duration: 14, delay: 2 },
];

const Tables: React.FC = () => {
  const dispatch = useDispatch();
  const { tables, loading } = useSelector((state: RootState) => state.tables);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get(`${API_BASE_URL}/tables`);
      dispatch(setTables(res.data));
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
    dispatch(setLoading(false));
  };

  const handleSaveTables = async (updatedTables: Table[]) => {
    try {
      await axios.post(`${API_BASE_URL}/tables`, updatedTables);
      dispatch(setTables(updatedTables));
    } catch {
      showToast('Failed to save tables');
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName || !user) return;

    const tableDetails = { id: Date.now().toString(), name: newTableName };
    const payload = {
      userid: user.userid,
      companyid: user.companyid,
      table_details: tableDetails,
    };
    const encodedPayload = Base64.encode(JSON.stringify(payload));

    try {
      await axios.post(`${API_BASE_URL}/tables/add`, { data: encodedPayload });
      handleSaveTables([...tables, tableDetails]);
      setSuccessModalOpen(true);
    } catch (error) {
      console.warn('API /tables/add failed, falling back to /tables', error);
      handleSaveTables([...tables, tableDetails]);
      setSuccessModalOpen(true);
    }
    setNewTableName('');
    setIsModalOpen(false);
  };

  const deleteTable = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/tables/${id}`);
      dispatch(setTables(tables.filter((t: Table) => t.id !== id)));
      setDeleteSuccessModalOpen(true);
    } catch (error) {
      console.error('Error deleting table:', error);
      showToast('Failed to delete table');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Reset ────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Variables ────────────────────────────────────────── */
        /* Relying on global :root CSS variables in index.css */

        /* ── Page wrapper ─────────────────────────────────────── */
        .tables-page {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 0 0 60px;
        }

        /* Ambient background glow */
        .tables-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 55% 40% at 15% 20%, rgba(234,88,12,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 85% 80%, rgba(245,158,11,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Food particles ───────────────────────────────────── */
        .fp {
          position: fixed;
          user-select: none;
          pointer-events: none;
          animation: floatBob linear infinite;
          opacity: 0.3;
          z-index: 0;
          filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5));
        }
        @keyframes floatBob {
          0%   { transform: translateY(0px)   rotate(0deg);  }
          25%  { transform: translateY(-14px) rotate(5deg);  }
          50%  { transform: translateY(-6px)  rotate(-3deg); }
          75%  { transform: translateY(-18px) rotate(4deg);  }
          100% { transform: translateY(0px)   rotate(0deg);  }
        }

        /* ── Main content (above bg layer) ───────────────────── */
        .tables-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
        }

        /* ── Top toolbar ──────────────────────────────────────── */
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 36px 0 32px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 36px;
          animation: fadeUp 0.6s ease both;
        }

        .toolbar-left {}

        .toolbar-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          color: var(--amber);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .toolbar-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.1;
        }
        .toolbar-title em {
          font-style: italic;
          color: var(--amber-lt);
        }
        .toolbar-sub {
          font-size: 14px;
          color: var(--muted);
          margin-top: 6px;
        }

        /* Stat pill */
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(245,158,11,0.08);
          border: 1px solid var(--border);
          border-radius: 40px;
          padding: 6px 16px;
          font-size: 13px;
          color: var(--amber);
          font-weight: 500;
          margin-top: 14px;
        }
        .stat-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--ember);
          animation: dotPing 2s ease-in-out infinite;
        }
        @keyframes dotPing {
          0%,100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.7); }
          50%      { box-shadow: 0 0 0 7px rgba(234,88,12,0); }
        }

        /* ── Add button ───────────────────────────────────────── */
        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          height: 48px;
          padding: 0 22px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--ember) 0%, var(--amber) 100%);
          color: #1a0a00;
          box-shadow: 0 4px 20px rgba(245,158,11,0.25);
          transition: transform .15s, box-shadow .15s;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }
        .btn-add::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--amber) 0%, var(--amber-lt) 100%);
          opacity: 0;
          transition: opacity .2s;
        }
        .btn-add:hover::before { opacity: 1; }
        .btn-add:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(245,158,11,0.4); }
        .btn-add:active { transform: translateY(0); }
        .btn-add > * { position: relative; z-index: 1; }

        /* ── Loading ──────────────────────────────────────────── */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        .loading-bowl {
          font-size: 48px;
          animation: bowlSpin 2s ease-in-out infinite;
        }
        @keyframes bowlSpin {
          0%,100% { transform: scale(1) rotate(0deg); }
          50%      { transform: scale(1.1) rotate(10deg); }
        }
        .loading-text {
          font-size: 14px;
          color: var(--muted);
          letter-spacing: 0.06em;
        }

        /* ── Empty state ──────────────────────────────────────── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
          text-align: center;
          border: 1px dashed rgba(245,158,11,0.2);
          border-radius: 18px;
          background: rgba(245,158,11,0.03);
          animation: fadeUp 0.5s ease both;
        }
        .empty-icon { font-size: 52px; opacity: 0.5; }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--cream);
        }
        .empty-sub { font-size: 14px; color: var(--muted); max-width: 300px; }

        /* ── Tables grid ──────────────────────────────────────── */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* ── Table card ───────────────────────────────────────── */
        .table-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
          overflow: hidden;
        }
        /* Subtle ember corner glow */
        .table-card::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%);
          pointer-events: none;
          transition: opacity .2s;
          opacity: 0;
        }
        .table-card:hover::before { opacity: 1; }
        .table-card:hover {
          border-color: var(--border-h);
          background: var(--card-hov);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.1);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Card header */
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-icon-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .table-icon-wrap {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .table-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.2;
        }
        .btn-delete {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.08);
          color: rgba(239,68,68,0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s, color .15s, border-color .15s;
          flex-shrink: 0;
        }
        .btn-delete:hover {
          background: rgba(239,68,68,0.18);
          color: #ef4444;
          border-color: rgba(239,68,68,0.45);
        }

        /* QR area */
        .qr-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(245,158,11,0.1);
        }

        /* QR hint */
        .qr-hint {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          line-height: 1.6;
          letter-spacing: 0.01em;
        }

        /* Print button */
        .btn-print {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border-h);
          background: transparent;
          color: var(--amber);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background .15s, border-color .15s, box-shadow .15s;
          letter-spacing: 0.03em;
        }
        .btn-print:hover {
          background: rgba(245,158,11,0.08);
          border-color: var(--amber);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }

        /* ── Modal override ─────────────────────────────────── */
        .craving-modal-body { }

        .modal-label {
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--muted);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
        }
        .modal-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 12px;
          padding: 0 14px;
          height: 48px;
          transition: border-color .2s, box-shadow .2s;
          margin-bottom: 20px;
        }
        .modal-input-wrap:focus-within {
          border-color: rgba(245,158,11,0.5);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .modal-input-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #000;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
        }
        .modal-input-wrap input::placeholder { color: rgba(0,0,0,0.35); }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-cancel {
          height: 42px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .btn-cancel:hover { border-color: var(--border-h); color: var(--cream); }

        .btn-create {
          height: 42px;
          padding: 0 22px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--ember) 0%, var(--amber) 100%);
          color: #1a0a00;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: filter .15s, transform .15s;
          position: relative;
          overflow: hidden;
        }
        .btn-create:hover { filter: brightness(1.1); transform: translateY(-1px); }

        /* ── Utility animations ───────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Toast (top-right, errors only) ─────────────────── */
        .craving-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #1c1010;
          border: 1px solid rgba(239,68,68,0.3);
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fecaca;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 10000;
          animation: toastIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
          min-width: 260px;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="tables-page">
        {/* Floating food particles */}
        {FOOD_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="fp"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        <div className="tables-inner">
          {/* ── Toolbar ─────────────────────────────────────── */}
          <div className="toolbar">
            <div className="toolbar-left">
              <p className="toolbar-eyebrow">Craving Admin</p>
              <h1 className="toolbar-title">
                <em>Table</em> Management
              </h1>
              <p className="toolbar-sub">Manage your seating and QR codes for dine-in ordering.</p>
              <div className="stat-pill">
                <div className="stat-dot" />
                {tables.length} {tables.length === 1 ? 'table' : 'tables'} active
              </div>
            </div>
            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
              <Plus size={17} />
              Add New Table
            </button>
          </div>

          {/* ── Loading ─────────────────────────────────────── */}
          {loading && (
            <div className="loading-state">
              <span className="loading-bowl">🍽️</span>
              <p className="loading-text">Setting the tables…</p>
            </div>
          )}

          {/* ── Empty state ──────────────────────────────────── */}
          {!loading && tables.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🪑</span>
              <h2 className="empty-title">No tables yet</h2>
              <p className="empty-sub">
                Add your first table to generate a QR code for contactless ordering.
              </p>
              <button className="btn-add" style={{ marginTop: 8 }} onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                Add Your First Table
              </button>
            </div>
          )}

          {/* ── Tables grid ──────────────────────────────────── */}
          {!loading && tables.length > 0 && (
            <div className="tables-grid">
              {tables.map((table: Table, index: number) => (
                <div
                  key={table.id}
                  className="table-card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="card-header">
                    <div className="card-icon-name">
                      <div className="table-icon-wrap">🪑</div>
                      <span className="table-name">{table.name}</span>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => deleteTable(table.id)}
                      title="Delete table"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="qr-wrap">
                    <QRCodeSVG
                      value={`http://localhost:5174/?tableId=${table.id}`}
                      size={150}
                      level="H"
                      includeMargin={false}
                      fgColor="#18181B"
                    />
                  </div>

                  <p className="qr-hint">
                    Customers scan this to view the menu and order.
                  </p>

                  <button className="btn-print" onClick={() => window.print()}>
                    <PrinterIcon size={14} />
                    Print QR Label
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Add table modal ─────────────────────────────────── */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Table"
        >
          <div className="craving-modal-body">
            <form onSubmit={handleAddTable}>
              <label className="modal-label">Table Name or Number</label>
              <div className="modal-input-wrap">
                <span style={{ fontSize: 18 }}>🪑</span>
                <input
                  type="text"
                  placeholder="e.g. Terrace Table 4"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* ── Success Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          title="Success"
        >
          <div className="craving-modal-body" style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--cream)', fontSize: 24, marginBottom: 8 }}>Table Added</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 30 }}>Your new table has been successfully created and is ready for use.</p>
            <button
              className="btn-create"
              onClick={() => setSuccessModalOpen(false)}
              style={{ width: '100%', padding: '0', height: '48px' }}
            >
              Continue
            </button>
          </div>
        </Modal>

        {/* ── Delete Success Modal ───────────────────────────────── */}
        <Modal
          isOpen={deleteSuccessModalOpen}
          onClose={() => setDeleteSuccessModalOpen(false)}
          title="Deleted"
        >
          <div className="craving-modal-body" style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#18181b', fontSize: 24, marginBottom: 8 }}>Table Removed</h3>
            <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 30 }}>The table has been permanently deleted from your restaurant layout.</p>
            <button
              className="btn-create"
              onClick={() => setDeleteSuccessModalOpen(false)}
              style={{ width: '100%', padding: '0', height: '48px' }}
            >
              Got it
            </button>
          </div>
        </Modal>

        {/* ── Error Toast (top-right) ────────────────────────────── */}
        {toast && (
          <div className="craving-toast">
            ⚠️ {toast.message}
          </div>
        )}
      </div>
    </>
  );
};

export default Tables;
