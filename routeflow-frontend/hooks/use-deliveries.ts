import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveriesApi, type AssignDeliveryPayload, type DeliveryListParams } from "@/lib/api/deliveries";
import type { DeliveryFailureReason, DeliveryStatus } from "@/lib/types";

export function useDeliveries(params: DeliveryListParams) {
  return useQuery({
    queryKey: ["deliveries", params],
    queryFn: () => deliveriesApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useDelivery(id: number) {
  return useQuery({
    queryKey: ["deliveries", id],
    queryFn: async () => (await deliveriesApi.get(id)).data,
    enabled: Number.isFinite(id),
  });
}

function useInvalidateDelivery(id: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["deliveries", id] });
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    // Assignment/status changes flip driver/vehicle availability and can
    // sync the parent shipment's status too.
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["shipments"] });
  };
}

export function useAssignDelivery(id: number) {
  const invalidate = useInvalidateDelivery(id);
  return useMutation({
    mutationFn: (payload: AssignDeliveryPayload) => deliveriesApi.assign(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateDeliveryStatus(id: number) {
  const invalidate = useInvalidateDelivery(id);
  return useMutation({
    mutationFn: ({ status, notes }: { status: DeliveryStatus; notes?: string }) => deliveriesApi.updateStatus(id, status, notes),
    onSuccess: invalidate,
  });
}

export function useReportDeliveryFailure(id: number) {
  const invalidate = useInvalidateDelivery(id);
  return useMutation({
    mutationFn: ({ reason, description }: { reason: DeliveryFailureReason; description?: string }) =>
      deliveriesApi.reportFailure(id, reason, description),
    onSuccess: invalidate,
  });
}

export function useRescheduleDelivery(id: number) {
  const invalidate = useInvalidateDelivery(id);
  return useMutation({
    mutationFn: (scheduledAt: string) => deliveriesApi.reschedule(id, scheduledAt),
    onSuccess: invalidate,
  });
}

export function useSubmitProofOfDelivery(id: number) {
  const invalidate = useInvalidateDelivery(id);
  return useMutation({
    mutationFn: (formData: FormData) => deliveriesApi.submitProof(id, formData),
    onSuccess: invalidate,
  });
}
