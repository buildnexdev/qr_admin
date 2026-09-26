import { useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Monitor,
  FileText,
  Percent,
  ClipboardList,
  Grid3X3,
  ChefHat,
  UtensilsCrossed,
  Boxes,
  Users,
  QrCode,
  Bell,
  Receipt,
  Settings,
  MapPin,
  Shield,
} from 'lucide-react';
import { ConfigFormPage, type FieldDef } from './ConfigFormPage';
import { TaxConfigPanel } from './panels/TaxConfigPanel';
import { PaymentConfigPanel } from './panels/PaymentConfigPanel';
import { PrinterConfigPanel } from './panels/PrinterConfigPanel';
import { HoursConfigPanel } from './panels/HoursConfigPanel';
import { DiscountConfigPanel } from './panels/DiscountConfigPanel';
import { KotStationsPanel } from './panels/KotStationsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/organisms/PageHeader';

function useBranchId() {
  const [params] = useSearchParams();
  const raw = params.get('branchId');
  return raw ? Number(raw) : null;
}

function ReceiptPreview({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="mx-auto max-w-[280px] rounded-lg border border-dashed border-border bg-muted/30 p-4 font-mono text-[11px] leading-relaxed text-foreground">
      {Boolean(data.showLogo) && (
        <div className="mb-2 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
            QR
          </div>
        </div>
      )}
      {Boolean(data.showRestaurantName) && (
        <p className="text-center font-bold text-sm">Your Restaurant</p>
      )}
      {Boolean(data.showAddress) && <p className="text-center text-muted-foreground">123 Main St, City</p>}
      {Boolean(data.showPhone) && <p className="text-center text-muted-foreground">+91 98765 43210</p>}
      {Boolean(data.showGstin) && <p className="text-center">GSTIN: 29XXXXX1234X1Z5</p>}
      <div className="my-2 border-t border-dashed border-border" />
      {Boolean(data.showInvoiceNumber) && <p>Invoice: INV-00042</p>}
      {Boolean(data.showOrderNumber) && <p>Order: ORD-0108</p>}
      {Boolean(data.showTable) && <p>Table: T-05</p>}
      {Boolean(data.showCashier) && <p>Cashier: Priya</p>}
      {Boolean(data.showCustomer) && <p>Guest: Rahul</p>}
      <div className="my-2 border-t border-dashed border-border" />
      <div className="flex justify-between"><span>Butter Chicken x1</span><span>320.00</span></div>
      <div className="flex justify-between"><span>Naan x2</span><span>80.00</span></div>
      {Boolean(data.showDiscount) && (
        <div className="flex justify-between text-success"><span>Discount</span><span>-20.00</span></div>
      )}
      {Boolean(data.showTax) && (
        <>
          <div className="flex justify-between"><span>CGST 2.5%</span><span>9.50</span></div>
          <div className="flex justify-between"><span>SGST 2.5%</span><span>9.50</span></div>
        </>
      )}
      <div className="my-2 border-t border-border" />
      <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>₹399.00</span></div>
      {Boolean(data.showPayment) && <p className="mt-1">Paid via UPI</p>}
      {data.footer ? (
        <p className="mt-3 text-center text-muted-foreground">{String(data.footer)}</p>
      ) : null}
    </div>
  );
}

function InvoicePreview({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-2">
      {Boolean(data.showLogo) && (
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
          QR
        </div>
      )}
      <p className="font-semibold">Tax Invoice</p>
      <p className="text-xs text-muted-foreground">
        #{String(data.invoicePrefix || 'INV')}-0001 · {String(data.dateFormat || 'DD/MM/YYYY')}
      </p>
      {Boolean(data.showGst) && <p className="text-xs">GSTIN shown on invoice</p>}
      {Boolean(data.showTaxBreakup) && (
        <div className="text-xs space-y-1 border-t pt-2">
          <div className="flex justify-between"><span>Taxable</span><span>₹380.00</span></div>
          <div className="flex justify-between"><span>CGST</span><span>₹9.50</span></div>
          <div className="flex justify-between"><span>SGST</span><span>₹9.50</span></div>
        </div>
      )}
      {data.footer ? <p className="text-xs text-muted-foreground pt-2">{String(data.footer)}</p> : null}
      {data.terms ? <p className="text-[10px] text-muted-foreground">{String(data.terms)}</p> : null}
    </div>
  );
}

