<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Shipments\CreateShipmentAction;
use App\Enums\ShipmentStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shipments\StoreShipmentRequest;
use App\Http\Resources\ShipmentResource;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ShipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Shipment::class);

        $shipments = Shipment::query()
            ->with('originWarehouse')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('shipment_number', 'like', '%'.$request->input('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => ShipmentResource::collection($shipments),
            'meta' => [
                'current_page' => $shipments->currentPage(),
                'per_page' => $shipments->perPage(),
                'total' => $shipments->total(),
                'last_page' => $shipments->lastPage(),
            ],
        ]);
    }

    /** POST /orders/{order}/shipment */
    public function store(StoreShipmentRequest $request, Order $order, CreateShipmentAction $action): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($request->input('origin_warehouse_id'));

        $shipment = $action->execute(
            $order,
            $warehouse,
            $request->input('items'),
            $request->safe()->except(['origin_warehouse_id', 'items']),
            $request->user(),
        );

        return response()->json(['data' => new ShipmentResource($shipment)], 201);
    }

    public function show(Shipment $shipment): JsonResponse
    {
        $this->authorize('view', $shipment);

        return response()->json([
            'data' => new ShipmentResource($shipment->load(['originWarehouse', 'items.product', 'delivery'])),
        ]);
    }

    /**
     * POST /shipments/{shipment}/status — manual warehouse-prep transitions
     * only (PENDING -> PREPARING -> READY_FOR_PICKUP, or -> CANCELLED).
     * IN_TRANSIT and DELIVERED are never set here — they're driven
     * automatically by the delivery's own status (see
     * UpdateDeliveryStatusAction), since a shipment only becomes IN_TRANSIT
     * once an actual driver has actually picked it up.
     */
    public function updateStatus(Request $request, Shipment $shipment): JsonResponse
    {
        $this->authorize('update', $shipment);

        $request->validate(['status' => ['required', new Enum(ShipmentStatus::class)]]);
        $target = ShipmentStatus::from($request->input('status'));

        if (in_array($target, [ShipmentStatus::IN_TRANSIT, ShipmentStatus::DELIVERED], true)) {
            return response()->json([
                'message' => 'This status is set automatically once a delivery is created and picked up, not manually.',
            ], 422);
        }

        if (! $shipment->status->canTransitionTo($target)) {
            throw new InvalidStatusTransitionException($shipment->status->value, $target->value);
        }

        $shipment->update(['status' => $target]);

        return response()->json(['data' => new ShipmentResource($shipment), 'message' => 'Shipment status updated.']);
    }
}
