import axios from 'axios';
import { API_BASE_URL } from '../routes/const';

export const MENU_API = `${API_BASE_URL}api/menu`;

export type MenuItemDto = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  status?: boolean;
  rate?: number;
  /** Optional SKU / short code (maps to DB `item_code`) */
  code?: string;
};

/** GET all menu items (list) */
export async function fetchMenu() {
  const { data } = await axios.get<MenuItemDto[]>(MENU_API);
  return data;
}

/** GET single menu item by id */
export async function getMenu(id: number | string) {
  const { data } = await axios.get<MenuItemDto>(`${MENU_API}/${id}`);
  return data;
}

/** POST create menu item */
export async function addMenu(payload: Record<string, unknown>) {
  const { data } = await axios.post<MenuItemDto>(MENU_API, payload);
  return data;
}

/** PUT update menu item */
export async function editMenu(id: number | string, payload: Record<string, unknown>) {
  const { data } = await axios.put<MenuItemDto>(`${MENU_API}/${id}`, payload);
  return data;
}

/** DELETE menu item */
export async function deleteMenu(id: number | string) {
  const { data } = await axios.delete<{ message: string }>(`${MENU_API}/${id}`);
  return data;
}
