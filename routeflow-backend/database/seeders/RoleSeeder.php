<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    private const ROLES = [
        'super-admin' => [
            'name' => 'Super Admin',
            'description' => 'Platform owner. Manages organizations and views platform-wide activity.',
            'permissions' => ['organizations.manage', 'audit-logs.view'],
        ],
        'organization-admin' => [
            'name' => 'Organization Admin',
            'description' => 'Company owner/admin. Full access within their organization.',
            'permissions' => [
                'users.view', 'users.create', 'users.update', 'users.delete',
                'roles.view', 'roles.manage',
                'customers.view', 'customers.create', 'customers.update', 'customers.delete',
                'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
                'shipments.view', 'shipments.create', 'shipments.update',
                'warehouses.view', 'warehouses.create', 'warehouses.update', 'warehouses.delete',
                'products.view', 'products.create', 'products.update', 'products.delete',
                'inventory.view', 'inventory.adjust', 'inventory.transfer',
                'drivers.view', 'drivers.create', 'drivers.update', 'drivers.delete',
                'vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
                'deliveries.view', 'deliveries.assign', 'deliveries.update_status', 'deliveries.reschedule',
                'reports.view', 'audit-logs.view', 'notifications.view',
            ],
        ],
        'dispatcher' => [
            'name' => 'Dispatcher',
            'description' => 'Coordinates deliveries: assigns drivers/vehicles, schedules, monitors status.',
            'permissions' => [
                'orders.view',
                'shipments.view', 'shipments.create',
                'drivers.view', 'vehicles.view',
                'deliveries.view', 'deliveries.assign', 'deliveries.update_status', 'deliveries.reschedule',
                'notifications.view',
            ],
        ],
        'warehouse-staff' => [
            'name' => 'Warehouse Staff',
            'description' => 'Prepares shipments, confirms pickup, manages inventory in their warehouse.',
            'permissions' => [
                'shipments.view', 'shipments.update',
                'warehouses.view',
                'products.view',
                'inventory.view', 'inventory.adjust', 'inventory.transfer',
                'notifications.view',
            ],
        ],
        'driver' => [
            'name' => 'Driver',
            'description' => 'Simplified dashboard: sees assigned deliveries, updates status, submits proof.',
            'permissions' => [
                'notifications.view',
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::ROLES as $slug => $definition) {
            $role = Role::updateOrCreate(
                ['organization_id' => null, 'slug' => $slug],
                [
                    'name' => $definition['name'],
                    'description' => $definition['description'],
                    'is_system' => true,
                ]
            );

            $permissionIds = Permission::whereIn('slug', $definition['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
