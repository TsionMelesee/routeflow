<?php

use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\ShipmentController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    // Everything below requires a valid Sanctum token. Tenant scoping is
    // then handled automatically by the BelongsToOrganization global scope
    // on each model — no route here filters by organization_id by hand.
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::apiResource('customers', CustomerController::class);

        Route::apiResource('products', ProductController::class);

        Route::apiResource('warehouses', WarehouseController::class);
        Route::get('warehouses/{warehouse}/inventory', [WarehouseController::class, 'inventory']);
        Route::post('inventory/adjust', [InventoryController::class, 'adjust']);
        Route::post('inventory/transfer', [InventoryController::class, 'transfer']);

        Route::apiResource('orders', OrderController::class)->except(['update', 'destroy']);
        Route::post('orders/{order}/process', [OrderController::class, 'process']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('orders/{order}/shipment', [ShipmentController::class, 'store']);

        Route::get('shipments', [ShipmentController::class, 'index']);
        Route::get('shipments/{shipment}', [ShipmentController::class, 'show']);
        Route::post('shipments/{shipment}/status', [ShipmentController::class, 'updateStatus']);
        Route::post('shipments/{shipment}/delivery', [DeliveryController::class, 'store']);

        Route::get('deliveries', [DeliveryController::class, 'index']);
        Route::get('deliveries/{delivery}', [DeliveryController::class, 'show']);
        Route::get('deliveries/{delivery}/history', [DeliveryController::class, 'history']);
        Route::post('deliveries/{delivery}/assign', [DeliveryController::class, 'assign']);
        Route::post('deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
        Route::post('deliveries/{delivery}/failure', [DeliveryController::class, 'reportFailure']);
        Route::post('deliveries/{delivery}/reschedule', [DeliveryController::class, 'reschedule']);
        Route::post('deliveries/{delivery}/proof', [DeliveryController::class, 'submitProof']);

        Route::apiResource('drivers', DriverController::class)->except(['update']);
        Route::patch('drivers/{driver}', [DriverController::class, 'update']);

        Route::apiResource('vehicles', VehicleController::class);

        Route::apiResource('users', UserController::class);

        Route::apiResource('roles', RoleController::class)->except(['update'])->parameters(['roles' => 'role']);
        Route::patch('roles/{role}', [RoleController::class, 'update']);
        Route::put('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);
        Route::get('permissions', [PermissionController::class, 'index']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/{auditLog}', [AuditLogController::class, 'show']);

        Route::prefix('reports')->group(function () {
            Route::get('deliveries', [ReportController::class, 'deliveries']);
            Route::get('deliveries/export', [ReportController::class, 'exportDeliveries']);
            Route::get('drivers', [ReportController::class, 'drivers']);
            Route::get('warehouses', [ReportController::class, 'warehouses']);
            Route::get('revenue', [ReportController::class, 'revenue']);
        });
    });
});
