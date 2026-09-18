import { apiClient } from "./client";
import type { ApiResponse, Customer, CustomerStatus, PaginatedResponse } from "@/lib/types";

export interface CustomerListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: CustomerStatus | "";
}

export interface CustomerPayload {
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  status?: CustomerStatus;
}

export const customersApi = {
  list: (params: CustomerListParams) => apiClient.get<PaginatedResponse<Customer>>("/customers", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Customer>>(`/customers/${id}`),

  create: (payload: CustomerPayload) => apiClient.post<ApiResponse<Customer>>("/customers", payload),

  update: (id: number, payload: Partial<CustomerPayload>) =>
    apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/customers/${id}`),
};
