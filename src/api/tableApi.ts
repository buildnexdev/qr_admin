import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

export const TABLES_API = `${API_BASE_URL}api/tables`;

export type TableListItem = {
  id: number;
  name: string;
  tableCode: string | null;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  branchId: number | null;
  floorSection: string | null;
  qrEnabled: boolean;
  selfOrdering: boolean;
  isActive: boolean;
  occupiedSince: string | null;
  currentOrderTotal: number;
  activeOrderIds: number[];
  sessionStartedAt: string | null;
};

export type TableDetail = {
  id: number;
  name: string;
  tableCode: string | null;
  capacity: number;
  status: string;
  branchId: number | null;
  floorSection: string | null;
  qrEnabled: boolean;
  selfOrdering: boolean;
  isActive: boolean;
  occupiedSince: string | null;
  openTotal: number;
  sessionStart: string | null;
  orders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
};

export async function fetchTablesList() {
  const { data } = await axios.get<TableListItem[]>(TABLES_API);
  return data;
}

export async function fetchTableDetail(id: number | string) {
  const { data } = await axios.get<TableDetail>(`${TABLES_API}/${id}`);
  return data;
}

export async function fetchNextTableCode() {
  const { data } = await axios.get<{ nextCode: number; suggestedLabel: string }>(`${TABLES_API}/next-code`);
  return data;
}

export async function createTable(payload: Record<string, unknown>) {
  const { data } = await axios.post<TableListItem>(`${TABLES_API}/add`, payload);
  return data;
}

export async function updateTable(id: number | string, payload: Record<string, unknown>) {
  const { data } = await axios.put<TableListItem>(`${TABLES_API}/${id}`, payload);
  return data;
}

export async function patchTableStatus(id: number | string, status: TableListItem['status']) {
  const { data } = await axios.patch<TableListItem>(`${TABLES_API}/${id}/status`, { status });
  return data;
}

export async function deleteTable(id: number | string) {
  await axios.delete(`${TABLES_API}/${id}`);
}
