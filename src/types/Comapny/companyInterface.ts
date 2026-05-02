import {
  Building2,
  MapPin,
  Phone,
  User,
  Settings,
  CreditCard,
  QrCode,
  Utensils,
  Wallet,
  FileText,
  ChefHat,
  Users,
  BarChart3,
  Package,
  Ticket,
  Truck,
  Bell,
  Palette,
  Shield,
  FileUp,
} from 'lucide-react';

export interface CompanyType {
  owner_name: string;
  id: number;
  company_name: string;
  company_code: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  is_published: boolean;
}

export const EMPTY_FORM = {
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
};

export const SECTIONS = [
  { id: 'basic',    name: 'Basic Details',    icon: Building2 },
  { id: 'address',  name: 'Address Details',  icon: MapPin },
  { id: 'contact',  name: 'Contact Details',  icon: Phone },
  { id: 'owner',    name: 'Owner / Admin',    icon: User },
  { id: 'branch',   name: 'Branch Config',    icon: Settings },
  { id: 'subscription', name: 'Subscription', icon: CreditCard },
  { id: 'qr',       name: 'QR & Ordering',   icon: QrCode },
  { id: 'menu',     name: 'Menu & Pricing',   icon: Utensils },
  { id: 'payment',  name: 'Payment',          icon: Wallet },
  { id: 'invoice',  name: 'Invoice & Billing',icon: FileText },
  { id: 'kitchen',  name: 'Kitchen Settings', icon: ChefHat },
  { id: 'staff',    name: 'Staff & Roles',    icon: Users },
  { id: 'reports',  name: 'Reports',          icon: BarChart3 },
  { id: 'inventory',name: 'Inventory',        icon: Package },
  { id: 'offers',   name: 'Offers & Coupons', icon: Ticket },
  { id: 'delivery', name: 'Delivery',         icon: Truck },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'branding', name: 'Branding & UI',    icon: Palette },
  { id: 'security', name: 'Security',         icon: Shield },
  { id: 'documents',name: 'Documents',        icon: FileUp },
];