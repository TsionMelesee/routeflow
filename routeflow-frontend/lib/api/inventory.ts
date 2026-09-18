import { apiClient } from "./client";

export interface AdjustInventoryPayload {
  warehouse_id: number;
  product_id: number;
  quantity: number; // signed delta
  notes?: string;
}

export interface TransferInventoryPayload {
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
  notes?: string;
}

export interface StockResult {
  warehouse_id?: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
}

export const inventoryApi = {
  adjust: (payload: AdjustInventoryPayload) =>
    apiClient.post<{ data: unknown; message: string }>("/inventory/adjust", payload),

  transfer: (payload: TransferInventoryPayload) =>
    apiClient.post<{ data: { from: StockResult; to: StockResult }; message: string }>("/inventory/transfer", payload),
};
