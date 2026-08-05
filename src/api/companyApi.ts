import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

export const COMPANY_API = `${API_BASE_URL}api/company`;

export async function fetchCompanies() {
  const { data } = await axios.get(COMPANY_API);
  return data;
}

export async function fetchCompanyDetails(id: string | number) {
  const { data } = await axios.get(`${COMPANY_API}/${id}`);
  return data;
}

export async function addCompany(payload: unknown) {
  const { data } = await axios.post(COMPANY_API, payload);
  return data;
}

export async function updateCompany(id: string | number, payload: unknown) {
  const { data } = await axios.put(`${COMPANY_API}/${id}`, payload);
  return data;
}

export async function setCompanyActive(id: string | number, isActive: boolean) {
  const { data } = await axios.patch(`${COMPANY_API}/${id}/status`, { is_active: isActive });
  return data;
}
