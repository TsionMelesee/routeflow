// Permission slugs mirror database/seeders/PermissionSeeder.php exactly.
// The frontend never invents a permission name — it only checks slugs the
// backend already defines, and only ever for UI affordances (show/hide a
// button). The backend Policy is still the actual enforcement; a hidden
// button here is a convenience, not a security boundary.

import type { User } from "@/lib/types";

/**
 * There's no dedicated "my permissions" endpoint — /auth/me returns role
 * slugs, not resolved permissions. We treat "organization-admin" and
 * "super-admin" as broad-access roles for UI purposes (matches
 * AuthServiceProvider's Gate::before super-admin bypass, and
 * RoleSeeder's organization-admin having effectively every permission),
 * and hide role-gated affordances for the narrower seeded roles
 * (dispatcher, warehouse-staff, driver) by role slug rather than a
 * permission slug the frontend can't otherwise see.
 */
const BROAD_ACCESS_ROLES = ["super-admin", "organization-admin"];

export function hasRole(user: User | null | undefined, ...roles: string[]): boolean {
  if (!user?.roles) return false;
  return roles.some((r) => user.roles!.includes(r));
}

export function isBroadAccess(user: User | null | undefined): boolean {
  return hasRole(user, ...BROAD_ACCESS_ROLES);
}

export function can(user: User | null | undefined, ...allowedRoles: string[]): boolean {
  if (isBroadAccess(user)) return true;
  return hasRole(user, ...allowedRoles);
}

export const isDriver = (user: User | null | undefined) => hasRole(user, "driver");
export const isDispatcher = (user: User | null | undefined) => hasRole(user, "dispatcher");
export const isWarehouseStaff = (user: User | null | undefined) => hasRole(user, "warehouse-staff");

export function canSeeNavItem(user: User | null | undefined, visibility: "all" | string[] | undefined): boolean {
  if (visibility === "all") return true;
  if (isBroadAccess(user)) return true;
  if (!visibility) return false;
  return hasRole(user, ...visibility);
}
