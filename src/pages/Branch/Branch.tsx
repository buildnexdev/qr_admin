import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Building2, Edit3, X, Trash2, MapPin,
  Loader2, Eye, Calendar, FilePlus
} from 'lucide-react';
import type { RootState } from '../../store';
import { setBranches, setLoading } from '../../store/branchSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import './Branch.scss';
import { API_BASE_URL } from '../../router/const';

const EMPTY_FORM = {
  branchName: '', branchCode: '', branchType: 'Restaurant', description: '',
  address1: '', address2: '', area: '', city: '', state: '', pincode: '', landmark: '', latitude: '', longitude: '',
  country: 'India',
  startDate: '',
  postOffice: '',
  doorNo: '',
  isSubBranch: false,
  isHeadOffice: false,
  phone: '', alternateNumber: '', email: '', whatsappNumber: '',
  managerName: '', managerMobile: '', managerEmail: '', managerUser: '',
  orderSettings: { dineIn: true, takeaway: true, delivery: true },
  kitchenSettings: { displayEnabled: true, multipleSections: false },
  billingSettings: { taxType: 'Exclusive', gstPercent: '5', serviceCharge: '0' },
  paymentSetup: { cashEnabled: true, upiEnabled: true, razorpayKeys: '', autoConfirm: false },
  branding: { logo: '', prefix: 'INV', themeColor: '#000000' },
  workingHours: { openTime: '09:00', closeTime: '23:00', weeklyOff: 'None' },
  allowOnlineOrders: true, allowQROrdering: true, isActive: true
};

const isActiveBranch = (b: any) => Boolean(b.isActive || b.status);

