import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Vehicle, VehicleStatus } from "@/lib/types";

export interface VehicleListParams {
  page?: number;
  per_page?: number;
  status?: VehicleStatus | "";
  available?: boolean;
}

export interface VehiclePayload {
  plate_number: string;
  type?: string | null;
  model?: string | null;
  year?: number | null;
  capacity?: number | null;
  status?: VehicleStatus;
}

export const vehiclesApi = {
  list: (params: VehicleListParams) => apiClient.get<PaginatedResponse<Vehicle>>("/vehicles", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${id}`),

  create: (payload: VehiclePayload) => apiClient.post<ApiResponse<Vehicle>>("/vehicles", payload),

  update: (id: number, payload: Partial<VehiclePayload>) => apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/vehicles/${id}`),
};
