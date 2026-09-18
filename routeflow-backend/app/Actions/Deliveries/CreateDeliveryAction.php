<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryStatus;
use App\Enums\ShipmentStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * POST /api/v1/shipments/{shipment}/delivery
 *
 * A shipment can only spawn one delivery, and only once the warehouse has
 * actually finished preparing it (ShipmentStatus::READY_FOR_PICKUP). The
 * delivery starts unassigned (DeliveryStatus::PENDING) — assigning a
 * driver/vehicle is a separate step (AssignDeliveryAction).
 */
class CreateDeliveryAction
{
    public function execute(Shipment $shipment, User $actor, ?string $notes = null): Delivery
    {
        if ($shipment->status !== ShipmentStatus::READY_FOR_PICKUP) {
            throw new InvalidStatusTransitionException($shipment->status->value, ShipmentStatus::IN_TRANSIT->value, 'shipment_status');
        }

        if ($shipment->delivery()->exists()) {
            throw ValidationException::withMessages(['shipment' => ['This shipment already has a delivery.']]);
        }

        return DB::transaction(function () use ($shipment, $actor, $notes) {
            $delivery = Delivery::create([
                'organization_id' => $shipment->organization_id,
                'shipment_id' => $shipment->id,
                'delivery_number' => Delivery::generateReferenceNumber('DEL', $actor->organization_id),
                'status' => DeliveryStatus::PENDING,
                'notes' => $notes,
            ]);

            DeliveryStatusHistory::create([
                'delivery_id' => $delivery->id,
                'status' => DeliveryStatus::PENDING,
                'changed_by' => $actor->id,
                'notes' => 'Delivery created from shipment '.$shipment->shipment_number.'.',
                'created_at' => now(),
            ]);

            return $delivery;
        });
    }
}
