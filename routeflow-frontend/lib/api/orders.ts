import { apiClient } from "./client";
import type { ApiResponse, Order, OrderPriority, OrderStatus, PaginatedResponse, Shipment } from "@/lib/types";

export interface OrderListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: OrderStatus | "";
  customer_id?: number;
}

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  unit_price?: number | null;
  notes?: string;
}

export interface CreateOrderPayload {
  customer_id: number;
  priority?: OrderPriority;
  pickup_address?: string | null;
  pickup_city?: string | null;
  delivery_address: string;
  delivery_city?: string | null;
  requested_at?: string | null;
  notes?: string | null;
  items: OrderItemPayload[];
}

export interface CreateShipmentPayload {
  origin_warehouse_id: number;
  destination_address: string;
  destination_city?: string | null;
  priority?: OrderPriority;
  expected_delivery_at?: string | null;
  items: { product_id: number; quantity: number }[];
}

export const ordersApi = {
  list: (params: OrderListParams) => apiClient.get<PaginatedResponse<Order>>("/orders", { params }),

  get: (id: number) => apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  create: (payload: CreateOrderPayload) => apiClient.post<ApiResponse<Order>>("/orders", payload),

  process: (id: number) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/process`),

  cancel: (id: number, reason?: string) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  createShipment: (orderId: number, payload: CreateShipmentPayload) =>
    apiClient.post<ApiResponse<Shipment>>(`/orders/${orderId}/shipment`, payload),
};
