import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Edit3,
  X,
  MapPin,
  Loader2,
  Calendar,
  FilePlus,
  Eye,
  Trash2,
  Download,
  Upload,
  Power,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchBranches,
  getBranch,
  addBranch,
  editBranch,
  deleteBranch,
  clearCurrentBranch,
} from '../../store/branchSlice';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import './Branch.scss';

const PAGE_SIZE = 10;

const WIZARD_STEPS = [
  { key: 'basic', label: 'Basic details' },
  { key: 'address', label: 'Address' },
  { key: 'contact', label: 'Contact info' },
  { key: 'manager', label: 'Branch manager' },
  { key: 'settings', label: 'Settings' },
  { key: 'payment', label: 'Payment setup' },
  { key: 'hours', label: 'Working hours' },
  { key: 'access', label: 'Status & access' },
] as const;

const EMPTY_FORM = {
  branchName: '',
  branchCode: '',
  branchType: 'Restaurant',
  description: '',
  address1: '',
  address2: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  latitude: '',
  longitude: '',
  country: 'India',
  startDate: '',
  postOffice: '',
  doorNo: '',
  isSubBranch: false,
  isHeadOffice: false,
  phone: '',
  alternateNumber: '',
  email: '',
  whatsappNumber: '',
  managerName: '',
  managerMobile: '',
  managerEmail: '',
  managerUser: '',
  orderSettings: { dineIn: true, takeaway: true, delivery: true },
  kitchenSettings: { displayEnabled: true, multipleSections: false },
  billingSettings: { taxType: 'Exclusive', gstPercent: '5', serviceCharge: '0' },
  paymentSetup: { cashEnabled: true, upiEnabled: true, razorpayKeys: '', autoConfirm: false },
  branding: { logo: '', prefix: 'INV', themeColor: '#000000' },
  workingHours: { openTime: '09:00', closeTime: '23:00', weeklyOff: 'None' },
  allowOnlineOrders: true,
  allowQROrdering: true,
  isActive: true,
};

const JSON_FORM_KEYS = ['orderSettings', 'kitchenSettings', 'billingSettings', 'paymentSetup', 'branding', 'workingHours'] as const;

