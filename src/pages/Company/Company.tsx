import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2,
  Edit3,
  EyeOff,
  Loader2,
  X,
  Save,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../../routes/const';
import { triggerToast } from '../../components/common/CommonAlert';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import CommonTable from '../../components/common/CommonTable';
import EmptyTableIllustration from '../../components/common/EmptyTableIllustration';
import './Company.scss';
import { EMPTY_FORM, SECTIONS, type CompanyType } from '../../types/Comapny/companyInterface';

const Company: React.FC = () => {
  const [companies, setCompanies]     = useState<CompanyType[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [editId, setEditId]           = useState<number | null>(null);
  const [saving, setSaving]           = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData]       = useState<any>({ ...EMPTY_FORM });

  /* ── fetch list ── */
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}api/company`);
      setCompanies(res.data);
    } catch {
      triggerToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  /* ── open offcanvas ── */
  const openAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setEditId(null);
    setActiveSection('basic');
    setOffcanvasOpen(true);
  };

  const openEdit = async (id: number) => {
    setEditId(id);
    setActiveSection('basic');
    setOffcanvasOpen(true);
    try {
      const res = await axios.get(`${API_BASE_URL}api/company/${id}`);
      setFormData(res.data);
    } catch {
      triggerToast('Failed to load company data', 'error');
    }
  };

  const closeOffcanvas = () => setOffcanvasOpen(false);

  /* ── form handlers ── */
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p: any) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.company_name) return triggerToast('Company name is required', 'error');
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}api/company/${editId}`, formData);
        triggerToast('Company updated', 'success');
      } else {
        await axios.post(`${API_BASE_URL}api/company`, formData);
        triggerToast('Company created', 'success');
      }
      closeOffcanvas();
      fetchCompanies();
    } catch {
      triggerToast('Failed to save company', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── publish toggle ── */
  const togglePublish = async (id: number) => {
    try {
      await axios.patch(`${API_BASE_URL}api/company/${id}/publish`);
      setCompanies(prev =>
        prev.map(c => c.id === id ? { ...c, is_published: !c.is_published } : c)
      );
    } catch {
      triggerToast('Failed to update status', 'error');
    }
  };

  /* ── filtered list ── */
  const filtered = companies.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company_code?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── form sections ── */
  const renderForm = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="form-grid">
            <FormField label="Company Name *"><input name="company_name" value={formData.company_name||''} onChange={handleInput} className="dark-input" placeholder="Enter company name"/></FormField>
            <FormField label="Company Code"><input name="company_code" value={formData.company_code||''} onChange={handleInput} className="dark-input" placeholder="Auto-generated"/></FormField>
            <FormField label="Legal Name"><input name="legal_name" value={formData.legal_name||''} onChange={handleInput} className="dark-input" placeholder="Legal entity name"/></FormField>
            <FormField label="Business Type">
              <select name="business_type" value={formData.business_type||''} onChange={handleInput} className="dark-input dark-select">
                {['Hotel','Cafe','Restaurant','Multi-Branch','Cloud Kitchen'].map(t=><option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Industry Category"><input name="industry_category" value={formData.industry_category||''} onChange={handleInput} className="dark-input" placeholder="e.g. Hospitality"/></FormField>
            <FormField label="GST Number"><input name="gst_number" value={formData.gst_number||''} onChange={handleInput} className="dark-input" placeholder="Enter GSTIN"/></FormField>
            <FormField label="PAN Number"><input name="pan_number" value={formData.pan_number||''} onChange={handleInput} className="dark-input" placeholder="Enter PAN"/></FormField>
            <FormField label="CIN Number (Optional)"><input name="cin_number" value={formData.cin_number||''} onChange={handleInput} className="dark-input" placeholder="Enter CIN"/></FormField>
          </div>
        );
      case 'address':
        return (
          <div className="form-grid">
            <FormField label="Address Line 1 *" full><input name="address_line1" value={formData.address_line1||''} onChange={handleInput} className="dark-input" placeholder="Street / Building"/></FormField>
            <FormField label="Address Line 2" full><input name="address_line2" value={formData.address_line2||''} onChange={handleInput} className="dark-input" placeholder="Area"/></FormField>
            <FormField label="City *"><input name="city" value={formData.city||''} onChange={handleInput} className="dark-input" placeholder="City"/></FormField>
            <FormField label="State *"><input name="state" value={formData.state||''} onChange={handleInput} className="dark-input" placeholder="State"/></FormField>
            <FormField label="Country *"><input name="country" value={formData.country||''} onChange={handleInput} className="dark-input" placeholder="Country"/></FormField>
            <FormField label="Pincode *"><input name="pincode" value={formData.pincode||''} onChange={handleInput} className="dark-input" placeholder="Pincode"/></FormField>
            <FormField label="Google Map (Lat, Lng)"><input name="map_location" value={formData.map_location||''} onChange={handleInput} className="dark-input" placeholder="12.9716, 77.5946"/></FormField>
            <FormField label="Landmark"><input name="landmark" value={formData.landmark||''} onChange={handleInput} className="dark-input" placeholder="Near..."/></FormField>
          </div>
        );
      case 'contact':
        return (
          <div className="form-grid">
            <FormField label="Primary Phone *"><input name="primary_phone" value={formData.primary_phone||''} onChange={handleInput} className="dark-input" placeholder="+91 XXXXX XXXXX"/></FormField>
            <FormField label="Secondary Phone"><input name="secondary_phone" value={formData.secondary_phone||''} onChange={handleInput} className="dark-input" placeholder="+91 XXXXX XXXXX"/></FormField>
            <FormField label="WhatsApp Number"><input name="whatsapp_number" value={formData.whatsapp_number||''} onChange={handleInput} className="dark-input" placeholder="+91 XXXXX XXXXX"/></FormField>
            <FormField label="Email ID *"><input name="email_id" type="email" value={formData.email_id||''} onChange={handleInput} className="dark-input" placeholder="company@email.com"/></FormField>
            <FormField label="Website URL" full><input name="website_url" type="url" value={formData.website_url||''} onChange={handleInput} className="dark-input" placeholder="https://www.example.com"/></FormField>
          </div>
        );
      case 'owner':
        return (
          <div className="form-grid">
            <FormField label="Owner Name *"><input name="owner_name" value={formData.owner_name||''} onChange={handleInput} className="dark-input" placeholder="Owner Name"/></FormField>
            <FormField label="Owner Mobile *"><input name="owner_mobile" value={formData.owner_mobile||''} onChange={handleInput} className="dark-input" placeholder="+91 XXXXX XXXXX"/></FormField>
            <FormField label="Owner Email *"><input name="owner_email" type="email" value={formData.owner_email||''} onChange={handleInput} className="dark-input" placeholder="owner@email.com"/></FormField>
            <FormField label="Admin Username"><input name="admin_username" value={formData.admin_username||''} onChange={handleInput} className="dark-input" placeholder="Username"/></FormField>
            <FormField label="Password"><input name="admin_password" type="password" value={formData.admin_password||''} onChange={handleInput} className="dark-input" placeholder="••••••••"/></FormField>
          </div>
        );
      default:
        return (
          <div className="empty-section">
            <Info size={40} className="empty-icon"/>
            <p>Configure <strong>{SECTIONS.find(s=>s.id===activeSection)?.name}</strong> settings here.</p>
            <span>Fields for this section will be added based on requirements.</span>
          </div>
        );
    }
  };

  /* ── nav helpers ── */
  const secIdx = SECTIONS.findIndex(s => s.id === activeSection);

  /* ── table columns ── */
  const columns = [
    {
      key: 'sno',
      header: 'S.No',
      render: (_: any, i: number) => String(i + 1).padStart(2, '0')
    },
    {
      key: 'company_name',
      header: 'Company Name',
      render: (c: any) => (
        <div className="company-name-cell">
          <div className="company-avatar">{c.company_name?.charAt(0)?.toUpperCase()}</div>
          <span>{c.company_name}</span>
        </div>
      )
    },
    {
      key: 'company_code',
      header: 'Company Code',
      render: (c: any) => <span className="code-badge">{c.company_code || '—'}</span>
    },
    {
      key: 'owner_name',
      header: 'Owner Name',
      render: (c: any) => c.owner_name || '—'
    },
    {
      key: 'address',
      header: 'Address',
      render: (c: any) => [c.address_line1, c.city, c.state, c.pincode].filter(Boolean).join(', ') || '—'
    },
    {
      key: 'is_published',
      header: 'Published',
      align: 'center' as const,
      render: (c: any) => (
        <button
          className={`publish-btn ${c.is_published ? 'published' : 'unpublished'}`}
          onClick={() => togglePublish(c.id)}
          title={c.is_published ? 'Click to unpublish' : 'Click to publish'}
        >
          {c.is_published ? <><CheckCircle2 size={14}/> Published</> : <><EyeOff size={14}/> Draft</>}
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (c: any) => (
        <button className="btn-edit" onClick={() => openEdit(c.id)}>
          <Edit3 size={15}/> Edit
        </button>
      )
    }
  ];

  return (
    <div className="company-page">

      {/* ─── Header ─── */}
      <CommonSubHeader
        icon={Building2}
        title={<>Company <em>Management</em></>}
        totalLabel="Companies registered"
        totalCount={companies.length}
        searchPlaceholder="Search company..."
        searchValue={search}
        onSearchChange={setSearch}
        addButtonText="Add Company"
        onAddClick={openAdd}
      />

      {/* ─── Table ─── */}
      {loading ? (
        <div className="state-cell" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="state-inner">
            <Loader2 className="spin" size={32}/>
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
              <p className="empty-table-state__title">
                {search ? 'No matching companies' : 'No companies yet'}
              </p>
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

      {/* ─── Offcanvas Backdrop ─── */}
      <div
        className={`oc-backdrop ${offcanvasOpen ? 'visible' : ''}`}
        onClick={closeOffcanvas}
      />

      {/* ─── Company modal (centered) ─── */}
      <div className={`offcanvas-panel company-modal ${offcanvasOpen ? 'open' : ''}`} role="dialog" aria-modal="true">

        <div className="oc-header">
          <div className="oc-header__title">
            <div className="oc-icon"><Building2 size={18}/></div>
            <div>
              <h3>{editId ? 'Edit Company' : 'Add New Company'}</h3>
              <p>Company Details</p>
            </div>
          </div>
          <button type="button" className="oc-close" onClick={closeOffcanvas} aria-label="Close">
            <X size={20}/>
          </button>
        </div>

        <div className="oc-body">
          <nav className="oc-nav" aria-label="Form sections">
            {SECTIONS.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  type="button"
                  key={sec.id}
                  className={`oc-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(sec.id)}
                >
                  <div className="oc-nav-icon"><Icon size={16}/></div>
                  <span>{sec.name}</span>
                  <ChevronRight size={12} className="oc-nav-arrow"/>
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
              disabled={secIdx === 0}
              onClick={() => setActiveSection(SECTIONS[secIdx - 1].id)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
          </div>
          <div className="oc-footer-actions">
            <button type="button" className="oc-btn-cancel" onClick={closeOffcanvas}>Cancel</button>
            <button type="button" className="oc-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="spin" size={16}/> : <Save size={16}/>}
              {saving ? 'Saving...' : editId ? 'Update Company' : 'Create Company'}
            </button>
          </div>
          <div className="oc-footer__trail">
            {secIdx < SECTIONS.length - 1 ? (
              <button
                type="button"
                className="oc-btn-next"
                onClick={() => setActiveSection(SECTIONS[secIdx + 1].id)}
              >
                Next <ChevronRight size={14}/>
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

const FormField: React.FC<{ label: string; children: React.ReactNode; full?: boolean }> = ({ label, children, full }) => (
  <div className={`form-group${full ? ' full-width' : ''}`}>
    <label className="input-label">{label}</label>
    {children}
  </div>
);
export default Company;