const restaurantFields: FieldDef[] = [
  { key: 'restaurantName', label: 'Restaurant name', type: 'text', required: true },
  { key: 'logo', label: 'Logo URL', type: 'url', help: 'Used on invoice, receipt, QR menu' },
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'phone', label: 'Phone', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'gstin', label: 'GSTIN', type: 'text' },
  { key: 'fssai', label: 'FSSAI number', type: 'text' },
  { key: 'currency', label: 'Currency', type: 'select', options: [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'AED', label: 'AED' },
  ]},
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'timezone', label: 'Timezone', type: 'text', help: 'e.g. Asia/Kolkata' },
];

const posFields: FieldDef[] = [
  { key: 'dineIn', label: 'Dine In', type: 'nested-switch', parent: 'orderTypes', nestedKey: 'dineIn' },
  { key: 'takeaway', label: 'Takeaway', type: 'nested-switch', parent: 'orderTypes', nestedKey: 'takeaway' },
  { key: 'delivery', label: 'Delivery', type: 'nested-switch', parent: 'orderTypes', nestedKey: 'delivery' },
  { key: 'online', label: 'Online Order', type: 'nested-switch', parent: 'orderTypes', nestedKey: 'online' },
  { key: 'autoSaveCart', label: 'Auto-save cart', type: 'switch' },
  { key: 'holdOrders', label: 'Hold orders', type: 'switch' },
  { key: 'resumeOrders', label: 'Resume held orders', type: 'switch' },
  { key: 'allowCancellation', label: 'Allow order cancellation', type: 'switch' },
  { key: 'requireCancellationReason', label: 'Require cancellation reason', type: 'switch' },
  { key: 'allowItemRemoval', label: 'Allow item removal', type: 'switch' },
  { key: 'allowQuantityEdit', label: 'Allow quantity editing', type: 'switch' },
  { key: 'enableBarcode', label: 'Enable barcode scanning', type: 'switch' },
  { key: 'enableCustomerSelection', label: 'Enable customer selection', type: 'switch' },
  { key: 'enableTableSelection', label: 'Enable table selection', type: 'switch' },
  { key: 'orderNumberPrefix', label: 'Order number prefix', type: 'text' },
  { key: 'invoicePrefix', label: 'Invoice prefix', type: 'text' },
  { key: 'kotPrefix', label: 'KOT prefix', type: 'text' },
  { key: 'orderStartNumber', label: 'Order starting number', type: 'number' },
  { key: 'invoiceStartNumber', label: 'Invoice starting number', type: 'number' },
  { key: 'kotStartNumber', label: 'KOT starting number', type: 'number' },
];

const billingFields: FieldDef[] = [
  { key: 'invoicePrefix', label: 'Invoice prefix', type: 'text' },
  { key: 'invoiceNumbering', label: 'Numbering', type: 'select', options: [
    { value: 'sequential', label: 'Sequential' },
    { value: 'daily', label: 'Reset daily' },
    { value: 'monthly', label: 'Reset monthly' },
  ]},
  { key: 'invoiceFormat', label: 'Format', type: 'select', options: [
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' },
    { value: 'gst', label: 'GST detailed' },
  ]},
  { key: 'dateFormat', label: 'Date format', type: 'select', options: [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ]},
  { key: 'footer', label: 'Invoice footer', type: 'textarea' },
  { key: 'terms', label: 'Terms & conditions', type: 'textarea' },
  { key: 'showLogo', label: 'Show restaurant logo', type: 'switch' },
  { key: 'showGst', label: 'Show GST details', type: 'switch' },
  { key: 'showCashier', label: 'Show cashier name', type: 'switch' },
  { key: 'showCustomer', label: 'Show customer details', type: 'switch' },
  { key: 'showPaymentMethod', label: 'Show payment method', type: 'switch' },
  { key: 'showDiscount', label: 'Show discount', type: 'switch' },
  { key: 'showTaxBreakup', label: 'Show tax breakup', type: 'switch' },
  { key: 'roundOff', label: 'Round-off total', type: 'switch' },
];

