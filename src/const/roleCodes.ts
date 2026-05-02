/**
 * Role level options — stored in DB column `roleCode`.
 * UI: single flat dropdown like "Level 0 [No Access]" … "Level 7 [Finance]".
 */

export type RoleLevelOption = { value: string; label: string };

/** Values are stable API/DB identifiers; labels match the Role Level picker. */
export const ROLE_LEVEL_OPTIONS: RoleLevelOption[] = [
  { value: 'LEVEL_0', label: 'Level 0 [No Access]' },
  { value: 'LEVEL_1', label: 'Level 1 [Create Staff and Group]' },
  { value: 'LEVEL_2', label: 'Level 2 [Create Group]' },
  { value: 'LEVEL_3', label: 'Level 3 [Create Member & Basic Group Collection]' },
  { value: 'LEVEL_4', label: 'Level 4 [Sub-Admin]' },
  { value: 'LEVEL_5', label: 'Level 5 [Funder]' },
  { value: 'LEVEL_6', label: 'Level 6 [Division/Zone]' },
  { value: 'LEVEL_7', label: 'Level 7 [Finance]' },
];

/** Older installs may still have these codes from the previous grouped dropdown. */
const LEGACY_LABELS = new Map<string, string>([
  ['L1_SUBADMIN', 'Level 1 — Sub Admin (legacy)'],
  ['L1_BRANCH_MANAGER', 'Level 1 — Branch Manager (legacy)'],
  ['L2_FINANCE_TEAM', 'Level 2 — Finance Team (legacy)'],
  ['L3_KITCHEN', 'Level 3 — Kitchen (legacy)'],
]);

const labelByValue = new Map<string, string>();
for (const o of ROLE_LEVEL_OPTIONS) {
  labelByValue.set(o.value, o.label);
}

export function getRoleCodeLabel(code: string | null | undefined): string {
  if (code == null || code === '') return '—';
  return labelByValue.get(code) ?? LEGACY_LABELS.get(code) ?? code;
}

export function isKnownRoleCode(code: string | null | undefined): boolean {
  if (code == null || code === '') return false;
  return labelByValue.has(code);
}
