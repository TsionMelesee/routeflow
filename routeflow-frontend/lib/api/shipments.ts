import { apiClient } from "./client";
import type { ApiResponse, Delivery, PaginatedResponse, Shipment, ShipmentStatus } from "@/lib/types";

export interface ShipmentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ShipmentStatus | "";
}

export const shipmentsApi = {
  list: (params: ShipmentListParams) => apiClient.get<PaginatedResponse<Shipment>>("/shipments", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Shipment>>(`/shipments/${id}`),

  updateStatus: (id: number, status: ShipmentStatus) =>
    apiClient.post<ApiResponse<Shipment>>(`/shipments/${id}/status`, { status }),

  createDelivery: (id: number, notes?: string) =>
    apiClient.post<ApiResponse<Delivery>>(`/shipments/${id}/delivery`, { notes }),
};
