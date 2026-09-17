// AAS org-node helpers shared by the org chart + its editor.

export const LEVEL_ROLE: Record<string, string> = {
  state: "state_admin",
  region: "regional_organiser",
  mandalam: "zonal_organiser",
  district: "district_organiser",
  union: "union_coordinator",
  panchayat: "panchayat_coordinator",
  temple: "temple_coordinator",
};

export const ROLE_VALUES = [
  "super_admin", "state_admin", "regional_organiser", "zonal_organiser", "district_organiser",
  "union_coordinator", "panchayat_coordinator", "temple_coordinator", "state_functionary",
];

/** Roles that can only read the app — no create/edit/attendance/impersonate. */
export const READONLY_ROLES = new Set(["state_functionary"]);

export function defaultRoleForLevel(level?: string): string {
  return (level && LEVEL_ROLE[level]) || "district_organiser";
}
