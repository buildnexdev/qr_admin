import { COMPANY_FORM_SECTIONS } from '../../types/Comapny/companyInterface';

export type CompanyFormValidationOptions = {
  isEdit: boolean;
};

/** Maps form field keys to wizard section ids */
export const COMPANY_FIELD_SECTION: Record<string, string> = {
  company_name: 'basic',
  company_code: 'basic',
  legal_name: 'basic',
  business_type: 'basic',
  industry_category: 'basic',
  gst_number: 'basic',
  pan_number: 'basic',
  cin_number: 'basic',
  address_line1: 'address',
  address_line2: 'address',
  city: 'address',
  state: 'address',
  country: 'address',
  pincode: 'address',
  map_location: 'address',
  landmark: 'address',
  primary_phone: 'contact',
  secondary_phone: 'contact',
  whatsapp_number: 'contact',
  email_id: 'contact',
  website_url: 'contact',
  owner_name: 'owner',
  owner_mobile: 'owner',
  owner_email: 'owner',
  admin_username: 'owner',
  admin_password: 'owner',
};

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function normalizeIndiaMobile(input: string): string {
  const d = input.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d;
}

export function isValidIndiaMobile(input: string): boolean {
  const d = normalizeIndiaMobile(input);
  return d.length === 10 && /^[6-9]\d{9}$/.test(d);
}

function str(v: unknown): string {
  return String(v ?? '').trim();
}

function isValidEmail(s: string): boolean {
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidOptionalUrl(s: string): boolean {
  if (!s) return true;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidMapLocation(s: string): boolean {
  if (!s) return true;
  const parts = s.split(',').map((p) => p.trim());
  if (parts.length < 2) return false;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/** Validate a single wizard section (used on Next). */
export function validateCompanyFormSection(
  section: string,
  form: Record<string, unknown>,
  opts: CompanyFormValidationOptions
): Record<string, string> {
  const e: Record<string, string> = {};
  const { isEdit } = opts;

  if (section === 'basic') {
    const name = str(form.company_name);
    if (!name) e.company_name = 'Company name is required.';
    else if (name.length < 2) e.company_name = 'Enter at least 2 characters.';
    else if (name.length > 255) e.company_name = 'Company name is too long.';

    const code = str(form.company_code);
    if (code && !/^[A-Za-z0-9_-]+$/.test(code)) {
      e.company_code = 'Use only letters, numbers, hyphen, or underscore.';
    }

    const gst = str(form.gst_number).replace(/\s/g, '');
    if (gst && !GSTIN_RE.test(gst.toUpperCase())) {
      e.gst_number = 'Enter a valid 15-character GSTIN.';
    }

    const pan = str(form.pan_number).replace(/\s/g, '');
    if (pan && !PAN_RE.test(pan.toUpperCase())) {
      e.pan_number = 'Enter a valid PAN (e.g. ABCDE1234F).';
    }
  }

  if (section === 'address') {
    if (!str(form.address_line1)) e.address_line1 = 'Address line 1 is required.';
    if (!str(form.city)) e.city = 'City is required.';
    if (!str(form.state)) e.state = 'State is required.';
    if (!str(form.country)) e.country = 'Country is required.';
    const pin = str(form.pincode).replace(/\s/g, '');
    if (!pin) e.pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(pin)) e.pincode = 'Enter a valid 6-digit pincode.';
    const map = str(form.map_location);
    if (!isValidMapLocation(map)) e.map_location = 'Use format: latitude, longitude (e.g. 12.9716, 77.5946).';
  }

  if (section === 'contact') {
    if (!str(form.primary_phone)) e.primary_phone = 'Primary phone is required.';
    else if (!isValidIndiaMobile(str(form.primary_phone))) {
      e.primary_phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    const sec = str(form.secondary_phone);
    if (sec && !isValidIndiaMobile(sec)) e.secondary_phone = 'Enter a valid mobile number or leave blank.';

    const wa = str(form.whatsapp_number);
    if (wa && !isValidIndiaMobile(wa)) e.whatsapp_number = 'Enter a valid WhatsApp number or leave blank.';

    const em = str(form.email_id);
    if (!em) e.email_id = 'Email is required.';
    else if (!isValidEmail(em)) e.email_id = 'Enter a valid email address.';

    const web = str(form.website_url);
    if (!isValidOptionalUrl(web)) e.website_url = 'Enter a valid URL starting with http:// or https://';
  }

  if (section === 'owner') {
    if (!str(form.owner_name)) e.owner_name = 'Owner name is required.';
    if (!str(form.owner_mobile)) e.owner_mobile = 'Owner mobile is required.';
    else if (!isValidIndiaMobile(str(form.owner_mobile))) {
      e.owner_mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    const oe = str(form.owner_email);
    if (!oe) e.owner_email = 'Owner email is required.';
    else if (!isValidEmail(oe)) e.owner_email = 'Enter a valid email address.';

    const pwd = str(form.admin_password);
    if (!isEdit) {
      if (!pwd) e.admin_password = 'Password is required to create the admin login.';
      else if (pwd.length < 6) e.admin_password = 'Use at least 6 characters.';
    } else if (pwd && pwd.length < 6) {
      e.admin_password = 'New password must be at least 6 characters, or leave blank to keep current.';
    }
  }

  return e;
}

/** Full form validation (used on Save). */
export function validateCompanyForm(
  form: Record<string, unknown>,
  opts: CompanyFormValidationOptions
): { valid: boolean; errors: Record<string, string>; firstErrorSection: string | null } {
  const errors: Record<string, string> = {};
  for (const { id } of COMPANY_FORM_SECTIONS) {
    if (id === 'company-settings') continue;
    Object.assign(errors, validateCompanyFormSection(id, form, opts));
  }
  const keys = Object.keys(errors);
  if (!keys.length) return { valid: true, errors: {}, firstErrorSection: null };

  for (const { id } of COMPANY_FORM_SECTIONS) {
    if (keys.some((k) => COMPANY_FIELD_SECTION[k] === id)) {
      return { valid: false, errors, firstErrorSection: id };
    }
  }
  return { valid: false, errors, firstErrorSection: 'basic' };
}

/** Remove field errors belonging to one section (before re-validating that section). */
export function stripErrorsForSection(prev: Record<string, string>, sectionId: string): Record<string, string> {
  const next = { ...prev };
  for (const k of Object.keys(next)) {
    if (COMPANY_FIELD_SECTION[k] === sectionId) delete next[k];
  }
  return next;
}
