
import type {
  CustomerStatus,
  DeliveryFailureReason,
  DeliveryStatus,
  DriverStatus,
  OrderPriority,
  OrderStatus,
  OrganizationStatus,
  ProductStatus,
  ShipmentStatus,
    UserStatus,
  VehicleStatus,
  WarehouseStatus,
} from "./enums";

export interface Organization {
  id: number;
  name: string;
  slug: string;
  status: OrganizationStatus;
}

export interface RoleSummary {
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  roles?: string[];
  organization?: Organization;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  is_global: boolean;
  permissions?: string[];
}

export interface Permission {
  slug: string;
  group: string;
  description: string | null;
}

export interface Customer {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  status: CustomerStatus;
  orders_count?: number;
  created_at: string;
}

export interface WarehouseStock {
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
}

export interface ProductStock {
  product_id: number;
  sku: string;
  name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  low_stock_threshold: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  weight: number | null;
  low_stock_threshold: number;
  status: ProductStatus;
  total_quantity?: number;
  warehouses?: WarehouseStock[];
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  status: WarehouseStatus;
  manager?: { id: number; name: string } | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number | null;
  weight: number | null;
  notes: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  priority: OrderPriority;
  customer?: { id: number; name: string };
  pickup_address: string | null;
  pickup_city: string | null;
  delivery_address: string;
  delivery_city: string | null;
  requested_at: string | null;
  notes: string | null;
  items?: OrderItem[];
  has_shipment?: boolean;
  created_at: string;
}

export interface ShipmentItem {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  weight: number | null;
}

export interface Shipment {
  id: number;
  shipment_number: string;
  status: ShipmentStatus;
  priority: OrderPriority;
  order_id: number;
  origin_warehouse?: { id: number; name: string };
  destination_address: string;
  destination_city: string | null;
  package_count: number;
  total_weight: number | null;
  expected_delivery_at: string | null;
  items?: ShipmentItem[];
  has_delivery?: boolean;
  created_at: string;
}

export interface DeliveryStatusHistory {
  status: DeliveryStatus;
  notes: string | null;
  changed_by?: string | null;
  created_at: string;
}

export interface DeliveryFailure {
  id: number;
  reason: DeliveryFailureReason;
  description: string | null;
  reported_by?: string | null;
  reported_at: string | null;
  resolution: string | null;
  resolved_at: string | null;
}

export interface ProofOfDelivery {
  recipient_name: string;
  signature_url: string | null;
  photo_url: string | null;
  notes: string | null;
  submitted_by?: string | null;
  submitted_at: string | null;
}

export interface Delivery {
  id: number;
  delivery_number: string;
  status: DeliveryStatus;
  scheduled_at: string | null;
  picked_up_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  driver?: { id: number; name: string; status: DriverStatus } | null;
  vehicle?: { id: number; plate_number: string; status: VehicleStatus } | null;
  history?: DeliveryStatusHistory[];
  failures?: DeliveryFailure[];
  proof_of_delivery?: ProofOfDelivery | null;
}

export interface Driver {
  id: number;
  name?: string;
  email?: string;
  phone?: string | null;
  license_number: string;
  license_expiry: string | null;
  status: DriverStatus;
  active_deliveries_count?: number;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  type: string | null;
  model: string | null;
  year: number | null;
  capacity: number | null;
  status: VehicleStatus;
}

export interface NotificationData {
  type: string;
  message: string;
  delivery_id?: number;
  delivery_number?: string;
  reason?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  user: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
