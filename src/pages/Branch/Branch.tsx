import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2, Edit3, X, MapPin,
  Loader2, Calendar, FilePlus
} from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchBranches,
  getBranch,
  addBranch,
  editBranch,
  clearCurrentBranch,
} from '../../store/branchSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import './Branch.scss';

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

const isActiveBranch = (b: any) => {
  const v = b.isActive ?? b.status;
  if (v === 0 || v === '0' || v === false) return false;
  return Boolean(v);
};

const getBranchName = (b: any) => b.branchName || b.name || '—';
const getBranchCode = (b: any) => b.branchCode || b.code || '—';
const getCity = (b: any) => b.city || b.location || '—';
const getBranchNumber = (b: any) => b.phone || b.branchNumber || b.branchnumber || '—';
const getManagerName = (b: any) => b.managerName || b.manager || '—';

const JSON_FORM_KEYS = ['orderSettings', 'kitchenSettings', 'billingSettings', 'paymentSetup', 'branding', 'workingHours'] as const;

function normalizeBranchFormData(data: Record<string, any>) {
  const parsed = { ...data };
  JSON_FORM_KEYS.forEach((key) => {
    if (typeof parsed[key] === 'string') {
      try {
        parsed[key] = JSON.parse(parsed[key]);
      } catch {
        /* keep string */
      }
    }
  });
  if (typeof parsed.startDate === 'string' && parsed.startDate.includes('T')) {
    parsed.startDate = parsed.startDate.slice(0, 10);
  }
  if (!parsed.startDate && parsed.createdAt) {
    const ca = parsed.createdAt;
    parsed.startDate = typeof ca === 'string' && ca.includes('T') ? ca.slice(0, 10) : '';
  }
  return parsed;
}

const Branch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });

  useEffect(() => {
    void dispatch(fetchBranches())
      .unwrap()
      .catch((msg: unknown) => {
        triggerToast('Could not load branches', 'error', String(msg));
      });
  }, [dispatch]);

  const handleOpenOffcanvas = async (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      try {
        const data = await dispatch(getBranch(branch.branchID || branch.id)).unwrap();
        const parsedData = normalizeBranchFormData({ ...data });
        setFormData({ ...EMPTY_FORM, ...parsedData });
      } catch {
        setFormData({ ...EMPTY_FORM, ...branch });
      }
    } else {
      setEditingBranch(null);
      dispatch(clearCurrentBranch());
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
        await dispatch(
          editBranch({ id: editingBranch.branchID || editingBranch.id, payload: formData })
        ).unwrap();
        triggerToast('Branch updated', 'success', 'Changes were saved successfully.');
      } else {
        await dispatch(addBranch(formData)).unwrap();
        triggerToast('Branch added', 'success', 'The new branch was created successfully.');
      }
      handleCloseOffcanvas();
    } catch (err: unknown) {
      const msg =
        typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to save branch');
      triggerToast('Save failed', 'error', msg);
    }
    setSaving(false);
  };

  /** Is Publish on → isActive 1; off → isActive 0 */
  const handlePublishChange = async (branch: any, publishOn: boolean) => {
    try {
      await dispatch(
        editBranch({
          id: branch.branchID || branch.id,
          payload: { ...branch, isActive: publishOn },
        })
      ).unwrap();
      triggerToast('Published', 'success', publishOn ? 'Branch is now live.' : 'Branch unpublished (inactive).');
    } catch (err: unknown) {
      const msg =
        typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to update publish status');
      triggerToast('Update failed', 'error', msg);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return branches.filter((branch: any) =>
      (branch.branchName || branch.name || '').toLowerCase().includes(q) ||
      (branch.branchCode || branch.code || '').toLowerCase().includes(q) ||
      (branch.city || branch.location || '').toLowerCase().includes(q) ||
      (branch.managerName || branch.manager || '').toLowerCase().includes(q) ||
      String(branch.phone || branch.branchNumber || '').toLowerCase().includes(q)
    );
  }, [branches, searchTerm]);

  return (
    <div className="branch-page branch-page--full">
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
      <div className="table-wrapper table-wrapper--full">
        <table className="branch-table">
          <thead className="prim">
            <tr>
              <th className="col-sno">S.No</th>
              <th>Branch Name</th>
              <th>Branch Code</th>
              <th>City</th>
              <th>Branch Number</th>
              <th>Manager Name</th>
              <th className="text-center">Status</th>
              <th className="text-center col-publish">Is Publish</th>
              <th className="text-right col-actions">Edit</th>
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
            ) : filteredData.length > 0 ? filteredData.map((branch: any, index: number) => (
              <tr key={branch.branchID || branch.id} className="data-row">
                <td className="col-sno-val">{index + 1}</td>
                <td>
                  <span className="name" style={{ fontWeight: 600, color: 'var(--cream)' }}>{getBranchName(branch)}</span>
                </td>
                <td>
                  <span className="code" style={{ color: 'var(--amber)', fontSize: '13px' }}>{getBranchCode(branch)}</span>
                </td>
                <td>
                  <div className="location-box">
                    <MapPin size={14} aria-hidden />
                    <span className="loc-text">{getCity(branch)}</span>
                  </div>
                </td>
                <td>
                  <span className="manager-text">{getBranchNumber(branch)}</span>
                </td>
                <td>
                  <span className="manager-text">{getManagerName(branch)}</span>
                </td>
                <td className="text-center">
                  <div className={`status-badge ${isActiveBranch(branch) ? 'active' : 'inactive'}`} role="status">
                    <div className="dot" />
                    {isActiveBranch(branch) ? 'Active' : 'Inactive'}
                  </div>
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="branch-publish-check"
                    title="Publish (active)"
                    checked={isActiveBranch(branch)}
                    onChange={(e) => void handlePublishChange(branch, e.target.checked)}
                    aria-label={`Publish ${getBranchName(branch)}`}
                  />
                </td>
                <td>
                  <div className="actions-wrap">
                    <button type="button" onClick={() => void handleOpenOffcanvas(branch)} className="action-btn edit" title="Edit">
                      <Edit3 size={16} />
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

          <div className="branch-modal__fieldset">
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
