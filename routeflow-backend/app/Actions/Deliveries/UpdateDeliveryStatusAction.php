<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryStatus;
use App\Enums\DriverStatus;
use App\Enums\ShipmentStatus;
use App\Enums\VehicleStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * POST /api/v1/deliveries/{delivery}/status
 *
 * The single place a delivery's status is ever written. Rejects any
 * transition DeliveryStatus doesn't allow (Step 2 §9 — "even if someone
 * manually sends an API request, the business rule still protects the
 * system"), stamps the relevant timestamp column, appends a history row,
 * and frees the driver/vehicle once the delivery reaches a terminal state.
 */
class UpdateDeliveryStatusAction
{
    public function execute(Delivery $delivery, DeliveryStatus $target, User $actor, ?string $notes = null): Delivery
    {
        if (! $delivery->canTransitionTo($target)) {
            throw new InvalidStatusTransitionException($delivery->status->value, $target->value);
        }

        return DB::transaction(function () use ($delivery, $target, $actor, $notes) {
            $timestampColumn = match ($target) {
                DeliveryStatus::PICKED_UP => 'picked_up_at',
                DeliveryStatus::OUT_FOR_DELIVERY => 'out_for_delivery_at',
                DeliveryStatus::DELIVERED => 'delivered_at',
                default => null,
            };

            $attributes = ['status' => $target];
            if ($timestampColumn) {
                $attributes[$timestampColumn] = now();
            }

            $delivery->update($attributes);

            DeliveryStatusHistory::create([
                'delivery_id' => $delivery->id,
                'status' => $target,
                'changed_by' => $actor->id,
                'notes' => $notes,
                'created_at' => now(),
            ]);

            if ($target->isTerminal()) {
                $delivery->driver?->update(['status' => DriverStatus::AVAILABLE]);
                $delivery->vehicle?->update(['status' => VehicleStatus::AVAILABLE]);
            }

            // Keep the parent shipment's coarser status in sync with this
            // delivery's finer-grained one, without ever forcing a shipment
            // transition its own enum wouldn't allow.
            $shipmentTarget = match ($target) {
                DeliveryStatus::PICKED_UP => ShipmentStatus::IN_TRANSIT,
                DeliveryStatus::DELIVERED => ShipmentStatus::DELIVERED,
                default => null,
            };

            if ($shipmentTarget && $delivery->shipment->status->canTransitionTo($shipmentTarget)) {
                $delivery->shipment->update(['status' => $shipmentTarget]);
            }

            return $delivery->fresh(['driver', 'vehicle', 'statusHistories']);
        });
    }
}
