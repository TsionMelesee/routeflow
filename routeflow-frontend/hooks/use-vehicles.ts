import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi, type VehicleListParams, type VehiclePayload } from "@/lib/api/vehicles";

export function useVehicles(params: VehicleListParams) {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => vehiclesApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: ["vehicles", "available"],
    queryFn: () => vehiclesApi.list({ per_page: 100, available: true }),
    staleTime: 30_000,
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => (await vehiclesApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehiclePayload) => vehiclesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VehiclePayload>) => vehiclesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}
