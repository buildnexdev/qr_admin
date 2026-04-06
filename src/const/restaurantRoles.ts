/** Roles commonly used in restaurant / F&B operations (staff table stores label as-is). */
export const RESTAURANT_ROLES = [
  'Restaurant Manager',
  'Assistant Manager',
  'Head Chef',
  'Chef / Cook',
  'Kitchen Staff',
  'Server',
  'Host / Hostess',
  'Cashier',
  'Bartender',
  'Dishwasher',
  'Admin',
] as const;

export const DEFAULT_RESTAURANT_ROLE = 'Server';

export function isKnownRestaurantRole(role: string): boolean {
  return (RESTAURANT_ROLES as readonly string[]).includes(role);
}
