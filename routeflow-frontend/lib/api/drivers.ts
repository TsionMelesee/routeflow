import { apiClient } from "./client";
import type { ApiResponse, Driver, DriverStatus, PaginatedResponse } from "@/lib/types";

export interface DriverListParams {
  page?: number;
  per_page?: number;
  status?: DriverStatus | "";
  available?: boolean;
}

export interface CreateDriverPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  license_number: string;
  license_expiry?: string | null;
}

export interface UpdateDriverPayload {
  license_number?: string;
  license_expiry?: string | null;
  status?: DriverStatus;
}

export const driversApi = {
  list: (params: DriverListParams) => apiClient.get<PaginatedResponse<Driver>>("/drivers", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Driver>>(`/drivers/${id}`),

  create: (payload: CreateDriverPayload) => apiClient.post<ApiResponse<Driver>>("/drivers", payload),

  update: (id: number, payload: UpdateDriverPayload) => apiClient.patch<ApiResponse<Driver>>(`/drivers/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/drivers/${id}`),
};
