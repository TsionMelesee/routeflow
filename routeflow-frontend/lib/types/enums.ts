// Mirrors the backing values of app/Enums/*.php exactly — these are what
// the Laravel API actually sends and accepts, not a frontend invention.

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";
export type OrderPriority = "standard" | "express" | "urgent";

export type ShipmentStatus = "pending" | "preparing" | "ready_for_pickup" | "in_transit" | "delivered" | "cancelled";

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "rescheduled"
  | "returned"
  | "cancelled";

export type DeliveryFailureReason =
  | "customer_unavailable"
  | "wrong_address"
  | "customer_refused"
  | "damaged_package"
  | "vehicle_problem"
  | "other";

export type DriverStatus = "available" | "on_delivery" | "off_duty" | "suspended";
export type VehicleStatus = "available" | "in_use" | "maintenance" | "inactive";
export type VehicleMaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type CustomerStatus = "active" | "inactive";
export type ProductStatus = "active" | "inactive" | "discontinued";
export type WarehouseStatus = "active" | "inactive";
export type OrganizationStatus = "active" | "suspended";
export type UserStatus = "active" | "inactive" | "suspended";

// DeliveryStatus::allowedTransitions() mirrored client-side so the UI can
// grey out illegal actions before the request round-trips — the backend
// remains the source of truth and re-validates regardless.
export const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit"],
  in_transit: ["out_for_delivery"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["rescheduled", "returned"],
  rescheduled: ["out_for_delivery"],
  delivered: [],
  returned: [],
  cancelled: [],
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["in_transit", "cancelled"],
  in_transit: ["delivered"],
  delivered: [],
  cancelled: [],
};
