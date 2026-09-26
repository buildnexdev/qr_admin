import axios from 'axios';
import { API_BASE_URL } from '@/routes/const';

const base = `${API_BASE_URL}api/configuration`;

export type ConfigType =
  | 'restaurant'
  | 'pos'
  | 'billing'
  | 'tax'
  | 'order'
  | 'table'
  | 'kot'
  | 'menu'
  | 'inventory'
  | 'payment'
  | 'discount'
  | 'customer'
  | 'qr'
  | 'printer'
  | 'receipt'
  | 'business_hours'
  | 'notifications'
  | 'general';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
};

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.success) throw new Error(data.error || data.message || 'Request failed');
  return data.data;
}

export const configApi = {
  getHub: (branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/hub`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  getAll: (branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  get: (type: ConfigType, branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/${type}`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  update: (type: ConfigType, data: Record<string, unknown>, branchId?: number | null) =>
    unwrap(
      axios.put(`${base}/${type}`, {
        data,
        branchId: branchId ?? undefined,
      })
    ),

  listTaxRates: (branchId?: number | null) =>
    unwrap(axios.get(`${base}/tax-rates`, { params: branchId != null ? { branchId } : undefined })),

  saveTaxRate: (payload: Record<string, unknown>) =>
    unwrap(axios.post(`${base}/tax-rates`, payload)),

  deleteTaxRate: (id: number) => unwrap(axios.delete(`${base}/tax-rates/${id}`)),

  listPayments: (branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/payment-methods`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  savePayment: (payload: Record<string, unknown>) =>
    unwrap(axios.post(`${base}/payment-methods`, payload)),

  listPrinters: (branchId?: number | null) =>
    unwrap(axios.get(`${base}/printers`, { params: branchId != null ? { branchId } : undefined })),

  savePrinter: (payload: Record<string, unknown>) =>
    unwrap(axios.post(`${base}/printers`, payload)),

  deletePrinter: (id: number) => unwrap(axios.delete(`${base}/printers/${id}`)),

  testPrinter: (id: number) => unwrap(axios.post(`${base}/printers/${id}/test`)),

  listStations: (branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/kitchen-stations`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  saveStation: (payload: Record<string, unknown>) =>
    unwrap(axios.post(`${base}/kitchen-stations`, payload)),

  listHours: (branchId?: number | null) =>
    unwrap(
      axios.get(`${base}/business-hours`, {
        params: branchId != null ? { branchId } : undefined,
      })
    ),

  saveHours: (days: Record<string, unknown>[], branchId?: number | null) =>
    unwrap(axios.put(`${base}/business-hours`, { days, branchId: branchId ?? undefined })),

  listDiscounts: (branchId?: number | null) =>
    unwrap(axios.get(`${base}/discounts`, { params: branchId != null ? { branchId } : undefined })),

  saveDiscount: (payload: Record<string, unknown>) =>
    unwrap(axios.post(`${base}/discounts`, payload)),

  calculateTax: (body: {
    lines: Array<{ amount: number; rate: Record<string, unknown> }>;
    interState?: boolean;
    pricingMode?: 'inclusive' | 'exclusive';
    roundOff?: boolean;
  }) => unwrap(axios.post(`${base}/calculate-tax`, body)),
};
