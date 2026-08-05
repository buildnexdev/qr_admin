import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Utensils,
  Wallet,
  FileText,
  ChefHat,
  BarChart3,
  Package,
  Ticket,
  Truck,
  SlidersHorizontal,
} from 'lucide-react';

export interface CompanyType {
  id: number;
  company_name: string;
  company_code: string;
  owner_name: string;
  address_line1?: string;
  city: string;
  state: string;
  pincode: string;
  is_active: boolean;
}

/** tblCompany tinyint(1) fields toggled in Company Settings (0 = off, 1 = on). */
export type CompanyModuleFlagKey =
  | 'is_subscription'
  | 'is_qr'
  | 'is_menu'
  | 'is_payment'
  | 'is_invoice'
  | 'is_kitchen'
  | 'is_reports'
  | 'is_inventory'
  | 'is_offers'
  | 'is_delivery';

export interface CompanyModuleSettingRow {
  id: CompanyModuleFlagKey;
  name: string;
  icon: LucideIcon;
}

export const COMPANY_MODULE_SETTINGS: CompanyModuleSettingRow[] = [
  { id: 'is_subscription', name: 'Subscription', icon: CreditCard },
  { id: 'is_qr', name: 'QR', icon: QrCode },
  { id: 'is_menu', name: 'Menu', icon: Utensils },
  { id: 'is_payment', name: 'Payment', icon: Wallet },
  { id: 'is_invoice', name: 'Invoice', icon: FileText },
  { id: 'is_kitchen', name: 'Kitchen', icon: ChefHat },
  { id: 'is_reports', name: 'Reports', icon: BarChart3 },
  { id: 'is_inventory', name: 'Inventory', icon: Package },
  { id: 'is_offers', name: 'Offers', icon: Ticket },
  { id: 'is_delivery', name: 'Delivery', icon: Truck },
];

export const EMPTY_FORM: Record<string, unknown> = {
  company_name: '',
  company_code: '',
  legal_name: '',
  business_type: 'Restaurant',
  industry_category: '',
  gst_number: '',
  pan_number: '',
  cin_number: '',
  address_line1: '',
  address_line2: '',
  area_street: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  map_location: '',
  landmark: '',
  primary_phone: '',
  secondary_phone: '',
  whatsapp_number: '',
  email_id: '',
  website_url: '',
  owner_name: '',
  owner_mobile: '',
  owner_email: '',
  admin_username: '',
  admin_password: '',
  is_active: true,
  is_subscription: 0,
  is_qr: 0,
  is_menu: 0,
  is_payment: 0,
  is_invoice: 0,
  is_kitchen: 0,
  is_reports: 0,
  is_inventory: 0,
  is_offers: 0,
  is_delivery: 0,
};

export const COMPANY_FORM_SECTIONS = [
  { id: 'basic', name: 'Basic', icon: Building2 },
  { id: 'address', name: 'Address', icon: MapPin },
  { id: 'contact', name: 'Contact', icon: Phone },
  { id: 'owner', name: 'Owner', icon: User },
  { id: 'company-settings', name: 'Company Settings', icon: SlidersHorizontal },
];

export function normalizeCompanyFormFromApi(raw: Record<string, unknown>) {
  const o: Record<string, unknown> = { ...EMPTY_FORM, ...raw, admin_password: '' };
  for (const { id } of COMPANY_MODULE_SETTINGS) {
    const v = raw[id];
    o[id] = v === 1 || v === '1' || v === true ? 1 : 0;
  }
  o.is_active = raw.is_active === true || raw.is_active === 1 || raw.is_active === '1';
  return o;
}
