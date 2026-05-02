import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

export const CATEGORIES_API = `${API_BASE_URL}api/categories`;

export type CategoryDto = {
  id: number;
  code: number;
  name: string;
  description: string;
  status: boolean;
  itemsCount?: number;
  subtitle?: string;
  displayOrder?: string;
  tags?: string[];
};

export async function fetchCategories() {
  const { data } = await axios.get<CategoryDto[]>(CATEGORIES_API);
  return data;
}

/** Same value the server will assign on create: COALESCE(MAX(code), 0) + 1 */
export async function fetchNextCategoryCode() {
  const { data } = await axios.get<{ nextCode: number }>(`${CATEGORIES_API}/next-code`);
  return data;
}

export async function addCategory(payload: { name: string; description?: string }) {
  const { data } = await axios.post<CategoryDto>(CATEGORIES_API, payload);
  return data;
}

export async function editCategory(
  id: number | string,
  payload: { name: string; description?: string }
) {
  const { data } = await axios.put<CategoryDto>(`${CATEGORIES_API}/${id}`, payload);
  return data;
}

export async function setCategoryActive(id: number | string, isActive: boolean) {
  const { data } = await axios.patch<CategoryDto>(`${CATEGORIES_API}/${id}/active`, { isActive });
  return data;
}

export async function deleteCategory(id: number | string) {
  const { data } = await axios.delete<{ message: string }>(`${CATEGORIES_API}/${id}`);
  return data;
}
