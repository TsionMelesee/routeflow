import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Product, ProductStatus } from "@/lib/types";

export interface ProductListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ProductStatus | "";
  low_stock?: boolean;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description?: string | null;
  weight?: number | null;
  low_stock_threshold?: number;
  status?: ProductStatus;
}

export const productsApi = {
  list: (params: ProductListParams) => apiClient.get<PaginatedResponse<Product>>("/products", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  create: (payload: ProductPayload) => apiClient.post<ApiResponse<Product>>("/products", payload),

  update: (id: number, payload: Partial<ProductPayload>) =>
    apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/products/${id}`),
};
