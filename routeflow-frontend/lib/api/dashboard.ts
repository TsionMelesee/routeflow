import { apiClient } from "./client";
import type { Delivery, DeliveryStatus, OrderStatus } from "@/lib/types";

// Mirrors DashboardController::index() exactly — see routeflow-backend
// app/Http/Controllers/Api/V1/DashboardController.php.
export interface DashboardData {
  orders: {
    total: number;
    by_status: Partial<Record<OrderStatus, number>>;
  };
  deliveries: {
    total: number;
    by_status: Partial<Record<DeliveryStatus, number>>;
    active: Delivery[];
  };
  fleet: {
    drivers_available: number;
    drivers_total: number;
    vehicles_available: number;
    vehicles_total: number;
  };
  inventory: {
    low_stock_products: number;
  };
}

export const dashboardApi = {
  get: () => apiClient.get<{ data: DashboardData }>("/dashboard"),
};
