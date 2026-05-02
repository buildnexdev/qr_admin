import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

const ORDERS = `${API_BASE_URL}api/orders`;

export type CreateOrderLine = {
  id: number;
  quantity: number;
  price: number;
};

export type CreateOrderPayload = {
  customerName: string;
  tableId: number | null;
  items: CreateOrderLine[];
  total: number;
};

export type CreateOrderResponse = {
  id: number;
  message?: string;
  customerName?: string;
  tableId?: number | null;
  total?: number;
  status?: string;
};

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await axios.post<CreateOrderResponse>(ORDERS, payload);
  return data;
}

export async function updateOrderStatus(orderId: number, status: string) {
  await axios.post(`${API_BASE_URL}api/orders/update-status`, { orderId, status });
}