const orderFields: FieldDef[] = [
  { key: 'dineIn', label: 'Enable dine-in', type: 'switch' },
  { key: 'takeaway', label: 'Enable takeaway', type: 'switch' },
  { key: 'delivery', label: 'Enable delivery', type: 'switch' },
  { key: 'online', label: 'Enable online orders', type: 'switch' },
  { key: 'minOrderValue', label: 'Minimum order value', type: 'number' },
  { key: 'deliveryCharge', label: 'Delivery charge', type: 'number' },
  { key: 'packagingCharge', label: 'Packaging charge', type: 'number' },
  { key: 'serviceCharge', label: 'Service charge %', type: 'number' },
  { key: 'orderTimeoutMinutes', label: 'Order timeout (minutes)', type: 'number' },
  { key: 'autoAccept', label: 'Auto accept orders', type: 'switch' },
  { key: 'requireCustomerPhone', label: 'Require customer phone', type: 'switch' },
  { key: 'requireTableNumber', label: 'Require table number', type: 'switch' },
  { key: 'allowOrderNotes', label: 'Allow order notes', type: 'switch' },
];

const tableFields: FieldDef[] = [
  { key: 'defaultCapacity', label: 'Default table capacity', type: 'number' },
  { key: 'enableFloorPlan', label: 'Enable floor plan layout', type: 'switch' },
];

const kotFields: FieldDef[] = [
  { key: 'enabled', label: 'Enable KOT', type: 'switch' },
  { key: 'autoPrint', label: 'Auto print KOT', type: 'switch' },
  { key: 'numberFormat', label: 'KOT number format', type: 'text', help: 'e.g. KOT-{NNNN}' },
  { key: 'header', label: 'KOT header', type: 'text' },
  { key: 'footer', label: 'KOT footer', type: 'text' },
  { key: 'showWaiter', label: 'Show waiter', type: 'switch' },
  { key: 'showTable', label: 'Show table', type: 'switch' },
  { key: 'showCustomer', label: 'Show customer', type: 'switch' },
  { key: 'showOrderNotes', label: 'Show order notes', type: 'switch' },
  { key: 'showModifiers', label: 'Show modifiers', type: 'switch' },
];

const menuFields: FieldDef[] = [
  { key: 'enableVariants', label: 'Enable variants', type: 'switch' },
  { key: 'enableAddons', label: 'Enable add-ons', type: 'switch' },
  { key: 'enableCombos', label: 'Enable combos', type: 'switch' },
  { key: 'regular', label: 'Regular price channel', type: 'nested-switch', parent: 'priceChannels', nestedKey: 'regular' },
  { key: 'takeaway', label: 'Takeaway price channel', type: 'nested-switch', parent: 'priceChannels', nestedKey: 'takeaway' },
  { key: 'delivery', label: 'Delivery price channel', type: 'nested-switch', parent: 'priceChannels', nestedKey: 'delivery' },
  { key: 'special', label: 'Special price channel', type: 'nested-switch', parent: 'priceChannels', nestedKey: 'special' },
];

const inventoryFields: FieldDef[] = [
  { key: 'enabled', label: 'Inventory enabled', type: 'switch' },
  { key: 'lowStockThreshold', label: 'Low-stock threshold', type: 'number' },
  { key: 'reorderLevel', label: 'Reorder level', type: 'number' },
  { key: 'autoDeduction', label: 'Auto-deduct on sale', type: 'switch' },
  { key: 'allowWastage', label: 'Allow wastage entries', type: 'switch' },
  { key: 'allowTransfer', label: 'Allow stock transfer', type: 'switch' },
];

const customerFields: FieldDef[] = [
  { key: 'allowCreation', label: 'Allow customer creation', type: 'switch' },
  { key: 'phoneRequired', label: 'Phone number required', type: 'switch' },
  { key: 'emailOptional', label: 'Email optional', type: 'switch' },
  { key: 'collectGst', label: 'Collect customer GST', type: 'switch' },
  { key: 'collectAddress', label: 'Collect address', type: 'switch' },
  { key: 'loyaltyEnabled', label: 'Loyalty support', type: 'switch' },
  { key: 'showHistory', label: 'Show customer history', type: 'switch' },
];

const qrFields: FieldDef[] = [
  { key: 'enabled', label: 'QR ordering enabled', type: 'switch' },
  { key: 'tableQr', label: 'Table QR', type: 'switch' },
  { key: 'branchQr', label: 'Branch QR', type: 'switch' },
  { key: 'menuVisibility', label: 'Menu visibility', type: 'select', options: [
    { value: 'all', label: 'All items' },
    { value: 'available', label: 'Available only' },
    { value: 'featured', label: 'Featured only' },
  ]},
  { key: 'requirePhone', label: 'Require phone number', type: 'switch' },
  { key: 'allowOrderNotes', label: 'Allow order notes', type: 'switch' },
  { key: 'autoAccept', label: 'Auto accept QR orders', type: 'switch' },
  { key: 'kitchenNotification', label: 'Kitchen notification', type: 'switch' },
  { key: 'orderConfirmation', label: 'Order confirmation', type: 'switch' },
];

