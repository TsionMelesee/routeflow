import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehousesApi, type WarehouseListParams, type WarehousePayload } from "@/lib/api/warehouses";

export function useWarehouses(params: WarehouseListParams) {
  return useQuery({
    queryKey: ["warehouses", params],
    queryFn: () => warehousesApi.list(params),
    placeholderData: (prev) => prev,
  });
}

/** Unpaginated, for selects (transfer form, warehouse picker, etc). */
export function useAllWarehouses() {
  return useQuery({
    queryKey: ["warehouses", "all"],
    queryFn: () => warehousesApi.list({ per_page: 100 }),
    staleTime: 5 * 60_000,
  });
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: async () => (await warehousesApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useWarehouseInventory(id: number) {
  return useQuery({
    queryKey: ["warehouses", id, "inventory"],
    queryFn: async () => (await warehousesApi.inventory(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehousePayload) => warehousesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
}

export function useUpdateWarehouse(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WarehousePayload>) => warehousesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => warehousesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
}
