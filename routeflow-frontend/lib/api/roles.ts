import { apiClient } from "./client";
import type { ApiResponse, Permission, Role } from "@/lib/types";

export type PermissionGroups = Record<string, Permission[]>;

export interface RolePayload {
  name: string;
  slug: string;
  description?: string | null;
  permissions?: string[];
}

export const rolesApi = {
  // Not paginated — RoleController::index returns every global template
  // role plus the organization's own custom roles as a flat array.
  list: () => apiClient.get<ApiResponse<Role[]>>("/roles"),

  get: (id: number) => apiClient.get<ApiResponse<Role>>(`/roles/${id}`),

  create: (payload: RolePayload) => apiClient.post<ApiResponse<Role>>("/roles", payload),

  update: (id: number, payload: { name?: string; description?: string | null }) =>
    apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, payload),

  updatePermissions: (id: number, permissions: string[]) =>
    apiClient.put<ApiResponse<Role>>(`/roles/${id}/permissions`, { permissions }),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/roles/${id}`),

  permissions: () => apiClient.get<ApiResponse<PermissionGroups>>("/permissions"),
};