const receiptFields: FieldDef[] = [
  { key: 'showLogo', label: 'Logo', type: 'switch' },
  { key: 'showRestaurantName', label: 'Restaurant name', type: 'switch' },
  { key: 'showAddress', label: 'Address', type: 'switch' },
  { key: 'showPhone', label: 'Phone', type: 'switch' },
  { key: 'showGstin', label: 'GSTIN', type: 'switch' },
  { key: 'showInvoiceNumber', label: 'Invoice number', type: 'switch' },
  { key: 'showOrderNumber', label: 'Order number', type: 'switch' },
  { key: 'showTable', label: 'Table', type: 'switch' },
  { key: 'showCashier', label: 'Cashier', type: 'switch' },
  { key: 'showCustomer', label: 'Customer', type: 'switch' },
  { key: 'showPayment', label: 'Payment', type: 'switch' },
  { key: 'showTax', label: 'Tax', type: 'switch' },
  { key: 'showDiscount', label: 'Discount', type: 'switch' },
  { key: 'footer', label: 'Footer text', type: 'textarea' },
];

const notificationFields: FieldDef[] = [
  { key: 'smsEnabled', label: 'SMS enabled', type: 'switch' },
  { key: 'emailEnabled', label: 'Email enabled', type: 'switch' },
  { key: 'whatsappEnabled', label: 'WhatsApp enabled', type: 'switch' },
  { key: 'orderAlerts', label: 'Order alerts', type: 'switch' },
  { key: 'lowStockAlerts', label: 'Low stock alerts', type: 'switch' },
];

const generalFields: FieldDef[] = [
  { key: 'language', label: 'Language', type: 'select', options: [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ta', label: 'Tamil' },
  ]},
  { key: 'theme', label: 'Theme', type: 'select', options: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]},
  { key: 'dateFormat', label: 'Date format', type: 'text' },
  { key: 'timeFormat', label: 'Time format', type: 'select', options: [
    { value: '12h', label: '12-hour' },
    { value: '24h', label: '24-hour' },
  ]},
  { key: 'sessionTimeoutMinutes', label: 'Session timeout (minutes)', type: 'number' },
];

const taxPolicyFields: FieldDef[] = [
  { key: 'pricingMode', label: 'Pricing mode', type: 'select', options: [
    { value: 'exclusive', label: 'Tax exclusive' },
    { value: 'inclusive', label: 'Tax inclusive' },
  ], help: 'Applied by centralized tax calculator in POS & QR' },
  { key: 'enableGst', label: 'Enable GST', type: 'switch' },
  { key: 'enableCgstSgst', label: 'Enable CGST + SGST', type: 'switch' },
  { key: 'enableIgst', label: 'Enable IGST (inter-state)', type: 'switch' },
  { key: 'defaultTaxCode', label: 'Default tax code', type: 'text', help: 'e.g. GST18' },
  { key: 'serviceChargePercent', label: 'Service charge %', type: 'number' },
];

export function RestaurantConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="restaurant"
      title="Restaurant Profile"
      description="Business information reused across invoice, receipt, QR menu, reports & KOT."
      icon={Building2}
      fields={restaurantFields}
      branchId={branchId}
    />
  );
}

export function PosConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="pos"
      title="POS Settings"
      description="Controls cart behavior, order types and document numbering on the POS screen."
      icon={Monitor}
      fields={posFields}
      branchId={branchId}
      dangerNote="Changing invoice/order starting numbers may affect future documents. Continue?"
    />
  );
}

export function BillingConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="billing"
      title="Billing & Invoice"
      description="Invoice layout and display options with live preview."
      icon={FileText}
      fields={billingFields}
      branchId={branchId}
      preview={(data) => <InvoicePreview data={data} />}
    />
  );
}

export function TaxConfigPage() {
  const branchId = useBranchId();
  return (
    <div className="space-y-8">
      <ConfigFormPage
        configType="tax"
        title="Tax & GST Policy"
        description="Centralized tax mode used by POS, invoices, reports and QR ordering."
        icon={Percent}
        fields={taxPolicyFields}
        branchId={branchId}
      />
      <TaxConfigPanel branchId={branchId} />
    </div>
  );
}

export function OrderConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="order"
      title="Order Settings"
      description="Channel rules, charges and acceptance behavior."
      icon={ClipboardList}
      fields={orderFields}
      branchId={branchId}
    />
  );
}