function normalizeBranchFormData(data: Record<string, any>) {
  const parsed = { ...data };
  JSON_FORM_KEYS.forEach((key) => {
    if (typeof parsed[key] === 'string') {
      try {
        parsed[key] = JSON.parse(parsed[key]);
      } catch {
        /* keep */
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

function formatCreatedDate(b: any): string {
  const raw = b.createdAt ?? b.created_at ?? b.startDate ?? b.branchCreated;
  if (!raw) return '—';
  try {
    const d = new Date(typeof raw === 'string' ? raw : raw);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

const Branch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading } = useSelector((state: RootState) => state.branches);
  const user = useSelector((state: RootState) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('__all__');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [managerFilter, setManagerFilter] = useState<string>('__all__');

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewDetail, setViewDetail] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void dispatch(fetchBranches())
      .unwrap()
      .catch((msg: unknown) => {
        triggerToast('Could not load branches', 'error', String(msg));
      });
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cityFilter, statusFilter, managerFilter, branches.length]);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    branches.forEach((b: any) => {
      const c = getCity(b);
      if (c && c !== '—') set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [branches]);

  const managerOptions = useMemo(() => {
    const set = new Set<string>();
    branches.forEach((b: any) => {
      const m = getManagerName(b);
      if (m && m !== '—') set.add(m);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [branches]);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return branches.filter((branch: any) => {
      const matchSearch =
        !q ||
        (branch.branchName || branch.name || '').toLowerCase().includes(q) ||
        (branch.branchCode || branch.code || '').toLowerCase().includes(q) ||
        (branch.city || branch.location || '').toLowerCase().includes(q) ||
        (branch.managerName || branch.manager || '').toLowerCase().includes(q) ||
        String(branch.phone || branch.branchNumber || '').toLowerCase().includes(q);

      const city = getCity(branch);
      const matchCity = cityFilter === '__all__' || city === cityFilter;

      const active = isActiveBranch(branch);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && active) ||
        (statusFilter === 'inactive' && !active);

      const mgr = getManagerName(branch);
      const matchManager = managerFilter === '__all__' || mgr === managerFilter;

      const matchCompany =
        !user?.companyid ||
        branch.companyID == null ||
        Number(branch.companyID) === Number(user.companyid);

      return matchSearch && matchCity && matchStatus && matchManager && matchCompany;
    });
  }, [branches, searchTerm, cityFilter, statusFilter, managerFilter, user?.companyid]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, pageSafe]);

  const patchSection = useCallback((section: string, partial: Record<string, unknown>) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...(typeof prev[section] === 'object' && prev[section] ? prev[section] : {}), ...partial },
    }));
  }, []);

  const handleOpenOffcanvas = async (branch?: any) => {
    setWizardStep(0);
    if (branch) {
      setEditingBranch(branch);
      try {
        const data = await dispatch(getBranch(branch.branchID || branch.id)).unwrap();
        const parsedData = normalizeBranchFormData({ ...data });
        setFormData({ ...EMPTY_FORM, ...parsedData });
      } catch {
        setFormData({ ...EMPTY_FORM, ...normalizeBranchFormData({ ...branch }) });
      }
    } else {
      setEditingBranch(null);
      dispatch(clearCurrentBranch());
      const code = `BR-${String(branches.length + 1).padStart(2, '0')}`;
      setFormData({ ...EMPTY_FORM, branchCode: code });
    }
    setIsOffcanvasOpen(true);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
    setWizardStep(0);
  };

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
      triggerToast('Validation', 'error', 'Branch name and branch code are required');
      return;
    }
    if (!formData.pincode?.trim() || !formData.state?.trim() || !formData.city?.trim()) {
      triggerToast('Validation', 'error', 'Pincode, state, and city are required');
      return;
    }
    if (!formData.area?.trim()) {
      triggerToast('Validation', 'error', 'Area is required');
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
    const payload = {
      ...formData,
      companyID: user?.companyid ?? formData.companyID ?? 1,
    };
    try {
      if (editingBranch) {
        await dispatch(editBranch({ id: editingBranch.branchID || editingBranch.id, payload })).unwrap();
        triggerToast('Branch updated', 'success', 'Changes were saved successfully.');
      } else {
        await dispatch(addBranch(payload)).unwrap();
        triggerToast('Branch added', 'success', 'The new branch was created successfully.');
      }
      handleCloseOffcanvas();
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to save branch');
      triggerToast('Save failed', 'error', msg);
    }
    setSaving(false);
  };

  const handlePublishChange = async (branch: any, publishOn: boolean) => {
    try {
      await dispatch(
        editBranch({
          id: branch.branchID || branch.id,
          payload: { ...branch, isActive: publishOn },
        })
      ).unwrap();
      triggerToast('Status', 'success', publishOn ? 'Branch is active.' : 'Branch set to inactive.');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to update status');
      triggerToast('Update failed', 'error', msg);
    }
  };

  const handleDelete = async (branch: any) => {
    const name = getBranchName(branch);
    if (!window.confirm(`Delete branch "${name}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteBranch(branch.branchID || branch.id)).unwrap();
      triggerToast('Deleted', 'success', 'Branch was removed.');
      if (viewOpen && viewDetail && (viewDetail.branchID || viewDetail.id) === (branch.branchID || branch.id)) {
        setViewOpen(false);
        setViewDetail(null);
      }
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : getApiErrorMessage(err, 'Failed to delete branch');
      triggerToast('Delete failed', 'error', msg);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branches-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Export', 'success', 'Branch list downloaded.');
  };

  const onImportPick = () => importInputRef.current?.click();
  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    triggerToast('Import', 'info', 'Bulk import is not wired yet. Use Add Branch or contact support.');
  };

  const openView = async (branch: any) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewDetail(null);
    try {
      const d = await dispatch(getBranch(branch.branchID || branch.id)).unwrap();
      setViewDetail(normalizeBranchFormData({ ...d }));
    } catch {
      setViewDetail(normalizeBranchFormData({ ...branch }));
    }
    setViewLoading(false);
  };

  const closeView = () => {
    setViewOpen(false);
    setViewDetail(null);
  };

  const goNext = () => {
    if (wizardStep < WIZARD_STEPS.length - 1) setWizardStep((s) => s + 1);
  };
  const goPrev = () => {
    if (wizardStep > 0) setWizardStep((s) => s - 1);
  };

  const renderWizardFields = () => {
    const step = WIZARD_STEPS[wizardStep]?.key;
    const os = formData.orderSettings || EMPTY_FORM.orderSettings;
    const ks = formData.kitchenSettings || EMPTY_FORM.kitchenSettings;
    const bs = formData.billingSettings || EMPTY_FORM.billingSettings;
    const ps = formData.paymentSetup || EMPTY_FORM.paymentSetup;
    const wh = formData.workingHours || EMPTY_FORM.workingHours;

    if (step === 'basic') {
      return (
        <div className="branch-modal__grid">
          <ModalField label="Branch name" required>
            <input name="branchName" value={formData.branchName || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Branch name" />
          </ModalField>
          <ModalField label="Branch code" required>
            <input
              name="branchCode"
              value={formData.branchCode || ''}
              onChange={handleInputChange}
              className="branch-modal-input"
              placeholder="e.g. BR-01"
              readOnly={!!editingBranch}
            />
          </ModalField>
          <ModalField label="Branch type">
            <select name="branchType" value={formData.branchType || 'Restaurant'} onChange={handleInputChange} className="branch-modal-input branch-modal-select">
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Cloud Kitchen">Cloud Kitchen</option>
            </select>
          </ModalField>
          <ModalField label="Parent company">
            <input className="branch-modal-input" value={user?.company_name || '—'} readOnly />
          </ModalField>
          <ModalField label="Description" full>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="branch-modal-input branch-modal-textarea" rows={3} placeholder="Short description" />
          </ModalField>
          <ModalField label="Start date" required>
            <div className="branch-modal-input-wrap">
              <Calendar size={18} className="branch-modal-input-icon" aria-hidden />
              <input name="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} className="branch-modal-input branch-modal-input--date" />
            </div>
          </ModalField>
        </div>
      );
    }
    if (step === 'address') {
      return (
        <>
          <div className="branch-modal__grid">
            <ModalField label="Address line 1" required full>
              <input name="address1" value={formData.address1 || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Street, building" />
            </ModalField>
            <ModalField label="Address line 2" full>
              <input name="address2" value={formData.address2 || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Optional" />
            </ModalField>
            <ModalField label="Area" required>
              <input name="area" value={formData.area || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="City" required>
              <input name="city" value={formData.city || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="State" required>
              <input name="state" value={formData.state || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="Pincode" required>
              <input name="pincode" value={formData.pincode || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="Country">
              <input name="country" value={formData.country || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="Landmark">
              <input name="landmark" value={formData.landmark || ''} onChange={handleInputChange} className="branch-modal-input" />
            </ModalField>
            <ModalField label="Latitude">
              <input name="latitude" value={formData.latitude || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Optional" />
            </ModalField>
            <ModalField label="Longitude">
              <input name="longitude" value={formData.longitude || ''} onChange={handleInputChange} className="branch-modal-input" placeholder="Optional" />
            </ModalField>
          </div>
        </>
      );
    }
    if (step === 'contact') {
      return (
        <div className="branch-modal__grid">
          <ModalField label="Phone number" required>
            <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="Alternate number">
            <input name="alternateNumber" value={formData.alternateNumber || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="Email">
            <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="WhatsApp number">
            <input name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
        </div>
      );
    }
    if (step === 'manager') {
      return (
        <div className="branch-modal__grid">
          <ModalField label="Manager name">
            <input name="managerName" value={formData.managerName || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="Manager mobile">
            <input name="managerMobile" value={formData.managerMobile || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="Manager email">
            <input name="managerEmail" type="email" value={formData.managerEmail || ''} onChange={handleInputChange} className="branch-modal-input" />
          </ModalField>
          <ModalField label="Assign user (user ID)">
            <input
              name="managerUser"
              value={formData.managerUser != null ? String(formData.managerUser) : ''}
              onChange={handleInputChange}
              className="branch-modal-input"
              placeholder="Optional numeric user ID"
            />
          </ModalField>
        </div>
      );
    }
    if (step === 'settings') {
      return (
        <div className="branch-wizard-sections">
          <p className="branch-wizard-section-title">Order</p>
          <div className="branch-wizard-toggles">
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Dine-in</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!os.dineIn} onChange={(e) => patchSection('orderSettings', { dineIn: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Takeaway</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!os.takeaway} onChange={(e) => patchSection('orderSettings', { takeaway: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Delivery</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!os.delivery} onChange={(e) => patchSection('orderSettings', { delivery: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
          </div>
          <p className="branch-wizard-section-title">Kitchen</p>
          <div className="branch-wizard-toggles">
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Kitchen display</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!ks.displayEnabled} onChange={(e) => patchSection('kitchenSettings', { displayEnabled: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Multiple kitchen sections</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!ks.multipleSections} onChange={(e) => patchSection('kitchenSettings', { multipleSections: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
          </div>
          <p className="branch-wizard-section-title">Billing</p>
          <div className="branch-modal__grid">
            <ModalField label="Tax type">
              <select
                className="branch-modal-input branch-modal-select"
                value={bs.taxType || 'Exclusive'}
                onChange={(e) => patchSection('billingSettings', { taxType: e.target.value })}
              >
                <option value="Inclusive">Inclusive</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </ModalField>
            <ModalField label="GST %">
              <input className="branch-modal-input" value={bs.gstPercent ?? ''} onChange={(e) => patchSection('billingSettings', { gstPercent: e.target.value })} />
            </ModalField>
            <ModalField label="Service charge">
              <input className="branch-modal-input" value={bs.serviceCharge ?? ''} onChange={(e) => patchSection('billingSettings', { serviceCharge: e.target.value })} />
            </ModalField>
          </div>
        </div>
      );
    }
    if (step === 'payment') {
      return (
        <div className="branch-wizard-sections">
          <div className="branch-wizard-toggles">
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Cash</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!ps.cashEnabled} onChange={(e) => patchSection('paymentSetup', { cashEnabled: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">UPI</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!ps.upiEnabled} onChange={(e) => patchSection('paymentSetup', { upiEnabled: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Auto payment confirmation</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" checked={!!ps.autoConfirm} onChange={(e) => patchSection('paymentSetup', { autoConfirm: e.target.checked })} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
          </div>
          <ModalField label="Razorpay / gateway keys (reference)" full>
            <textarea
              className="branch-modal-input branch-modal-textarea"
              rows={2}
              value={ps.razorpayKeys || ''}
              onChange={(e) => patchSection('paymentSetup', { razorpayKeys: e.target.value })}
              placeholder="Store keys securely in production"
            />
          </ModalField>
        </div>
      );
    }
    if (step === 'hours') {
      return (
        <div className="branch-modal__grid">
          <ModalField label="Opening time">
            <input className="branch-modal-input" type="time" value={wh.openTime || '09:00'} onChange={(e) => patchSection('workingHours', { openTime: e.target.value })} />
          </ModalField>
          <ModalField label="Closing time">
            <input className="branch-modal-input" type="time" value={wh.closeTime || '23:00'} onChange={(e) => patchSection('workingHours', { closeTime: e.target.value })} />
          </ModalField>
          <ModalField label="Weekly off" full>
            <input className="branch-modal-input" value={wh.weeklyOff || 'None'} onChange={(e) => patchSection('workingHours', { weeklyOff: e.target.value })} placeholder="e.g. Sunday" />
          </ModalField>
        </div>
      );
    }
    if (step === 'access') {
      return (
        <div className="branch-wizard-sections">
          <div className="branch-wizard-toggles">
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Active</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="isActive" checked={!!formData.isActive} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Allow online orders</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="allowOnlineOrders" checked={!!formData.allowOnlineOrders} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Allow QR ordering</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="allowQROrdering" checked={!!formData.allowQROrdering} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Sub branch</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="isSubBranch" checked={!!formData.isSubBranch} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
            <label className="branch-modal__switch">
              <span className="branch-modal__switch-label">Head office</span>
              <span className="toggle-switch toggle-switch--modal">
                <input type="checkbox" name="isHeadOffice" checked={!!formData.isHeadOffice} onChange={handleInputChange} />
                <span className="toggle-switch-slider" />
              </span>
            </label>
          </div>
        </div>
      );
    }
    return null;
  };

  const colSpan = 8;

  return (
    <div className="branch-page branch-page--flush">
      <CommonSubHeader
        icon={Building2}
        title={
          <>
            <span>Branch</span> Management
          </>
        }
        totalLabel="Total branches"
        totalCount={branches.length}
        stats={[
          { label: 'Active', value: branches.filter((b) => isActiveBranch(b)).length, color: 'green' },
          { label: 'Inactive', value: branches.filter((b) => !isActiveBranch(b)).length, color: 'red' },
        ]}
        searchPlaceholder="Search by name, code, city, manager, phone…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        addButtonText="Add branch"
        onAddClick={() => void handleOpenOffcanvas()}
      />

      <div className="branch-toolbar">
        <div className="branch-toolbar__filters">
          <label className="branch-filter">
            <span>City</span>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="branch-filter__select">
              <option value="__all__">All cities</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="branch-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="branch-filter__select">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="branch-filter">
            <span>Manager</span>
            <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="branch-filter__select">
              <option value="__all__">All managers</option>
              {managerOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="branch-toolbar__actions">
          <input ref={importInputRef} type="file" accept=".json,application/json" className="branch-toolbar__file" onChange={onImportFile} aria-hidden />
          <button type="button" className="branch-toolbar__btn branch-toolbar__btn--ghost" onClick={onImportPick}>
            <Upload size={16} />
            Import
          </button>
          <button type="button" className="branch-toolbar__btn" onClick={exportJson}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="table-wrapper table-wrapper--full">
        <table className="branch-table">
          <thead className="prim">
            <tr>
              <th>Branch name</th>
              <th>Branch code</th>
              <th>City</th>
              <th>Contact number</th>
              <th>Manager name</th>
              <th className="text-center">Status</th>
              <th>Created date</th>
              <th className="text-right col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="loading-state">
                  <div className="heartbeat loader-icon">
                    <Building2 size={32} />
                  </div>
                  <p>Loading branches…</p>
                </td>
              </tr>
            ) : pagedRows.length > 0 ? (
              pagedRows.map((branch: any) => (
                <tr key={branch.branchID || branch.id} className="data-row">
                  <td>
                    <span className="name" style={{ fontWeight: 600, color: 'var(--cream)' }}>
                      {getBranchName(branch)}
                    </span>
                  </td>
                  <td>
                    <span className="code" style={{ color: 'var(--amber)', fontSize: '13px' }}>
                      {getBranchCode(branch)}
                    </span>
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
                  <td>
                    <span className="manager-text">{formatCreatedDate(branch)}</span>
                  </td>
                  <td>
                    <div className="actions-wrap">
                      <button type="button" onClick={() => void openView(branch)} className="action-btn view" title="View">
                        <Eye size={16} />
                      </button>
                      <button type="button" onClick={() => void handleOpenOffcanvas(branch)} className="action-btn edit" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => void handleDelete(branch)} className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handlePublishChange(branch, !isActiveBranch(branch))}
                        className={`action-btn power ${isActiveBranch(branch) ? 'on' : ''}`}
                        title={isActiveBranch(branch) ? 'Deactivate' : 'Activate'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan} className="empty-state">
                  <Building2 size={48} className="empty-icon" />
                  <h3>No branches match</h3>
                  <p>Try different filters or add a branch.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredData.length > 0 && (
        <div className="pagination-container">
          <div className="page-info">
            Showing <span>{(pageSafe - 1) * PAGE_SIZE + 1}</span>–<span>{Math.min(pageSafe * PAGE_SIZE, filteredData.length)}</span> of <span>{filteredData.length}</span>
          </div>
          <div className="pagination-controls">
            <button type="button" className="page-btn" disabled={pageSafe <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`page-btn${p === pageSafe ? ' active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="page-btn"
              disabled={pageSafe >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Edit / Add wizard modal */}
      <div className={`branch-modal-backdrop ${isOffcanvasOpen ? 'is-visible' : ''}`} onClick={handleCloseOffcanvas} aria-hidden={!isOffcanvasOpen} />
      <div className={`branch-modal-center ${isOffcanvasOpen ? 'is-open' : ''}`} role="presentation">
        <div className="branch-modal branch-modal--wide" role="dialog" aria-modal="true" aria-labelledby="branch-modal-title" onClick={(e) => e.stopPropagation()}>
          <div className="branch-modal__header">
            <div className="branch-modal__title-block">
              <h2 id="branch-modal-title">Branch</h2>
              <span className="branch-modal__badge">{editingBranch ? 'Edit' : 'New'}</span>
            </div>
            <button type="button" className="branch-modal__close" onClick={handleCloseOffcanvas} aria-label="Close">
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          <div className="branch-wizard-steps" role="tablist" aria-label="Form steps">
            {WIZARD_STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                className={`branch-wizard-step${i === wizardStep ? ' is-current' : ''}${i < wizardStep ? ' is-done' : ''}`}
                onClick={() => setWizardStep(i)}
              >
                <span className="branch-wizard-step__num">{i + 1}</span>
                <span className="branch-wizard-step__label">{s.label}</span>
              </button>
            ))}
          </div>

          <fieldset className="branch-modal__fieldset">
            <div className="branch-modal__body">{renderWizardFields()}</div>
            <div className="branch-modal__footer branch-modal__footer--wizard">
              <div className="branch-modal__footer-left">
                <button type="button" className="branch-modal__nav-btn" onClick={goPrev} disabled={wizardStep === 0}>
                  <ChevronLeft size={18} />
                  Back
                </button>
              </div>
              <div className="branch-modal__footer-right">
                {wizardStep < WIZARD_STEPS.length - 1 ? (
                  <button type="button" className="branch-modal__submit branch-modal__submit--secondary" onClick={goNext}>
                    Next
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="button" className="branch-modal__submit" onClick={() => void handleSave()} disabled={saving}>
                    {saving ? <Loader2 className="spin" size={18} /> : <FilePlus size={18} strokeWidth={2} />}
                    {saving ? 'Saving…' : editingBranch ? 'Update branch' : 'Add branch'}
                  </button>
                )}
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      {/* View details */}
      <div className={`branch-modal-backdrop ${viewOpen ? 'is-visible' : ''}`} onClick={closeView} aria-hidden={!viewOpen} />
      <div className={`branch-modal-center ${viewOpen ? 'is-open' : ''}`} role="presentation">
        <div className="branch-modal branch-modal--view" role="dialog" aria-modal="true" aria-labelledby="branch-view-title" onClick={(e) => e.stopPropagation()}>
          <div className="branch-modal__header">
            <div className="branch-modal__title-block">
              <h2 id="branch-view-title">Branch details</h2>
            </div>
            <button type="button" className="branch-modal__close" onClick={closeView} aria-label="Close">
              <X size={22} strokeWidth={2} />
            </button>
          </div>
          <div className="branch-modal__body branch-view-body">
            {viewLoading ? (
              <div className="branch-view-loading">
                <Loader2 className="spin" size={28} />
                <p>Loading…</p>
              </div>
            ) : viewDetail ? (
              <>
                <section className="branch-view-section">
                  <h3 className="branch-view-section__title">Branch info</h3>
                  <dl className="branch-view-dl">
                    <dt>Name</dt>
                    <dd>{getBranchName(viewDetail)}</dd>
                    <dt>Code</dt>
                    <dd>{getBranchCode(viewDetail)}</dd>
                    <dt>Address</dt>
                    <dd>{[viewDetail.address1, viewDetail.area, viewDetail.city, viewDetail.state, viewDetail.pincode].filter(Boolean).join(', ') || '—'}</dd>
                    <dt>Contact</dt>
                    <dd>{getBranchNumber(viewDetail)}</dd>
                  </dl>
                </section>
                <section className="branch-view-section">
                  <h3 className="branch-view-section__title">Performance</h3>
                  <p className="branch-view-muted">Connect reporting APIs to show today orders, revenue, and monthly trends.</p>
                  <div className="branch-view-kpis">
                    <div>
                      <span className="branch-view-kpi__v">—</span>
                      <span className="branch-view-kpi__l">Today orders</span>
                    </div>
                    <div>
                      <span className="branch-view-kpi__v">—</span>
                      <span className="branch-view-kpi__l">Today revenue</span>
                    </div>
                    <div>
                      <span className="branch-view-kpi__v">—</span>
                      <span className="branch-view-kpi__l">Monthly revenue</span>
                    </div>
                  </div>
                </section>
                <section className="branch-view-section">
                  <h3 className="branch-view-section__title">Staff &amp; operations</h3>
                  <p className="branch-view-muted">Staff roles, menu counts, and inventory alerts can be linked from their modules.</p>
                </section>
                <div className="branch-view-actions">
                  <button
                    type="button"
                    className="branch-modal__submit branch-modal__submit--secondary"
                    onClick={() => {
                      const b = viewDetail;
                      closeView();
                      void handleOpenOffcanvas(b);
                    }}
                  >
                    Edit branch
                  </button>
                </div>
              </>
            ) : (
              <p className="branch-view-muted">No data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; full?: boolean }> = ({
  label,
  children,
  required,
  full,
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
