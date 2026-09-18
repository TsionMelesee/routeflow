import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driversApi, type CreateDriverPayload, type DriverListParams, type UpdateDriverPayload } from "@/lib/api/drivers";

export function useDrivers(params: DriverListParams) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driversApi.list(params),
    placeholderData: (prev) => prev,
  });
}

/** Unpaginated, for the delivery-assignment picker. */
export function useAvailableDrivers() {
  return useQuery({
    queryKey: ["drivers", "available"],
    queryFn: () => driversApi.list({ per_page: 100, available: true }),
    staleTime: 30_000,
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: async () => (await driversApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driversApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useUpdateDriver(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDriverPayload) => driversApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driversApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}
