import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, ProductStock, Warehouse, WarehouseStatus } from "@/lib/types";

export interface WarehouseListParams {
  page?: number;
  per_page?: number;
  status?: WarehouseStatus | "";
}

export interface WarehousePayload {
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  manager_id?: number | null;
  status?: WarehouseStatus;
}

export const warehousesApi = {
  list: (params: WarehouseListParams) => apiClient.get<PaginatedResponse<Warehouse>>("/warehouses", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`),

  create: (payload: WarehousePayload) => apiClient.post<ApiResponse<Warehouse>>("/warehouses", payload),

  update: (id: number, payload: Partial<WarehousePayload>) =>
    apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/warehouses/${id}`),

  inventory: (id: number) => apiClient.get<ApiResponse<ProductStock[]>>(`/warehouses/${id}/inventory`),
};
