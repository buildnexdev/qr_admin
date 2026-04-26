import React, { useEffect, useState, useMemo } from 'react';
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
  Trash2,
  Users,
  MapPin
} from 'lucide-react';
import type { RootState } from '../../store';
import { setBranches, setLoading, type Branch as BranchType } from '../../store/branchSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import './Branch.scss';
import { API_BASE_URL } from '../../router/const';

const isActive = (b: BranchType) => Boolean(b.status);

const Branch: React.FC = () => {
  const dispatch = useDispatch();
  const { branches, loading } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchType | null>(null);
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
      const res = await axios.get<BranchType[]>(`${API_BASE_URL}/branches`);
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

  const handleOpenOffcanvas = (branch?: BranchType) => {
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

  const toggleBranchStatus = async (branch: BranchType) => {
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

  const handleDelete = async (branch: BranchType) => {
    if (!window.confirm(`Delete branch "${branch.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/branches/${branch.id}`);
      await fetchBranches();
      triggerToast('Branch deleted', 'success', 'The branch was removed successfully.');
    } catch (err: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete branch'));
    }
  };

  const filteredData = useMemo(() => {
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  return (
    <div className="branch-page">
      {/* HEADER SECTION */}
      <div className="branch-header">
        <div className="header-title-area">
          <div className="title-wrap">
            <div className="icon-box">
              <Building2 size={22} />
            </div>
            <h1>
              <span>Branch</span> Management
            </h1>
          </div>
        </div>
        <hr />
        <div className="header-actions">
          <div className="search-input-wrap">
            <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search branches..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => handleOpenOffcanvas()} className="btn-add">
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-wrapper">
        <table className="branch-table">
          <thead className='prim'>
            <tr>
              <th className="col-sno">S.No</th>
              <th>Branch Info</th>
              <th>Location</th>
              <th>Manager</th>
              <th className="text-center">Staff</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-state">
                  <div className="heartbeat loader-icon"><Building2 size={32} /></div>
                  <p>Loading branches...</p>
                </td>
              </tr>
            ) : filteredData.length > 0 ? filteredData.map((branch, index) => (
              <tr key={branch.id} className="data-row">
                <td className="col-sno-val">{String(index + 1).padStart(2, '0')}</td>
                <td>
                  <div className="branch-info">
                    <span className="name">{branch.name}</span>
                    <span className="code">{branch.code}</span>
                  </div>
                </td>
                <td>
                  <div className="location-box">
                    <MapPin size={14} />
                    <span className="loc-text">{branch.location || 'Not Specified'}</span>
                  </div>
                </td>
                <td>
                  <span className="manager-text">{branch.manager || '—'}</span>
                </td>
                <td className="text-center">
                  <div className="staff-badge">
                    <Users size={14} />
                    {branch.staffCount ?? 0}
                  </div>
                </td>
                <td className="text-center">
                  <button
                    onClick={() => toggleBranchStatus(branch)}
                    className="status-btn"
                  >
                    <div className={`status-badge ${isActive(branch) ? 'active' : 'inactive'}`}>
                      <div className="dot" />
                      {isActive(branch) ? 'Active' : 'Inactive'}
                    </div>
                  </button>
                </td>
                <td>
                  <div className="actions-wrap">
                    <button onClick={() => handleOpenOffcanvas(branch)} className="action-btn edit" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(branch)} className="action-btn delete" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  <Building2 size={48} className="empty-icon" />
                  <h3>No Branches Found</h3>
                  <p>Try adjusting your search or add a new branch to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filteredData.length > 0 && (
        <div className="pagination-container">
          <div className="page-info">
            Showing <span>1</span> to <span>{filteredData.length}</span> of <span>{branches.length}</span> entries
          </div>
          <div className="pagination-controls">
            <button className="page-btn"><ChevronLeft size={18} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* OFFCANVAS MODAL */}
      {isOffcanvasOpen && (
        <>
          <div
            onClick={handleCloseOffcanvas}
            className="branch-offcanvas-backdrop"
          />
          <div className="branch-offcanvas-panel">
            <div className="offcanvas-header">
              <div className="header-title-wrap">
                <h2>
                  {editingBranch ? 'Edit' : 'Add'} <span>Branch</span>
                </h2>
                <p>Enter the details of the restaurant outlet.</p>
              </div>
              <button onClick={handleCloseOffcanvas} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="offcanvas-body">
              <div className="form-grid">
                <div className="input-group">
                  <label className="form-label">Branch Name *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Downtown" className="form-input" />
                </div>
                <div className="input-group">
                  <label className="form-label">Branch Code *</label>
                  <input name="code" value={formData.code} onChange={handleInputChange} type="text" placeholder="e.g. DT-01" className="form-input" />
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Location / Address</label>
                <textarea name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter full branch address" rows={3} className="form-input textarea" />
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label className="form-label">Pincode *</label>
                  <input name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" placeholder="6-digit code" className="form-input" />
                </div>
                <div className="input-group">
                  <label className="form-label">Contact Phone *</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Mobile number" className="form-input" />
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Branch Manager</label>
                <input name="manager" value={formData.manager} onChange={handleInputChange} type="text" placeholder="Full name of manager" className="form-input" />
              </div>

              <div className="status-toggle-section">
                <div className="status-info">
                  <span className="label">Active Status</span>
                  <span className="desc">Branch will be visible to customers.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.status} onChange={handleStatusChange} />
                  <span className="toggle-switch-slider" style={{ background: formData.status ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}></span>
                </label>
              </div>
            </div>

            <div className="offcanvas-footer">
              <button onClick={handleCloseOffcanvas} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-add btn-save">
                <Save size={18} /> {saving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Branch;
