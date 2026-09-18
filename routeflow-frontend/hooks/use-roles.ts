import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type RolePayload } from "@/lib/api/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await rolesApi.list()).data,
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => (await rolesApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => (await rolesApi.permissions()).data,
    staleTime: 5 * 60_000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload) => rolesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string | null }) => rolesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRolePermissions(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: string[]) => rolesApi.updatePermissions(id, permissions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}
