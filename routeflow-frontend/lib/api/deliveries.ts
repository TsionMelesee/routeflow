import { apiClient } from "./client";
import type {
  ApiResponse,
  Delivery,
  DeliveryFailureReason,
  DeliveryStatus,
  DeliveryStatusHistory,
  PaginatedResponse,
} from "@/lib/types";

export interface DeliveryListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: DeliveryStatus | "";
  driver_id?: number;
}

export interface AssignDeliveryPayload {
  driver_id: number;
  vehicle_id: number;
  scheduled_at?: string | null;
}

export const deliveriesApi = {
  list: (params: DeliveryListParams) => apiClient.get<PaginatedResponse<Delivery>>("/deliveries", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Delivery>>(`/deliveries/${id}`),

  history: (id: number) => apiClient.get<ApiResponse<DeliveryStatusHistory[]>>(`/deliveries/${id}/history`),

  assign: (id: number, payload: AssignDeliveryPayload) =>
    apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/assign`, payload),

  updateStatus: (id: number, status: DeliveryStatus, notes?: string) =>
    apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/status`, { status, notes }),

  reportFailure: (id: number, reason: DeliveryFailureReason, description?: string) =>
    apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/failure`, { reason, description }),

  reschedule: (id: number, scheduledAt: string) =>
    apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/reschedule`, { scheduled_at: scheduledAt }),

  submitProof: (id: number, formData: FormData) =>
    apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/proof`, formData),
};
