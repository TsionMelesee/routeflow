<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Grouped, human-readable permission slugs. Roles are composed from
     * these rather than the app checking `$user->role === 'admin'`
     * anywhere — see Step 2 §7 of the spec.
     */
    private const PERMISSIONS = [
        'users' => ['users.view', 'users.create', 'users.update', 'users.delete'],
        'roles' => ['roles.view', 'roles.manage'],
        'customers' => ['customers.view', 'customers.create', 'customers.update', 'customers.delete'],
        'orders' => ['orders.view', 'orders.create', 'orders.update', 'orders.cancel'],
        'shipments' => ['shipments.view', 'shipments.create', 'shipments.update'],
        'warehouses' => ['warehouses.view', 'warehouses.create', 'warehouses.update', 'warehouses.delete'],
        'products' => ['products.view', 'products.create', 'products.update', 'products.delete'],
        'inventory' => ['inventory.view', 'inventory.adjust', 'inventory.transfer'],
        'drivers' => ['drivers.view', 'drivers.create', 'drivers.update', 'drivers.delete'],
        'vehicles' => ['vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete'],
        'deliveries' => [
            'deliveries.view', 'deliveries.assign', 'deliveries.update_status', 'deliveries.reschedule',
        ],
        'reports' => ['reports.view'],
        'audit-logs' => ['audit-logs.view'],
        'notifications' => ['notifications.view'],
        'organizations' => ['organizations.manage'],
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $group => $slugs) {
            foreach ($slugs as $slug) {
                Permission::updateOrCreate(['slug' => $slug], ['group' => $group]);
            }
        }
    }
}
