import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

/** Resolves to e.g. `http://localhost:5000/api/branches` (no `//` path bug). */
export const BRANCHES_API = `${API_BASE_URL}api/branches`;

export async function fetchBranches() {
  const { data } = await axios.get(BRANCHES_API);
  return data;
}

export async function getBranch(id: string | number) {
  const { data } = await axios.get(`${BRANCHES_API}/${id}`);
  return data;
}

export async function addBranch(payload: unknown) {
  const { data } = await axios.post(BRANCHES_API, payload);
  return data;
}

export async function editBranch(id: string | number, payload: unknown) {
  const { data } = await axios.put(`${BRANCHES_API}/${id}`, payload);
  return data;
}

export async function deleteBranch(id: string | number) {
  const { data } = await axios.delete(`${BRANCHES_API}/${id}`);
  return data;
}
