import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Edit3,
  Loader2,
  X,
  Save,
  ChevronRight,
  ChevronLeft,
  Info,
  Power,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchCompanies,
  fetchCompanyDetails,
  addCompany,
  updateCompany,
  setCompanyActive,
} from '../../store/companySlice';
import { triggerToast } from '../../components/common/CommonAlert';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import CommonTable from '../../components/common/CommonTable';
import EmptyTableIllustration from '../../components/common/EmptyTableIllustration';
import './Company.scss';
import {
  EMPTY_FORM,
  COMPANY_FORM_SECTIONS,
  COMPANY_MODULE_SETTINGS,
  normalizeCompanyFormFromApi,
  type CompanyType,
  type CompanyModuleFlagKey,
} from '../../types/Comapny/companyInterface';
import {
  COMPANY_FIELD_SECTION,
  stripErrorsForSection,
  validateCompanyForm,
  validateCompanyFormSection,
} from './companyFormValidation';

const Company: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const companies = useSelector((s: RootState) => s.company.companies) as CompanyType[];
  const loading = useSelector((s: RootState) => s.company.loading);
  const detailLoading = useSelector((s: RootState) => s.company.detailLoading);

  const [search, setSearch] = useState('');
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState<Record<string, unknown>>({ ...EMPTY_FORM });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void dispatch(fetchCompanies())
      .unwrap()
      .catch((e: unknown) => triggerToast(String(e), 'error'));
  }, [dispatch]);

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setEditId(null);
    setActiveSection('basic');
    setFieldErrors({});
    setOffcanvasOpen(true);
  };

  const openEdit = async (id: number) => {
    setEditId(id);
    setActiveSection('basic');
    setFieldErrors({});
    setOffcanvasOpen(true);
    try {
      const row = await dispatch(fetchCompanyDetails(id)).unwrap();
      setFormData(normalizeCompanyFormFromApi(row as Record<string, unknown>));
    } catch (e) {
      triggerToast(String(e), 'error');
    }
  };

  const closeOffcanvas = () => {
    setFieldErrors({});
    setOffcanvasOpen(false);
  };

  const inputCls = (name: string, extra = '') =>
    ['dark-input', fieldErrors[name] ? 'is-invalid' : '', extra].filter(Boolean).join(' ');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const toggleModuleFlag = (key: CompanyModuleFlagKey) => {
    setFormData((p) => {
      const cur = p[key] === 1 ? 1 : 0;
      return { ...p, [key]: cur === 1 ? 0 : 1 };
    });
  };

  const handleSave = async () => {
    const isEdit = Boolean(editId);
    const { valid, errors, firstErrorSection } = validateCompanyForm(formData, { isEdit });
    if (!valid) {
      setFieldErrors(errors);
      if (firstErrorSection) setActiveSection(firstErrorSection);
      triggerToast('Please correct the highlighted fields in each section.', 'error');
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editId) {
        await dispatch(updateCompany({ id: editId, payload: formData })).unwrap();
        triggerToast('Company updated successfully.', 'success');
      } else {
        await dispatch(addCompany(formData)).unwrap();
        triggerToast('Company created successfully.', 'success');
      }
      closeOffcanvas();
    } catch (e) {
      triggerToast(typeof e === 'string' ? e : String(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, currentlyActive: boolean) => {
    try {
      await dispatch(setCompanyActive({ id, isActive: !currentlyActive })).unwrap();
      triggerToast(currentlyActive ? 'Company deactivated' : 'Company activated', 'success');
    } catch (e) {
      triggerToast(String(e), 'error');
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_code?.toLowerCase().includes(search.toLowerCase())
  );

  const secIdxRaw = COMPANY_FORM_SECTIONS.findIndex((s) => s.id === activeSection);
  const secIdx = secIdxRaw < 0 ? 0 : secIdxRaw;

  const goNextSection = () => {
    if (secIdx >= COMPANY_FORM_SECTIONS.length - 1) return;
    const currentId = COMPANY_FORM_SECTIONS[secIdx].id;
    if (currentId !== 'company-settings') {
      const sectionErrors = validateCompanyFormSection(currentId, formData, { isEdit: Boolean(editId) });
      setFieldErrors((prev) => ({ ...stripErrorsForSection(prev, currentId), ...sectionErrors }));
      if (Object.keys(sectionErrors).length) {
        triggerToast('Complete this section before continuing.', 'warning');
        return;
      }
    }
    setActiveSection(COMPANY_FORM_SECTIONS[secIdx + 1].id);
  };

  const renderForm = () => {
    if (detailLoading && editId) {
      return (
        <div className="state-cell" style={{ textAlign: 'center', padding: '48px' }}>
          <Loader2 className="spin" size={28} />
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>Loading company…</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'basic':
        return (
          <div className="form-grid">
            <FormField label="Company Name *" error={fieldErrors.company_name}>
              <input
                name="company_name"
                value={String(formData.company_name || '')}
                onChange={handleInput}
                className={inputCls('company_name')}
                placeholder="Enter company name"
                autoComplete="organization"
              />
            </FormField>
            <FormField label="Company Code" error={fieldErrors.company_code}>
              <input
                name="company_code"
                value={String(formData.company_code || '')}
                onChange={handleInput}
                className={inputCls('company_code')}
                placeholder="Auto-generated"
                autoComplete="off"
              />
            </FormField>
            <FormField label="Legal Name">
              <input
                name="legal_name"
                value={String(formData.legal_name || '')}
                onChange={handleInput}
                className={inputCls('legal_name')}
                placeholder="Legal entity name"
              />
            </FormField>
            <FormField label="Business Type">
              <select
                name="business_type"
                value={String(formData.business_type || '')}
                onChange={handleInput}
                className={inputCls('business_type', 'dark-select')}
              >
                {['Hotel', 'Cafe', 'Restaurant', 'Multi-Branch', 'Cloud Kitchen'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Industry Category">
              <input
                name="industry_category"
                value={String(formData.industry_category || '')}
                onChange={handleInput}
                className={inputCls('industry_category')}
                placeholder="e.g. Hospitality"
              />
            </FormField>
            <FormField label="GST Number" error={fieldErrors.gst_number}>
              <input
                name="gst_number"
                value={String(formData.gst_number || '')}
                onChange={handleInput}
                className={inputCls('gst_number')}
                placeholder="15-character GSTIN"
                autoCapitalize="characters"
              />
            </FormField>
            <FormField label="PAN Number" error={fieldErrors.pan_number}>
              <input
                name="pan_number"
                value={String(formData.pan_number || '')}
                onChange={handleInput}
                className={inputCls('pan_number')}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
              />
            </FormField>
            <FormField label="CIN Number (Optional)">
              <input
                name="cin_number"
                value={String(formData.cin_number || '')}
                onChange={handleInput}
                className={inputCls('cin_number')}
                placeholder="Enter CIN"
              />
            </FormField>
          </div>
        );
      case 'address':
        return (
          <div className="form-grid">
            <FormField label="Address Line 1 *" full error={fieldErrors.address_line1}>
              <input
                name="address_line1"
                value={String(formData.address_line1 || '')}
                onChange={handleInput}
                className={inputCls('address_line1')}
                placeholder="Street / Building"
                autoComplete="street-address"
              />
            </FormField>
            <FormField label="Address Line 2" full>
              <input
                name="address_line2"
                value={String(formData.address_line2 || '')}
                onChange={handleInput}
                className={inputCls('address_line2')}
                placeholder="Area"
              />
            </FormField>
            <FormField label="City *" error={fieldErrors.city}>
              <input
                name="city"
                value={String(formData.city || '')}
                onChange={handleInput}
                className={inputCls('city')}
                placeholder="City"
                autoComplete="address-level2"
              />
            </FormField>
            <FormField label="State *" error={fieldErrors.state}>
              <input
                name="state"
                value={String(formData.state || '')}
                onChange={handleInput}
                className={inputCls('state')}
                placeholder="State"
                autoComplete="address-level1"
              />
            </FormField>
            <FormField label="Country *" error={fieldErrors.country}>
              <input
                name="country"
                value={String(formData.country || '')}
                onChange={handleInput}
                className={inputCls('country')}
                placeholder="Country"
                autoComplete="country-name"
              />
            </FormField>
            <FormField label="Pincode *" error={fieldErrors.pincode}>
              <input
                name="pincode"
                value={String(formData.pincode || '')}
                onChange={handleInput}
                className={inputCls('pincode')}
                placeholder="6-digit pincode"
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </FormField>
            <FormField label="Google Map (Lat, Lng)" error={fieldErrors.map_location}>
              <input
                name="map_location"
                value={String(formData.map_location || '')}
                onChange={handleInput}
                className={inputCls('map_location')}
                placeholder="12.9716, 77.5946"
              />
            </FormField>
            <FormField label="Landmark">
              <input
                name="landmark"
                value={String(formData.landmark || '')}
                onChange={handleInput}
                className={inputCls('landmark')}
                placeholder="Near..."
              />
            </FormField>
          </div>
        );
      case 'contact':
        return (
          <div className="form-grid">
            <FormField label="Primary Phone *" error={fieldErrors.primary_phone}>
              <input
                name="primary_phone"
                value={String(formData.primary_phone || '')}
                onChange={handleInput}
                className={inputCls('primary_phone')}
                placeholder="+91 or 10-digit mobile"
                inputMode="tel"
                autoComplete="tel"
              />
            </FormField>
            <FormField label="Secondary Phone" error={fieldErrors.secondary_phone}>
              <input
                name="secondary_phone"
                value={String(formData.secondary_phone || '')}
                onChange={handleInput}
                className={inputCls('secondary_phone')}
                placeholder="+91 XXXXX XXXXX"
                inputMode="tel"
              />
            </FormField>
            <FormField label="WhatsApp Number" error={fieldErrors.whatsapp_number}>
              <input
                name="whatsapp_number"
                value={String(formData.whatsapp_number || '')}
                onChange={handleInput}
                className={inputCls('whatsapp_number')}
                placeholder="+91 XXXXX XXXXX"
                inputMode="tel"
              />
            </FormField>
            <FormField label="Email ID *" error={fieldErrors.email_id}>
              <input
                name="email_id"
                type="email"
                value={String(formData.email_id || '')}
                onChange={handleInput}
                className={inputCls('email_id')}
                placeholder="company@email.com"
                autoComplete="email"
              />
            </FormField>
            <FormField label="Website URL" full error={fieldErrors.website_url}>
              <input
                name="website_url"
                type="url"
                value={String(formData.website_url || '')}
                onChange={handleInput}
                className={inputCls('website_url')}
                placeholder="https://www.example.com"
              />
            </FormField>
          </div>
        );
      case 'owner':
        return (
          <div className="form-grid">
            <FormField label="Owner Name *" error={fieldErrors.owner_name}>
              <input
                name="owner_name"
                value={String(formData.owner_name || '')}
                onChange={handleInput}
                className={inputCls('owner_name')}
                placeholder="Owner name"
                autoComplete="name"
              />
            </FormField>
            <FormField label="Owner Mobile *" error={fieldErrors.owner_mobile}>
              <input
                name="owner_mobile"
                value={String(formData.owner_mobile || '')}
                onChange={handleInput}
                className={inputCls('owner_mobile')}
                placeholder="+91 or 10-digit mobile"
                inputMode="tel"
                autoComplete="tel"
              />
            </FormField>
            <FormField label="Owner Email *" error={fieldErrors.owner_email}>
              <input
                name="owner_email"
                type="email"
                value={String(formData.owner_email || '')}
                onChange={handleInput}
                className={inputCls('owner_email')}
                placeholder="owner@email.com"
                autoComplete="email"
              />
            </FormField>
            <FormField label="Admin Username">
              <input
                name="admin_username"
                value={String(formData.admin_username || '')}
                onChange={handleInput}
                className={inputCls('admin_username')}
                placeholder="Defaults to owner mobile if empty"
                autoComplete="username"
              />
            </FormField>
            <FormField
              label={editId ? 'Password (leave blank to keep)' : 'Admin Password *'}
              error={fieldErrors.admin_password}
            >
              <input
                name="admin_password"
                type="password"
                value={String(formData.admin_password || '')}
                onChange={handleInput}
                className={inputCls('admin_password')}
                placeholder={editId ? 'Leave blank to keep current' : 'Min. 6 characters'}
                autoComplete={editId ? 'new-password' : 'new-password'}
              />
            </FormField>
          </div>
        );
      case 'company-settings': {
        return (
          <div className="module-settings">
            <p className="module-settings__intro">
              Each switch is stored as its own TINYINT column on the company row (for example <strong>isSubscription</strong>, default 0). On is 1, off is 0.
            </p>
            <ul className="module-settings__list" role="list">
              {COMPANY_MODULE_SETTINGS.map((row) => {
                const Icon = row.icon;
                const on = formData[row.id] === 1;
                return (
                  <li key={row.id} className="module-settings__row">
                    <div className="module-settings__label">
                      <span className="module-settings__icon" aria-hidden>
                        <Icon size={18} />
                      </span>
                      <span className="module-settings__name">{row.name}</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      className={`module-settings__switch ${on ? 'is-on' : 'is-off'}`}
                      onClick={() => toggleModuleFlag(row.id)}
                    >
                      <span className="module-settings__thumb" />
                      <span className="module-settings__state">{on ? 'On' : 'Off'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      default:
        return (
          <div className="empty-section">
            <Info size={40} className="empty-icon" />
            <p>
              Configure <strong>{COMPANY_FORM_SECTIONS.find((s) => s.id === activeSection)?.name}</strong> settings here.
            </p>
            <span>Fields for this section will be added based on requirements.</span>
          </div>
        );
    }
  };

  const columns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_: unknown, i: number) => String(i + 1).padStart(2, '0'),
    },
    {
      key: 'company_name',
      header: 'Company Name',
      render: (c: CompanyType) => (
        <div className="company-name-cell">
          <div className="company-avatar">{c.company_name?.charAt(0)?.toUpperCase()}</div>
          <span>{c.company_name}</span>
        </div>
      ),
    },
    {
      key: 'company_code',
      header: 'Company Code',
      render: (c: CompanyType) => <span className="code-badge">{c.company_code || '—'}</span>,
    },
    {
      key: 'owner_name',
      header: 'Owner Name',
      render: (c: CompanyType) => c.owner_name || '—',
    },
    {
      key: 'address',
      header: 'Address',
      render: (c: CompanyType) =>
        [c.address_line1, c.city, c.state, c.pincode].filter(Boolean).join(', ') || '—',
    },
    {
      key: 'is_active',
      header: 'Active',
      align: 'center' as const,
      render: (c: CompanyType) => (
        <button
          type="button"
          className={`publish-btn ${c.is_active ? 'published' : 'unpublished'}`}
          onClick={() => toggleActive(c.id, Boolean(c.is_active))}
          title={c.is_active ? 'Click to deactivate' : 'Click to activate'}
        >
          <Power size={14} /> {c.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (c: CompanyType) => (
        <button type="button" className="btn-edit" onClick={() => openEdit(c.id)}>
          <Edit3 size={15} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="company-page">
      <CommonSubHeader
        icon={Building2}
        title={
          <>
            Company <em>Management</em>
          </>
        }
        totalLabel="Companies registered"
        totalCount={companies.length}
        searchPlaceholder="Search company..."
        searchValue={search}
        onSearchChange={setSearch}
        addButtonText="Add Company"
        onAddClick={openAdd}
      />

      {loading ? (
        <div className="state-cell" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="state-inner">
            <Loader2 className="spin" size={32} />
            <p>Loading companies...</p>
          </div>
        </div>
      ) : (
        <CommonTable
          columns={columns}
          data={filtered}
          emptySlot={
            <div className="empty-table-state">
              <EmptyTableIllustration variant={search ? 'search' : 'company'} />
              <p className="empty-table-state__title">{search ? 'No matching companies' : 'No companies yet'}</p>
              <p className="empty-table-state__hint">
                {search ? (
                  'Try another search or clear the box to see all companies.'
                ) : (
                  <>
                    Use <strong>Add Company</strong> above to register your first business profile.
                  </>
                )}
              </p>
            </div>
          }
        />
      )}

      <div className={`oc-backdrop ${offcanvasOpen ? 'visible' : ''}`} onClick={closeOffcanvas} />

      <div
        className={`offcanvas-panel company-modal company-modal--compact-sections ${offcanvasOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="oc-header">
          <div className="oc-header__title">
            <div className="oc-icon">
              <Building2 size={18} />
            </div>
            <div>
              <h3>{editId ? 'Edit Company' : 'Add New Company'}</h3>
              <p>Basic &amp; address</p>
            </div>
          </div>
          <button type="button" className="oc-close" onClick={closeOffcanvas} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="oc-body">
          <nav className="oc-nav" aria-label="Form sections">
            {COMPANY_FORM_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const hasErrors = Object.keys(fieldErrors).some((k) => COMPANY_FIELD_SECTION[k] === sec.id);
              return (
                <button
                  type="button"
                  key={sec.id}
                  className={`oc-nav-item ${activeSection === sec.id ? 'active' : ''} ${hasErrors ? 'has-field-errors' : ''}`}
                  onClick={() => setActiveSection(sec.id)}
                >
                  <div className="oc-nav-icon">
                    <Icon size={16} />
                  </div>
                  <span>{sec.name}</span>
                  {hasErrors ? <span className="oc-nav-error-dot" aria-hidden /> : null}
                  <ChevronRight size={12} className="oc-nav-arrow" />
                </button>
              );
            })}
          </nav>

          <div className="oc-form-area">
            <div className="oc-form-body">{renderForm()}</div>
          </div>
        </div>

        <div className="oc-footer">
          <div className="oc-footer__lead">
            <button
              type="button"
              className="oc-btn-prev"
              disabled={secIdx === 0 || (detailLoading && Boolean(editId))}
              onClick={() => setActiveSection(COMPANY_FORM_SECTIONS[secIdx - 1].id)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
          </div>
          <div className="oc-footer-actions">
            <button type="button" className="oc-btn-cancel" onClick={closeOffcanvas}>
              Cancel
            </button>
            <button
              type="button"
              className="oc-btn-save"
              onClick={handleSave}
              disabled={saving || (detailLoading && Boolean(editId))}
            >
              {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : editId ? 'Update Company' : 'Create Company'}
            </button>
          </div>
          <div className="oc-footer__trail">
            {secIdx < COMPANY_FORM_SECTIONS.length - 1 ? (
              <button
                type="button"
                className="oc-btn-next"
                disabled={detailLoading && Boolean(editId)}
                onClick={goNextSection}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <span className="oc-footer__trail-spacer" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  full?: boolean;
  error?: string;
}> = ({ label, children, full, error }) => (
  <div className={`form-group${full ? ' full-width' : ''}${error ? ' has-error' : ''}`}>
    <label className="input-label">{label}</label>
    {children}
    {error ? (
      <span className="form-field-error" role="alert">
        {error}
      </span>
    ) : null}
  </div>
);

export default Company;
