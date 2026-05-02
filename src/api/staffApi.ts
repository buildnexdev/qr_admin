import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

export const STAFF_API = `${API_BASE_URL}api/staff`;

export async function FetchStaffDetails() {
  const { data } = await axios.get(STAFF_API);
  return data;
}

export async function GetStaffDetails(id: number | string) {
  const { data } = await axios.get(`${STAFF_API}/${id}`);
  return data;
}

export async function AddStaffDetails(payload: Record<string, unknown>) {
  const { data } = await axios.post(STAFF_API, payload);
  return data;
}

export async function EditStaffDetails(id: number | string, payload: Record<string, unknown>) {
  const { data } = await axios.put(`${STAFF_API}/${id}`, payload);
  return data;
}

export async function DeleteStaffDetails(id: number | string) {
  const { data } = await axios.delete(`${STAFF_API}/${id}`);
  return data;
}

export async function ResetStaffPassword(id: number | string, password: string) {
  const { data } = await axios.post(`${STAFF_API}/${id}/reset-password`, { password });
  return data;
}
