import { apiClient, apiDownload } from "./client";
import type { DeliveryStatus } from "@/lib/types";

export interface ReportFilterParams {
  from?: string;
  to?: string;
  driver_id?: number;
  warehouse_id?: number;
}

export interface DeliveriesReport {
  period: { from: string; to: string };
  total: number;
  by_status: Partial<Record<DeliveryStatus, number>>;
  delivered: number;
  failed: number;
  success_rate: number | null;
  average_delivery_minutes: number | null;
}

export interface DriverReportRow {
  driver_id: number;
  name: string | null;
  total_deliveries: number;
  delivered: number;
  failed: number;
  success_rate: number | null;
}

export interface WarehouseReportRow {
  warehouse_id: number;
  name: string;
  shipments_dispatched: number;
  units_by_movement_type: Record<string, number>;
  products_stocked: number;
}

export interface RevenueReport {
  period: { from: string; to: string };
  orders_counted: number;
  total_revenue: number;
  average_order_value: number | null;
  orders_missing_pricing: number;
}

export const reportsApi = {
  deliveries: (params: ReportFilterParams) => apiClient.get<{ data: DeliveriesReport }>("/reports/deliveries", { params }),

  drivers: (params: ReportFilterParams) =>
    apiClient.get<{ data: DriverReportRow[]; meta: { period: { from: string; to: string } } }>("/reports/drivers", { params }),

  warehouses: (params: ReportFilterParams) =>
    apiClient.get<{ data: WarehouseReportRow[]; meta: { period: { from: string; to: string } } }>("/reports/warehouses", { params }),

  revenue: (params: ReportFilterParams) => apiClient.get<{ data: RevenueReport }>("/reports/revenue", { params }),

  exportDeliveries: (params: ReportFilterParams) => apiDownload("/reports/deliveries/export", params),
};
