import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Building2,
  Search,
  Plus,
  Edit3,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Trash2
} from 'lucide-react';
import type { RootState } from '../../store';
import { setBranches, setLoading, type Branch } from '../../store/branchSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';

const API_BASE_URL = 'http://localhost:5000/api';

const isActive = (b: Branch) => Boolean(b.status);

const Branch: React.FC = () => {
  const dispatch = useDispatch();
  const { branches, loading } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    pincode: '',
    manager: '',
    phone: '',
    status: true
  });

  const fetchBranches = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get<Branch[]>(`${API_BASE_URL}/branches`);
      dispatch(setBranches(res.data));
    } catch (error) {
      console.error('Error fetching branches:', error);
      triggerToast('Could not load branches', 'error', getApiErrorMessage(error, 'Failed to load branches'));
    }
    dispatch(setLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenOffcanvas = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || '',
        code: branch.code || '',
        location: branch.location || '',
        pincode: branch.pincode || '',
        manager: branch.manager || '',
        phone: branch.phone || '',
        status: isActive(branch)
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '', code: '', location: '', pincode: '', manager: '', phone: '', status: true
      });
    }
    setIsOffcanvasOpen(true);
  };

  const handleCloseOffcanvas = () => setIsOffcanvasOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.checked }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      triggerToast('Validation', 'error', 'Branch name and code are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        location: formData.location.trim() || null,
        pincode: formData.pincode.trim() || null,
        manager: formData.manager.trim() || null,
        phone: formData.phone.trim() || null,
        status: formData.status
      };
      if (editingBranch) {
        await axios.put(`${API_BASE_URL}/branches/${editingBranch.id}`, payload);
        triggerToast('Branch updated', 'success', 'Changes were saved successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/branches`, payload);
        triggerToast('Branch added', 'success', 'The new branch was created successfully.');
      }
      await fetchBranches();
      handleCloseOffcanvas();
    } catch (err: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Failed to save branch'));
    }
    setSaving(false);
  };

  const toggleBranchStatus = async (branch: Branch) => {
    try {
      await axios.put(`${API_BASE_URL}/branches/${branch.id}`, {
        name: branch.name,
        code: branch.code,
        location: branch.location,
        pincode: branch.pincode,
        manager: branch.manager,
        phone: branch.phone,
        status: !isActive(branch)
      });
      await fetchBranches();
      triggerToast('Status updated', 'success', 'Branch active status was saved.');
    } catch (err: unknown) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!window.confirm(`Delete branch "${branch.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/branches/${branch.id}`);
      await fetchBranches();
      triggerToast('Branch deleted', 'success', 'The branch was removed successfully.');
    } catch (err: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete branch'));
    }
  };

  const filteredData = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container" style={{
      animation: 'modalContentIn 0.5s ease-out',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--cream)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
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

        .dark-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(245,158,11,0.15);
          background: rgba(255,255,255,0.03);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .dark-input:focus {
          border-color: rgba(245,158,11,0.5);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .dark-input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .premium-dark-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .premium-dark-table th {
          background: var(--surface);
          padding: 18px 24px;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .premium-dark-table td {
          padding: 16px 24px;
          vertical-align: middle;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
          color: var(--cream);
          background: var(--card);
          transition: background 0.2s;
        }
        .premium-dark-table tr:hover td {
          background: var(--card-hov);
        }
      `}</style>
      
      {/* GLOBAL HEADER SECTION */}
      <header className="app-header" style={{
        padding: '12px 24px',
        background: 'transparent',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Left Side: Title & Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'rgba(245,158,11,0.1)', 
            color: 'var(--amber)', 
            border: '1px solid rgba(245,158,11,0.18)',
            width: '42px', height: '42px', 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Building2 size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--cream)', lineHeight: 1.1 }}>
              <em style={{ fontStyle: 'italic', color: 'var(--amber-lt)' }}>Branch</em> Management
            </h2>
          </div>
        </div>

        {/* Global/Local Search Bar */}
        <div className="header-search" style={{ flex: 1, maxWidth: '450px', margin: '0 40px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search branch by name, code or location..."
              className="dark-input"
              style={{ paddingLeft: '44px', height: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side: Add Button */}
        <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => handleOpenOffcanvas()} className="btn-add">
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </header>

      {/* BODY SECTION (Scrollable Table Body) */}
      <div style={{ padding: '0', background: 'transparent', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="table-container table-wrapper" style={{ width: '100%', borderRadius: '0', borderBottom: '1px solid var(--border)' }}>
          <table className="premium-dark-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr className='text-nowrap'>
                <th style={{ paddingLeft: '32px' }}>S.No</th>
                <th>Branch Name</th>
                <th>Location</th>
                <th style={{ textAlign: 'center' }}>No of Staff</th>
                <th style={{ textAlign: 'center' }}>Edit</th>
                <th style={{ textAlign: 'center' }}>Delete</th>
                <th style={{ textAlign: 'center' }}>Publish</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ background: 'var(--card)', textAlign: 'center', padding: '40px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Loading branches…</td>
                </tr>
              ) : filteredData.length > 0 ? filteredData.map((branch, index) => (
                <tr key={branch.id}>
                  <td style={{ paddingLeft: '32px', fontWeight: 600, color: 'var(--muted)' }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{branch.name}</td>
                  <td><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{branch.location || '—'}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--amber-lt)' }}>{branch.staffCount ?? 0}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleOpenOffcanvas(branch)} style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', margin: '0 auto' }} onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.borderColor = 'var(--amber)'; }} onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}>
                      <Edit3 size={16} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" onClick={() => handleDelete(branch)} style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', margin: '0 auto' }} title="Delete branch">
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <label className="toggle-switch" style={{ margin: '0 auto' }}>
                      <input type="checkbox" checked={isActive(branch)} onChange={() => toggleBranchStatus(branch)} />
                      <span className="toggle-switch-slider" style={{ background: isActive(branch) ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}></span>
                    </label>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ background: 'var(--card)', textAlign: 'center', padding: '40px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>No branches found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination" style={{ padding: '20px 32px', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="page-info" style={{ fontWeight: 600, color: 'var(--muted)' }}>Showing 1 to {filteredData.length} of {branches.length} entries</div>
            <div className="page-controls" style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--cream)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
              <button style={{ background: 'var(--amber)', color: '#000', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>1</button>
              <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--cream)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* OFFCANVAS BACKDROP */}
      {isOffcanvasOpen && (
        <div 
          onClick={handleCloseOffcanvas}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(14, 11, 8, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1040, transition: 'all 0.3s ease'
          }} 
        />
      )}

      {/* OFFCANVAS PANEL */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', maxWidth: '100%', 
        background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 1050,
        transform: isOffcanvasOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
          <button onClick={handleCloseOffcanvas} style={{ background: 'rgba(245,158,11,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--amber)', transition: 'background 0.2s' }} onMouseOver={(e: any) => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'} onMouseOut={(e: any) => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Branch Name *</label>
            <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Enter branch name" className="dark-input" />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Branch Code *</label>
            <input name="code" value={formData.code} onChange={handleInputChange} type="text" placeholder="e.g. BR-001" className="dark-input" />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Location / Address</label>
            <textarea name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter full address" rows={2} className="dark-input" style={{ resize: 'vertical' }} />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Pincode *</label>
            <input name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" placeholder="e.g. 600001" className="dark-input" />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Manager Name</label>
            <input name="manager" value={formData.manager} onChange={handleInputChange} type="text" placeholder="Enter manager name" className="dark-input" />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Contact Phone *</label>
            <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="e.g. 9876543210" className="dark-input" />
          </div>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)' }}>Active Status</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={formData.status} onChange={handleStatusChange} />
              <span className="toggle-switch-slider" style={{ background: formData.status ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}></span>
            </label>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', background: 'var(--surface)' }}>
          <button 
            onClick={handleCloseOffcanvas} 
            style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
            onMouseOver={(e: any) => { e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.color = 'var(--cream)'; }} 
            onMouseOut={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }} 
          >
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSave} className="btn-add" style={{ flex: 2, height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 0, opacity: saving ? 0.7 : 1 }}>
            <Save size={18} /> {saving ? 'Saving…' : editingBranch ? 'Save Changes' : 'Add Branch'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default Branch;
