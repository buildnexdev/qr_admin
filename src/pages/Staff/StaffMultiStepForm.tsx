import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import {
  RESTAURANT_ROLES,
  DEFAULT_RESTAURANT_ROLE,
  isKnownRestaurantRole,
} from '../../const/restaurantRoles';
import type { StaffMember } from '../../store/staffSlice';

/** Two steps: all personal/work/ID data, then account + permissions + status */
const STEPS = ['Personal & work', 'Account & status'];

const DEPARTMENTS = ['Kitchen', 'Service', 'Billing', 'Delivery'];
const GENDERS = ['Male', 'Female', 'Other'];

export type StaffWizardPayload = Record<string, unknown>;

interface Props {
  initialData?: StaffMember | null;
  branchOptions: string[];
  onSubmit: (payload: StaffWizardPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function StudioField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="staff-form-field">
      <label className="staff-form-field__label">
        {label}
        {required ? <span className="staff-form-field__req"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function isLikelyUrl(s: string) {
  return /^https?:\/\//i.test(String(s).trim());
}

function parseDocuments(initialData?: StaffMember | null) {
  let raw: Record<string, string> = {};
  try {
    if (initialData?.documentsJson) {
      raw = { ...raw, ...JSON.parse(initialData.documentsJson) };
    }
  } catch {
    /* ignore */
  }
  const idProof = String(raw.idProof || '');
  const addressProof = String(raw.addressProof || '');
  return {
    aadharNumber: String(raw.aadharNumber || '').replace(/\D/g, '') ||
      (!idProof || isLikelyUrl(idProof) ? '' : idProof.replace(/\D/g, '')),
    panNumber: String(raw.panNumber || '').toUpperCase(),
    addressProofNumber: String(raw.addressProofNumber || '').replace(/\D/g, '') ||
      (!addressProof || isLikelyUrl(addressProof) ? '' : addressProof.replace(/\D/g, '')),
  };
}

function buildInitialState(initialData?: StaffMember | null): Record<string, unknown> {
  let permissionsObj = { useRolePermissions: true };
  try {
    if (initialData?.permissionsJson) {
      permissionsObj = { ...permissionsObj, ...JSON.parse(initialData.permissionsJson) };
    }
  } catch {
    /* ignore */
  }

  const doc = parseDocuments(initialData);

  return {
    name: initialData?.name || '',
    employeeId: initialData?.employeeId || '',
    gender: initialData?.gender || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    image: initialData?.image || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    role: initialData?.role || DEFAULT_RESTAURANT_ROLE,
    branch: initialData?.branch || '',
    department: initialData?.department || DEPARTMENTS[1],
    shiftTiming: initialData?.shiftTiming || '',
    joiningDate: initialData?.joiningDate || '',
    username: initialData?.username || '',
    password: '',
    confirmPassword: '',
    useRolePermissions: permissionsObj.useRolePermissions !== false,
    customPermissionsNote: (permissionsObj as { note?: string }).note || '',
    aadharNumber: doc.aadharNumber,
    panNumber: doc.panNumber,
    addressProofNumber: doc.addressProofNumber,
    qualification: initialData?.qualification || '',
    status:
      initialData?.status !== undefined ? Boolean(initialData.status) : true,
    isPublish:
      initialData?.isPublish !== undefined ? Boolean(initialData.isPublish) : true,
  };
}

const StaffMultiStepForm: React.FC<Props> = ({
  initialData,
  branchOptions,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEdit = !!initialData?.id;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => buildInitialState(initialData));
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(buildInitialState(initialData));
    setStep(0);
  }, [initialData]);

  const branches = useMemo(
    () => (branchOptions.length > 0 ? branchOptions : ['Main Branch']),
    [branchOptions]
  );

  useEffect(() => {
    if (initialData?.id || branches.length === 0) return;
    setForm((prev) => {
      if (String(prev.branch || '').trim()) return prev;
      return { ...prev, branch: branches[0] };
    });
  }, [branches, initialData?.id]);

  const setField = (name: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setField(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
  };

  const digitsOnly = (name: string, maxLen: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setField(name, v);
  };

  const panHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setField('panNumber', v);
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setField('image', String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const avatarSrc =
    String(form.image || '').trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(String(form.name || 'Staff'))}&background=f1f5f9&color=64748b`;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const buildApiPayload = (): StaffWizardPayload => {
    const permissionsJson = JSON.stringify({
      useRolePermissions: form.useRolePermissions,
      note: form.customPermissionsNote,
    });
    const documentsJson = JSON.stringify({
      aadharNumber: String(form.aadharNumber || '').replace(/\D/g, ''),
      panNumber: String(form.panNumber || '').trim(),
      addressProofNumber: String(form.addressProofNumber || '').replace(/\D/g, ''),
    });

    const payload: StaffWizardPayload = {
      name: form.name,
      employeeId: form.employeeId || undefined,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      image: form.image || undefined,
      phone: form.phone,
      alternatePhone: form.alternatePhone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      role: form.role,
      branch: form.branch,
      department: form.department || undefined,
      shiftTiming: form.shiftTiming || undefined,
      joiningDate: form.joiningDate || undefined,
      username: form.username || undefined,
      qualification: form.qualification || undefined,
      status: form.status,
      isPublish: form.isPublish,
      permissionsJson,
      documentsJson,
    };

    if (!isEdit && form.password) {
      payload.password = form.password;
    } else if (isEdit && String(form.password || '').trim()) {
      payload.password = form.password;
    }

    return payload;
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!String(form.name || '').trim()) return false;
      if (!String(form.phone || '').trim()) return false;
      if (!form.role || !form.branch) return false;
      return true;
    }
    if (step === 1) {
      if (!isEdit) {
        if (!String(form.password || '').trim()) return false;
        if (String(form.password) !== String(form.confirmPassword)) return false;
      } else if (String(form.password || '').trim()) {
        if (String(form.password) !== String(form.confirmPassword)) return false;
      }
    }
    return true;
  };

  const handlePrimaryAction = () => {
    if (isSubmitting) return;
    if (!validateStep()) return;
    if (step < STEPS.length - 1) goNext();
    else onSubmit(buildApiPayload());
  };

  return (
    <div className="staff-wizard staff-wizard--ledger">
      <div className="staff-segment" role="tablist" aria-label="Form steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={step === i}
            className={`staff-segment__btn ${step === i ? 'is-active' : ''}`}
            onClick={() => setStep(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="staff-wizard__body staff-wizard__body--scroll">
        {step === 0 && (
          <div className="staff-form-page">
            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Profile</h3>
            <div className="staff-form-personal">
              <div className="staff-form-avatar-col">
                <div className="staff-form-avatar-ring">
                  <img className="staff-form-avatar-img" src={avatarSrc} alt="" />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handlePhotoFile}
                />
                <button
                  type="button"
                  className="staff-form-btn-upload"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={15} strokeWidth={2.25} /> Upload
                </button>
                <StudioField label="Image URL (optional)" required={false}>
                  <input
                    name="image"
                    value={String(form.image)}
                    onChange={handleChange}
                    className="staff-form-input"
                    placeholder="https://… or use Upload"
                    autoComplete="off"
                  />
                </StudioField>
              </div>
              <div className="staff-form-grid">
                <StudioField label="Staff name" required>
                  <input
                    name="name"
                    value={String(form.name)}
                    onChange={handleChange}
                    className="staff-form-input"
                    required
                  />
                </StudioField>
                <StudioField label="Employee ID" required={false}>
                  <input
                    name="employeeId"
                    value={String(form.employeeId)}
                    onChange={handleChange}
                    className="staff-form-input"
                    placeholder="Auto if blank"
                  />
                </StudioField>
                <StudioField label="Gender" required={false}>
                  <select
                    name="gender"
                    value={String(form.gender)}
                    onChange={handleChange}
                    className="staff-form-input staff-form-select"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </StudioField>
                <StudioField label="Date of birth" required={false}>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={String(form.dateOfBirth)}
                    onChange={handleChange}
                    className="staff-form-input"
                  />
                </StudioField>
              </div>
            </div>
            </section>

            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Contact</h3>
            <div className="staff-form-grid">
              <StudioField label="Mobile number" required>
                <input
                  name="phone"
                  value={String(form.phone)}
                  onChange={handleChange}
                  className="staff-form-input"
                  inputMode="numeric"
                  required
                />
              </StudioField>
              <StudioField label="Alternate phone" required={false}>
                <input
                  name="alternatePhone"
                  value={String(form.alternatePhone)}
                  onChange={handleChange}
                  className="staff-form-input"
                  inputMode="numeric"
                />
              </StudioField>
              <StudioField label="Email" required={false}>
                <input
                  name="email"
                  type="email"
                  value={String(form.email)}
                  onChange={handleChange}
                  className="staff-form-input"
                />
              </StudioField>
              <div className="staff-form-col-span">
                <StudioField label="Address" required={false}>
                  <textarea
                    name="address"
                    value={String(form.address)}
                    onChange={handleChange}
                    rows={3}
                    className="staff-form-input staff-form-textarea"
                  />
                </StudioField>
              </div>
            </div>
            </section>

            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Work</h3>
            <div className="staff-form-grid">
              <StudioField label="Role" required>
                <select
                  name="role"
                  value={String(form.role)}
                  onChange={handleChange}
                  className="staff-form-input staff-form-select"
                >
                  {String(form.role) && !isKnownRestaurantRole(String(form.role)) ? (
                    <option value={String(form.role)}>{String(form.role)} (current)</option>
                  ) : null}
                  {RESTAURANT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </StudioField>
              <StudioField label="Branch" required>
                <select
                  name="branch"
                  value={String(form.branch || branches[0])}
                  onChange={handleChange}
                  className="staff-form-input staff-form-select"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </StudioField>
              <StudioField label="Department" required={false}>
                <select
                  name="department"
                  value={String(form.department)}
                  onChange={handleChange}
                  className="staff-form-input staff-form-select"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </StudioField>
              <StudioField label="Joining date" required={false}>
                <input
                  name="joiningDate"
                  type="date"
                  value={String(form.joiningDate)}
                  onChange={handleChange}
                  className="staff-form-input"
                />
              </StudioField>
              <StudioField label="Shift timing" required={false}>
                <input
                  name="shiftTiming"
                  value={String(form.shiftTiming)}
                  onChange={handleChange}
                  className="staff-form-input"
                  placeholder="e.g. 10:00–19:00"
                />
              </StudioField>
              <StudioField label="Qualification" required={false}>
                <input
                  name="qualification"
                  value={String(form.qualification)}
                  onChange={handleChange}
                  className="staff-form-input"
                />
              </StudioField>
            </div>
            </section>

            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">ID numbers</h3>
            <p className="staff-form-card__hint">Enter document numbers only (no file uploads).</p>
            <div className="staff-form-grid">
              <StudioField label="Aadhar number" required={false}>
                <input
                  name="aadharNumber"
                  value={String(form.aadharNumber)}
                  onChange={digitsOnly('aadharNumber', 12)}
                  className="staff-form-input"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter Aadhar number"
                  maxLength={12}
                />
              </StudioField>
              <StudioField label="PAN" required={false}>
                <input
                  name="panNumber"
                  value={String(form.panNumber)}
                  onChange={panHandler}
                  className="staff-form-input"
                  autoComplete="off"
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                />
              </StudioField>
              <StudioField label="Address proof no." required={false}>
                <input
                  name="addressProofNumber"
                  value={String(form.addressProofNumber)}
                  onChange={digitsOnly('addressProofNumber', 20)}
                  className="staff-form-input"
                  inputMode="numeric"
                  placeholder="Document / reference number"
                />
              </StudioField>
            </div>
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="staff-form-page">
            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Login</h3>
            <div className="staff-form-grid">
              <div className="staff-form-col-span">
                <StudioField label="Username" required={false}>
                  <input
                    name="username"
                    value={String(form.username)}
                    onChange={handleChange}
                    className="staff-form-input"
                    autoComplete="off"
                  />
                </StudioField>
              </div>
              <div className="staff-form-col-span">
                <StudioField label={isEdit ? 'New password (optional)' : 'Password'} required={!isEdit}>
                  <div className="staff-form-input-wrap">
                    <input
                      name="password"
                      type={showPwd ? 'text' : 'password'}
                      value={String(form.password)}
                      onChange={handleChange}
                      className="staff-form-input staff-form-input--has-action"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="staff-form-input-action"
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </StudioField>
              </div>
              <div className="staff-form-col-span">
                <StudioField label="Confirm password" required={!isEdit}>
                  <div className="staff-form-input-wrap">
                    <input
                      name="confirmPassword"
                      type={showPwd2 ? 'text' : 'password'}
                      value={String(form.confirmPassword)}
                      onChange={handleChange}
                      className="staff-form-input staff-form-input--has-action"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="staff-form-input-action"
                      onClick={() => setShowPwd2((v) => !v)}
                      aria-label={showPwd2 ? 'Hide password' : 'Show password'}
                    >
                      {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </StudioField>
              </div>
              <p className="staff-form-hint staff-form-col-span mb-0">
                Passwords are stored on the server; use a strong password in production.
              </p>
            </div>
            </section>

            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Permissions</h3>
            <div className="staff-form-stack">
              <label className="staff-form-check">
                <input
                  type="checkbox"
                  name="useRolePermissions"
                  checked={Boolean(form.useRolePermissions)}
                  onChange={handleChange}
                />
                <span>Use role default permissions</span>
              </label>
              {!form.useRolePermissions ? (
                <StudioField label="Custom permission notes" required={false}>
                  <textarea
                    name="customPermissionsNote"
                    value={String(form.customPermissionsNote)}
                    onChange={handleChange}
                    rows={4}
                    className="staff-form-input staff-form-textarea"
                    placeholder="Describe overrides…"
                  />
                </StudioField>
              ) : null}
            </div>
            </section>

            <section className="staff-form-card">
            <h3 className="staff-form-card__heading">Status</h3>
            <div className="staff-form-stack">
              <label className="staff-form-check">
                <input type="checkbox" name="status" checked={Boolean(form.status)} onChange={handleChange} />
                <span>Active (can access assigned tasks)</span>
              </label>
              <label className="staff-form-check">
                <input type="checkbox" name="isPublish" checked={Boolean(form.isPublish)} onChange={handleChange} />
                <span>Published (visible in tenant apps)</span>
              </label>
            </div>
            </section>
          </div>
        )}
      </div>

      <div className="staff-wizard__footer staff-wizard__footer--ledger">
        <button
          type="button"
          className="staff-ledger-btn staff-ledger-btn--ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <div className="d-flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              className="staff-ledger-btn staff-ledger-btn--ghost"
              onClick={goBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="staff-ledger-btn staff-ledger-btn--primary"
            onClick={handlePrimaryAction}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving…'
              : step < STEPS.length - 1
                ? 'Next'
                : isEdit
                  ? 'Save changes'
                  : 'Add staff'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffMultiStepForm;