export function TableConfigPage() {
  const branchId = useBranchId();
  return (
    <div className="space-y-6">
      <ConfigFormPage
        configType="table"
        title="Table Management"
        description="Default capacity and floor-plan preferences."
        icon={Grid3X3}
        fields={tableFields}
        branchId={branchId}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage tables</CardTitle>
          <CardDescription>Create floors, sections and QR tables in the Tables module.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/admin/tables">Open Table Management</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function KotConfigPage() {
  const branchId = useBranchId();
  return (
    <div className="space-y-8">
      <ConfigFormPage
        configType="kot"
        title="KOT / Kitchen"
        description="Kitchen order ticket format and print behavior."
        icon={ChefHat}
        fields={kotFields}
        branchId={branchId}
      />
      <KotStationsPanel branchId={branchId} />
    </div>
  );
}

export function MenuConfigPage() {
  const branchId = useBranchId();
  return (
    <div className="space-y-6">
      <ConfigFormPage
        configType="menu"
        title="Menu & Pricing"
        description="Variants, add-ons and price channels reflected in POS & QR."
        icon={UtensilsCrossed}
        fields={menuFields}
        branchId={branchId}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit menu catalog</CardTitle>
          <CardDescription>Categories, items, prices and kitchen routing.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild variant="outline"><Link to="/admin/categories">Categories</Link></Button>
          <Button asChild><Link to="/admin/menu">Menu items</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function InventoryConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="inventory"
      title="Inventory"
      description="Stock thresholds and deduction rules connected to sales."
      icon={Boxes}
      fields={inventoryFields}
      branchId={branchId}
    />
  );
}

export function PaymentConfigPage() {
  const branchId = useBranchId();
  return <PaymentConfigPanel branchId={branchId} />;
}

export function DiscountConfigPage() {
  const branchId = useBranchId();
  return <DiscountConfigPanel branchId={branchId} />;
}

export function CustomerConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="customer"
      title="Customer Settings"
      description="Customer capture rules for POS and QR checkout."
      icon={Users}
      fields={customerFields}
      branchId={branchId}
    />
  );
}

export function QrConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="qr"
      title="QR Ordering"
      description="Table → QR → Menu → Order → POS → KOT → Billing"
      icon={QrCode}
      fields={qrFields}
      branchId={branchId}
    />
  );
}

export function PrinterConfigPage() {
  const branchId = useBranchId();
  return <PrinterConfigPanel branchId={branchId} />;
}

export function ReceiptConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="receipt"
      title="Receipt Settings"
      description="Thermal receipt layout with live preview."
      icon={Receipt}
      fields={receiptFields}
      branchId={branchId}
      preview={(data) => <ReceiptPreview data={data} />}
    />
  );
}

export function BusinessHoursConfigPage() {
  const branchId = useBranchId();
  return <HoursConfigPanel branchId={branchId} />;
}

export function NotificationsConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="notifications"
      title="Notifications"
      description="SMS, email, WhatsApp and operational alerts."
      icon={Bell}
      fields={notificationFields}
      branchId={branchId}
    />
  );
}

export function GeneralConfigPage() {
  const branchId = useBranchId();
  return (
    <ConfigFormPage
      configType="general"
      title="General Preferences"
      description="Language, theme and session behavior."
      icon={Settings}
      fields={generalFields}
      branchId={branchId}
    />
  );
}

export function BranchConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch / Outlet"
        description="Multi-branch setup. Users only access assigned outlets; Super Admin sees all."
        icon={MapPin}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage branches</CardTitle>
          <CardDescription>
            Branch settings (orders, kitchen, billing, payment, hours) are edited in the Branch module
            and override global configuration where configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/admin/branch">Open Branch Management</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/configuration?branchId=">Use branch scope in Configuration</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function UsersConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Access"
        description="RBAC for POS actions. Backend APIs validate permissions — not frontend-only hiding."
        icon={Shield}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff</CardTitle>
            <CardDescription>Create cashiers, waiters, kitchen & managers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link to="/admin/staff">Manage Staff</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>
              Owner, Admin, Manager, Cashier, Waiter, Kitchen, Inventory, Accountant, Support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground mb-4">
              <li>• View / Create / Edit / Delete</li>
              <li>• Discount / Refund / Cancel Order</li>
              <li>• Manage Configuration</li>
              <li>• View Reports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
