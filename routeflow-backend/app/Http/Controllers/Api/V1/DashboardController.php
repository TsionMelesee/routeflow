<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DeliveryStatus;
use App\Enums\DriverStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * GET /api/v1/dashboard
 *
 * One aggregate response instead of the frontend making ~15 requests
 * (Step 4 §23). The response shape follows the spec: stats, a 7-day
 * delivery_chart, and recent_deliveries. Every query below is still
 * automatically tenant-scoped by BelongsToOrganization — this controller
 * never filters by organization_id itself.
 */
class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->startOfDay();

        $deliveriesToday = Delivery::whereDate('scheduled_at', $today)->count();
        $deliveredToday = Delivery::where('status', DeliveryStatus::DELIVERED)->whereDate('delivered_at', $today)->count();
        $failedToday = Delivery::where('status', DeliveryStatus::FAILED)->whereDate('updated_at', $today)->count();

        $activeShipments = Shipment::whereNotIn('status', [
            ShipmentStatus::DELIVERED->value,
            ShipmentStatus::CANCELLED->value,
        ])->count();

        // Deliveries completed per day over the last 7 days, for the
        // dashboard's trend chart.
        $chart = Delivery::query()
            ->selectRaw('DATE(delivered_at) as date, COUNT(*) as count')
            ->where('status', DeliveryStatus::DELIVERED)
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy(DB::raw('DATE(delivered_at)'))
            ->orderBy('date')
            ->get();

        $recentDeliveries = Delivery::query()
            ->with(['driver.user', 'vehicle'])
            ->latest('updated_at')
            ->limit(10)
            ->get();

        $lowStockProducts = Product::whereHas(
            'warehouses',
            fn ($q) => $q->whereColumn('warehouse_products.quantity', '<=', 'products.low_stock_threshold')
        )->count();

        return response()->json([
            'data' => [
                'stats' => [
                    'total_orders' => Order::count(),
                    'active_shipments' => $activeShipments,
                    'deliveries_today' => $deliveriesToday,
                    'delivered_today' => $deliveredToday,
                    'failed_today' => $failedToday,
                    'available_drivers' => Driver::where('status', DriverStatus::AVAILABLE)->count(),
                    'low_stock_products' => $lowStockProducts,
                ],
                'delivery_chart' => $chart->map(fn ($row) => [
                    'date' => $row->date,
                    'count' => (int) $row->count,
                ]),
                'recent_deliveries' => DeliveryResource::collection($recentDeliveries),
            ],
        ]);
    }
}