const Branch: React.FC = () => {
  const dispatch = useDispatch();
  const { branches, loading } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });

  const fetchBranches = async () => {
    dispatch(setLoading(true));
    try {
      const res = await axios.get(`${API_BASE_URL}/branches`); // Wait, earlier I wrote api/branch. Need to check what backend uses. Let's use standard /branches
      // Oh, wait, branchRoutes uses what? I didn't change routes. Let me use /branches which is what was there.
      // Ah, earlier I saw it was /branches in the original code. Let's stick to /branches.
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

  const handleOpenOffcanvas = async (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      try {
        const res = await axios.get(`${API_BASE_URL}/branches/${branch.branchID || branch.id}`);
        const data = res.data;
        const parsedData = { ...data };
        ['orderSettings', 'kitchenSettings', 'billingSettings', 'paymentSetup', 'branding', 'workingHours'].forEach(key => {
          if (typeof parsedData[key] === 'string') {
            try { parsedData[key] = JSON.parse(parsedData[key]); } catch (e) {}
          }
        });
        if (typeof parsedData.startDate === 'string' && parsedData.startDate.includes('T')) {
          parsedData.startDate = parsedData.startDate.slice(0, 10);
        }
        if (!parsedData.startDate && parsedData.createdAt) {
          const ca = parsedData.createdAt;
          parsedData.startDate = typeof ca === 'string' && ca.includes('T') ? ca.slice(0, 10) : '';
        }
        setFormData({ ...EMPTY_FORM, ...parsedData });
      } catch (err) {
        setFormData({ ...EMPTY_FORM, ...branch });
      }
    } else {
      setEditingBranch(null);
      setFormData({ ...EMPTY_FORM });
    }
    setIsOffcanvasOpen(true);
  };

  const handleCloseOffcanvas = () => setIsOffcanvasOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async () => {
    if (!formData.branchName?.trim() || !formData.branchCode?.trim()) {
      triggerToast('Validation', 'error', 'Branch name and unique ID / code are required');
      return;
    }
    if (!formData.pincode?.trim() || !formData.state?.trim() || !formData.city?.trim()) {
      triggerToast('Validation', 'error', 'Pincode, state, and district are required');
      return;
    }
    if (!formData.area?.trim()) {
      triggerToast('Validation', 'error', 'Village / area is required');
      return;
    }
    if (!formData.address1?.trim()) {
      triggerToast('Validation', 'error', 'Branch address is required');
      return;
    }
    if (!formData.startDate?.trim()) {
      triggerToast('Validation', 'error', 'Start date is required');
      return;
    }
    setSaving(true);
    try {
      if (editingBranch) {
        await axios.put(`${API_BASE_URL}/branches/${editingBranch.branchID || editingBranch.id}`, formData);
        triggerToast('Branch updated', 'success', 'Changes were saved successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/branches`, formData);
        triggerToast('Branch added', 'success', 'The new branch was created successfully.');
      }
      await fetchBranches();
      handleCloseOffcanvas();
    } catch (err: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Failed to save branch'));
    }
    setSaving(false);
  };

  const toggleBranchStatus = async (branch: any) => {
    try {
      const currentStatus = isActiveBranch(branch);
      await axios.put(`${API_BASE_URL}/branches/${branch.branchID || branch.id}`, {
        ...branch,
        isActive: !currentStatus
      });
      await fetchBranches();
      triggerToast('Status updated', 'success', 'Branch active status was saved.');
    } catch (err: unknown) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async (branch: any) => {
    if (!window.confirm(`Delete branch "${branch.branchName || branch.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/branches/${branch.branchID || branch.id}`);
      await fetchBranches();
      triggerToast('Branch deleted', 'success', 'The branch was removed successfully.');
    } catch (err: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete branch'));
    }
  };

  const filteredData = useMemo(() => {
    return branches.filter((branch: any) =>
      (branch.branchName || branch.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.branchCode || branch.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.city || branch.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.managerName || branch.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  return (
    <div className="branch-page">
      {/* HEADER SECTION */}
      <CommonSubHeader
        icon={Building2}
        title={<><span>Branch</span> Management</>}
        totalLabel="Total Branch"
        totalCount={branches.length}
        stats={[
          { label: 'Active Branches', value: branches.filter(b => isActiveBranch(b)).length, color: 'green' },
          { label: 'Inactive Branches', value: branches.filter(b => !isActiveBranch(b)).length, color: 'red' }
        ]}
        searchPlaceholder="Search branches..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        addButtonText="Add New Branch"
        onAddClick={() => handleOpenOffcanvas()}
      />

      {/* TABLE SECTION */}
      <div className="table-wrapper">
        <table className="branch-table">
          <thead className='prim'>
            <tr>
              <th className="col-sno">Branch Name</th>
              <th>Branch Code</th>
              <th>City</th>
              <th>Contact Number</th>
              <th>Manager Name</th>
              <th>Created Date</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="loading-state">
                  <div className="heartbeat loader-icon"><Building2 size={32} /></div>
                  <p>Loading branches...</p>
                </td>
              </tr>
            ) : filteredData.length > 0 ? filteredData.map((branch: any) => (
              <tr key={branch.branchID || branch.id} className="data-row">
                <td>
                  <span className="name" style={{fontWeight: 600, color: 'var(--cream)'}}>{branch.branchName || branch.name}</span>
                </td>
                <td>
                  <span className="code" style={{color: 'var(--amber)', fontSize: '13px'}}>{branch.branchCode || branch.code}</span>
                </td>
                <td>
                  <div className="location-box">
                    <MapPin size={14} />
                    <span className="loc-text">{branch.city || branch.location || '—'}</span>
                  </div>
                </td>
                <td>
                  <span className="manager-text">{branch.phone || '—'}</span>
                </td>
                <td>
                  <span className="manager-text">{branch.managerName || branch.manager || '—'}</span>
                </td>
                <td>
                  <span className="manager-text">{new Date(branch.createdAt || branch.created_at).toLocaleDateString() || '—'}</span>
                </td>
                <td className="text-center">
                  <button
                    onClick={() => toggleBranchStatus(branch)}
                    className="status-btn"
                  >
                    <div className={`status-badge ${isActiveBranch(branch) ? 'active' : 'inactive'}`}>
                      <div className="dot" />
                      {isActiveBranch(branch) ? 'Active' : 'Inactive'}
                    </div>
                  </button>
                </td>
                <td>
                  <div className="actions-wrap">
                    <button onClick={() => {}} className="action-btn view" title="View">
                      <Eye size={16} />
                    </button>
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
                <td colSpan={8} className="empty-state">
                  <Building2 size={48} className="empty-icon" />
                  <h3>No Branches Found</h3>
                  <p>Try adjusting your search or add a new branch to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`branch-modal-backdrop ${isOffcanvasOpen ? 'is-visible' : ''}`}
        onClick={handleCloseOffcanvas}
        aria-hidden={!isOffcanvasOpen}
      />
      <div className={`branch-modal-center ${isOffcanvasOpen ? 'is-open' : ''}`} role="presentation">
        <div
          className="branch-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="branch-modal__header">
            <div className="branch-modal__title-block">
              <h2 id="branch-modal-title">Branch</h2>
              <span className="branch-modal__badge">{editingBranch ? 'Edit' : 'New'}</span>
            </div>
            <button type="button" className="branch-modal__close" onClick={handleCloseOffcanvas} aria-label="Close">
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          <div className="branch-modal__top-toggle">
            <span />
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Sub Branch</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="isSubBranch" checked={!!formData.isSubBranch} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
          </div>

          <div className="branch-modal__body">
            <div className="branch-modal__grid">
              <ModalField label="Branch Name" required>
                <input name="branchName" value={formData.branchName || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Branch name" />
              </ModalField>
              <ModalField label="Pincode" required>
                <input name="pincode" value={formData.pincode || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Pincode" />
              </ModalField>
              <ModalField label="Unique ID">
                <input
                  name="branchCode"
                  value={formData.branchCode || ''}
                  onChange={handleInputChange}
                  className="branch-modal-input"
                  placeholder="e.g. BR-01"
                  readOnly={!!editingBranch}
                />
              </ModalField>
              <ModalField label="State Name" required>
                <input name="state" value={formData.state || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="State" />
              </ModalField>
              <ModalField label="District Name" required>
                <input name="city" value={formData.city || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="District" />
              </ModalField>
              <ModalField label="Village / Area Name" required>
                <input name="area" value={formData.area || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Village or area" />
              </ModalField>
              <ModalField label="Country">
                <input name="country" value={formData.country || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Country" />
              </ModalField>
              <ModalField label="Start Date" required>
                <div className="branch-modal-input-wrap">
                  <Calendar size={18} className="branch-modal-input-icon" aria-hidden />
                  <input name="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} className="branch-modal-input branch-modal-input--date" />
                </div>
              </ModalField>
            </div>

            <ModalField label="Branch Address" required full>
              <textarea
                name="address1"
                value={formData.address1 || ''}
                onChange={handleInputChange}
                className="branch-modal-input branch-modal-textarea"
                placeholder="Full branch address"
                rows={3}
              />
            </ModalField>
          </div>

          <div className="branch-modal__footer">
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Head Office</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="isHeadOffice" checked={!!formData.isHeadOffice} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <button type="button" className="branch-modal__submit" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <FilePlus size={18} strokeWidth={2} />}
              {saving ? 'Saving…' : editingBranch ? 'Update Branch' : 'Add Branch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
const ModalField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; full?: boolean }> = ({
  label,
  children,
  required,
  full
}) => (
  <div className={`branch-modal-field${full ? ' branch-modal-field--full' : ''}`}>
    <span className="branch-modal-field__label">
      {label}
      {required ? <span className="branch-modal-field__req"> *</span> : null}
    </span>
    {children}
  </div>
);

export default Branch;
