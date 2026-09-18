import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shipmentsApi, type ShipmentListParams } from "@/lib/api/shipments";
import type { ShipmentStatus } from "@/lib/types";

export function useShipments(params: ShipmentListParams) {
  return useQuery({
    queryKey: ["shipments", params],
    queryFn: () => shipmentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useShipment(id: number) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: async () => (await shipmentsApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

export function useUpdateShipmentStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ShipmentStatus) => shipmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

export function useCreateDeliveryFromShipment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => shipmentsApi.createDelivery(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}
