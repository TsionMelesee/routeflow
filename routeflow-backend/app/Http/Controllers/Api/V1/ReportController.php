<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ReportFilterRequest;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Order;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Step 4 §24. Every query here is tenant-scoped automatically by
 * BelongsToOrganization — no report filters by organization_id by hand.
 * All ranges default to the last 30 days (see ReportFilterRequest).
 */
class ReportController extends Controller
{
    /** GET /reports/deliveries */
    public function deliveries(ReportFilterRequest $request): JsonResponse
    {
        $query = Delivery::whereBetween('created_at', [$request->from(), $request->to()]);

        $byStatus = (clone $query)->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status');

        $completed = (clone $query)
            ->where('status', DeliveryStatus::DELIVERED)
            ->whereNotNull('picked_up_at')
            ->whereNotNull('delivered_at')
            ->get(['picked_up_at', 'delivered_at']);

        $averageMinutes = $completed->isEmpty()
            ? null
            : round($completed->avg(fn ($d) => $d->picked_up_at->diffInMinutes($d->delivered_at)));

        $total = $byStatus->sum();
        $delivered = $byStatus[DeliveryStatus::DELIVERED->value] ?? 0;

        return response()->json([
            'data' => [
                'period' => ['from' => $request->from(), 'to' => $request->to()],
                'total' => $total,
                'by_status' => $byStatus,
                'delivered' => $delivered,
                'failed' => $byStatus[DeliveryStatus::FAILED->value] ?? 0,
                'success_rate' => $total > 0 ? round($delivered / $total * 100, 1) : null,
                'average_delivery_minutes' => $averageMinutes,
            ],
        ]);
    }

    /** GET /reports/drivers — per-driver performance over the period. */
    public function drivers(ReportFilterRequest $request): JsonResponse
    {
        $drivers = Driver::query()
            ->with('user')
            ->when($request->filled('driver_id'), fn ($q) => $q->where('id', $request->input('driver_id')))
            ->withCount([
                'deliveries as total_deliveries' => fn ($q) => $q->whereBetween('created_at', [$request->from(), $request->to()]),
                'deliveries as delivered_count' => fn ($q) => $q->whereBetween('created_at', [$request->from(), $request->to()])->where('status', DeliveryStatus::DELIVERED),
                'deliveries as failed_count' => fn ($q) => $q->whereBetween('created_at', [$request->from(), $request->to()])->where('status', DeliveryStatus::FAILED),
            ])
            ->get();

        return response()->json([
            'data' => $drivers->map(fn (Driver $driver) => [
                'driver_id' => $driver->id,
                'name' => $driver->user?->name,
                'total_deliveries' => $driver->total_deliveries,
                'delivered' => $driver->delivered_count,
                'failed' => $driver->failed_count,
                'success_rate' => $driver->total_deliveries > 0
                    ? round($driver->delivered_count / $driver->total_deliveries * 100, 1)
                    : null,
            ]),
            'meta' => ['period' => ['from' => $request->from(), 'to' => $request->to()]],
        ]);
    }

    /** GET /reports/warehouses — stock movement volume per warehouse. */
    public function warehouses(ReportFilterRequest $request): JsonResponse
    {
        $warehouses = Warehouse::query()
            ->when($request->filled('warehouse_id'), fn ($q) => $q->where('id', $request->input('warehouse_id')))
            ->get();

        $data = $warehouses->map(function (Warehouse $warehouse) use ($request) {
            $movements = StockMovement::where('warehouse_id', $warehouse->id)
                ->whereBetween('created_at', [$request->from(), $request->to()])
                ->selectRaw('type, sum(abs(quantity)) as units')
                ->groupBy('type')
                ->pluck('units', 'type');

            return [
                'warehouse_id' => $warehouse->id,
                'name' => $warehouse->name,
                'shipments_dispatched' => $warehouse->outgoingShipments()
                    ->whereBetween('created_at', [$request->from(), $request->to()])
                    ->count(),
                'units_by_movement_type' => $movements,
                'products_stocked' => $warehouse->warehouseProducts()->where('quantity', '>', 0)->count(),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => ['period' => ['from' => $request->from(), 'to' => $request->to()]],
        ]);
    }

    /**
     * GET /reports/revenue
     *
     * Revenue is derived from order_items.unit_price, which is optional in
     * the schema — line items created without a price contribute nothing,
     * so orders_missing_pricing is reported alongside the total to make
     * an understated figure visible rather than silently wrong.
     */
    public function revenue(ReportFilterRequest $request): JsonResponse
    {
        $orders = Order::query()
            ->with('items')
            ->whereBetween('created_at', [$request->from(), $request->to()])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->get();

        $total = $orders->sum(fn (Order $order) => $order->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity));

        $missingPricing = $orders->filter(fn (Order $order) => $order->items->contains(fn ($item) => $item->unit_price === null))->count();

        return response()->json([
            'data' => [
                'period' => ['from' => $request->from(), 'to' => $request->to()],
                'orders_counted' => $orders->count(),
                'total_revenue' => round($total, 2),
                'average_order_value' => $orders->count() > 0 ? round($total / $orders->count(), 2) : null,
                'orders_missing_pricing' => $missingPricing,
            ],
        ]);
    }

    /** GET /reports/deliveries/export — streamed CSV. */
    public function exportDeliveries(ReportFilterRequest $request): StreamedResponse
    {
        $filename = 'deliveries-'.$request->from()->toDateString().'-to-'.$request->to()->toDateString().'.csv';

        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Delivery Number', 'Status', 'Driver', 'Vehicle', 'Scheduled At', 'Picked Up At', 'Delivered At']);

            // chunkById keeps memory flat regardless of how many rows match.
            Delivery::with(['driver.user', 'vehicle'])
                ->whereBetween('created_at', [$request->from(), $request->to()])
                ->when($request->filled('driver_id'), fn ($q) => $q->where('driver_id', $request->input('driver_id')))
                ->chunkById(500, function ($deliveries) use ($handle) {
                    foreach ($deliveries as $delivery) {
                        fputcsv($handle, [
                            $delivery->delivery_number,
                            $delivery->status->value,
                            $delivery->driver?->user?->name,
                            $delivery->vehicle?->plate_number,
                            $delivery->scheduled_at?->toDateTimeString(),
                            $delivery->picked_up_at?->toDateTimeString(),
                            $delivery->delivered_at?->toDateTimeString(),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
