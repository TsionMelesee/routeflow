import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  PackageCheck,
  Users,
  Boxes,
  Warehouse,
  ArrowLeftRight,
  Car,
  UserCog,
  ShieldCheck,
  BarChart3,
  FileClock,
  Bell,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Who besides broad-access roles (organization-admin, super-admin) can
   * see this item:
   * - "all": every authenticated user, regardless of role
   * - string[]: those specific role slugs, on top of broad-access roles
   * - omitted: broad-access roles only
   * Mirrors what each seeded role actually has permission for in
   * database/seeders/RoleSeeder.php — not a frontend-invented hierarchy.
   */
  visibility?: "all" | string[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visibility: "all" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Orders", href: "/orders", icon: ClipboardList, visibility: ["dispatcher"] },
      { label: "Shipments", href: "/shipments", icon: PackageCheck, visibility: ["dispatcher", "warehouse-staff"] },
      { label: "Deliveries", href: "/deliveries", icon: Truck, visibility: ["dispatcher", "driver"] },
    ],
  },
  {
    items: [{ label: "Customers", href: "/customers", icon: Users }],
  },
  {
    label: "Inventory",
    items: [
      { label: "Products", href: "/products", icon: Boxes, visibility: ["warehouse-staff"] },
      { label: "Warehouses", href: "/warehouses", icon: Warehouse, visibility: ["warehouse-staff"] },
      { label: "Inventory", href: "/inventory", icon: ArrowLeftRight, visibility: ["warehouse-staff"] },
    ],
  },
  {
    label: "Fleet",
    items: [
      { label: "Drivers", href: "/drivers", icon: UserCog, visibility: ["dispatcher"] },
      { label: "Vehicles", href: "/vehicles", icon: Car, visibility: ["dispatcher"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck },
    ],
  },
  {
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Audit Logs", href: "/audit-logs", icon: FileClock },
      { label: "Notifications", href: "/notifications", icon: Bell, visibility: "all" },
      { label: "Settings", href: "/settings", icon: Settings, visibility: "all" },
    ],
  },
];
