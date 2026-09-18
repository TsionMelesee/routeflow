<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Deliveries\AssignDeliveryAction;
use App\Actions\Deliveries\CreateDeliveryAction;
use App\Actions\Deliveries\ReportDeliveryFailureAction;
use App\Actions\Deliveries\RescheduleDeliveryAction;
use App\Actions\Deliveries\SubmitProofOfDeliveryAction;
use App\Actions\Deliveries\UpdateDeliveryStatusAction;
use App\Enums\DeliveryFailureReason;
use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Deliveries\AssignDeliveryRequest;
use App\Http\Requests\Deliveries\ReportDeliveryFailureRequest;
use App\Http\Requests\Deliveries\RescheduleDeliveryRequest;
use App\Http\Requests\Deliveries\SubmitProofOfDeliveryRequest;
use App\Http\Requests\Deliveries\UpdateDeliveryStatusRequest;
use App\Http\Resources\DeliveryResource;
use App\Http\Resources\DeliveryStatusHistoryResource;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Shipment;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function store(Request $request, Shipment $shipment, CreateDeliveryAction $action): JsonResponse
    {
        $this->authorize('create', Delivery::class);

        $delivery = $action->execute($shipment, $request->user(), $request->input('notes'));

        return response()->json(['data' => new DeliveryResource($delivery)], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Delivery::class);

        $deliveries = Delivery::query()
            ->with(['driver.user', 'vehicle'])
            // A user without the org-wide deliveries.view permission only
            // gets here via DeliveryPolicy's driver-ownership fallback, so
            // their list is force-scoped to their own deliveries — this
            // mirrors the per-record ownership check in show()/updateStatus(),
            // just applied to the collection instead of one record.
            ->when(
                ! $request->user()->hasPermission('deliveries.view'),
                fn ($q) => $q->where('driver_id', $request->user()->driver?->id)
            )
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('driver_id'), fn ($q) => $q->where('driver_id', $request->input('driver_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('delivery_number', 'like', '%'.$request->input('search').'%'))
            ->latest('scheduled_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => DeliveryResource::collection($deliveries),
            'meta' => [
                'current_page' => $deliveries->currentPage(),
                'per_page' => $deliveries->perPage(),
                'total' => $deliveries->total(),
                'last_page' => $deliveries->lastPage(),
            ],
        ]);
    }

    public function show(Delivery $delivery): JsonResponse
    {
        $this->authorize('view', $delivery);

        return response()->json([
            'data' => new DeliveryResource($delivery->load(['driver.user', 'vehicle', 'statusHistories.changedBy'])),
        ]);
    }

    public function assign(AssignDeliveryRequest $request, Delivery $delivery, AssignDeliveryAction $action): JsonResponse
    {
        $driver = Driver::findOrFail($request->integer('driver_id'));
        $vehicle = Vehicle::findOrFail($request->integer('vehicle_id'));
        $scheduledAt = $request->filled('scheduled_at') ? Carbon::parse($request->input('scheduled_at')) : null;

        $delivery = $action->execute($delivery, $driver, $vehicle, $scheduledAt, $request->user());

        return response()->json([
            'data' => new DeliveryResource($delivery),
            'message' => 'Delivery assigned successfully.',
        ]);
    }

    public function updateStatus(UpdateDeliveryStatusRequest $request, Delivery $delivery, UpdateDeliveryStatusAction $action): JsonResponse
    {
        $target = DeliveryStatus::from($request->input('status'));

        $delivery = $action->execute($delivery, $target, $request->user(), $request->input('notes'));

        return response()->json([
            'data' => new DeliveryResource($delivery),
            'message' => 'Delivery status updated.',
        ]);
    }

    public function history(Delivery $delivery): JsonResponse
    {
        $this->authorize('view', $delivery);

        return response()->json([
            'data' => DeliveryStatusHistoryResource::collection(
                $delivery->statusHistories()->with('changedBy')->get()
            ),
        ]);
    }

    public function reschedule(RescheduleDeliveryRequest $request, Delivery $delivery, RescheduleDeliveryAction $action): JsonResponse
    {
        $delivery = $action->execute($delivery, Carbon::parse($request->input('scheduled_at')), $request->user());

        return response()->json(['data' => new DeliveryResource($delivery), 'message' => 'Delivery rescheduled.']);
    }

    public function reportFailure(ReportDeliveryFailureRequest $request, Delivery $delivery, ReportDeliveryFailureAction $action): JsonResponse
    {
        $reason = DeliveryFailureReason::from($request->input('reason'));

        $delivery = $action->execute($delivery, $reason, $request->input('description'), $request->user());

        return response()->json([
            'data' => new DeliveryResource($delivery),
            'message' => 'Delivery failure recorded.',
        ]);
    }

    public function submitProof(SubmitProofOfDeliveryRequest $request, Delivery $delivery, SubmitProofOfDeliveryAction $action): JsonResponse
    {
        $signaturePath = $request->hasFile('signature')
            ? $request->file('signature')->store("deliveries/{$delivery->id}/signatures", 'public')
            : null;

        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store("deliveries/{$delivery->id}/photos", 'public')
            : null;

        $delivery = $action->execute(
            $delivery,
            $request->input('recipient_name'),
            $signaturePath,
            $photoPath,
            $request->input('notes'),
            $request->user(),
        );

        return response()->json([
            'data' => new DeliveryResource($delivery),
            'message' => 'Delivery marked as delivered.',
        ]);
    }
}
