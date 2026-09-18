<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryStatus;
use App\Enums\DriverStatus;
use App\Enums\VehicleStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Delivery;
use App\Models\DeliveryStatusHistory;
use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use App\Notifications\DeliveryAssignedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * POST /api/v1/deliveries/{delivery}/assign
 *
 * Implements the checklist from Step 4 §16 of the spec:
 * driver in this org? available? vehicle in this org? available?
 * delivery assignable? -> assign, and flip driver/vehicle to "busy".
 *
 * Everything happens inside one transaction: either the whole assignment
 * succeeds, or nothing changes.
 */
class AssignDeliveryAction
{
    public function execute(
        Delivery $delivery,
        Driver $driver,
        Vehicle $vehicle,
        ?Carbon $scheduledAt,
        User $actor,
    ): Delivery {
        if (! in_array($delivery->status, [DeliveryStatus::PENDING, DeliveryStatus::ASSIGNED], true)) {
            throw new InvalidStatusTransitionException($delivery->status->value, DeliveryStatus::ASSIGNED->value);
        }

        if ($driver->organization_id !== $delivery->organization_id) {
            throw ValidationException::withMessages(['driver_id' => ['This driver does not belong to your organization.']]);
        }

        if ($vehicle->organization_id !== $delivery->organization_id) {
            throw ValidationException::withMessages(['vehicle_id' => ['This vehicle does not belong to your organization.']]);
        }

        // Allow "reassigning" a delivery to the same driver/vehicle it
        // already has without failing the availability check.
        $isReassigningDriver = $delivery->driver_id !== $driver->id;
        $isReassigningVehicle = $delivery->vehicle_id !== $vehicle->id;

        if ($isReassigningDriver && ! $driver->isAvailableForAssignment()) {
            throw ValidationException::withMessages(['driver_id' => ['The selected driver is not available.']]);
        }

        if ($isReassigningVehicle && ! $vehicle->isAvailableForAssignment()) {
            throw ValidationException::withMessages(['vehicle_id' => ['The selected vehicle is not available.']]);
        }

        $delivery = DB::transaction(function () use ($delivery, $driver, $vehicle, $scheduledAt, $actor, $isReassigningDriver, $isReassigningVehicle) {
            $previousDriver = $delivery->driver;
            $previousVehicle = $delivery->vehicle;

            $delivery->update([
                'driver_id' => $driver->id,
                'vehicle_id' => $vehicle->id,
                'scheduled_at' => $scheduledAt,
                'status' => DeliveryStatus::ASSIGNED,
            ]);

            if ($isReassigningDriver) {
                $previousDriver?->update(['status' => DriverStatus::AVAILABLE]);
                $driver->update(['status' => DriverStatus::ON_DELIVERY]);
            }

            if ($isReassigningVehicle) {
                $previousVehicle?->update(['status' => VehicleStatus::AVAILABLE]);
                $vehicle->update(['status' => VehicleStatus::IN_USE]);
            }

            DeliveryStatusHistory::create([
                'delivery_id' => $delivery->id,
                'status' => DeliveryStatus::ASSIGNED,
                'changed_by' => $actor->id,
                'notes' => "Assigned to driver #{$driver->id} / vehicle #{$vehicle->id}.",
                'created_at' => now(),
            ]);

            return $delivery->fresh(['driver', 'vehicle']);
        });

        $delivery->driver?->user?->notify(new DeliveryAssignedNotification($delivery));

        return $delivery;
    }
}
