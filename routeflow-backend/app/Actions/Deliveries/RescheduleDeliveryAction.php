<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * POST /api/v1/deliveries/{delivery}/reschedule
 *
 * Only legal from FAILED (Step 1 §20 — "Dispatcher can reschedule a failed
 * delivery"). Routed through UpdateDeliveryStatusAction for the same
 * transition guard + history row as every other status change, then sets
 * the new scheduled_at on top.
 */
class RescheduleDeliveryAction
{
    public function __construct(private readonly UpdateDeliveryStatusAction $updateStatus) {}

    public function execute(Delivery $delivery, Carbon $scheduledAt, User $actor): Delivery
    {
        return DB::transaction(function () use ($delivery, $scheduledAt, $actor) {
            $this->updateStatus->execute($delivery, DeliveryStatus::RESCHEDULED, $actor, 'Rescheduled for '.$scheduledAt->toDateTimeString().'.');

            $delivery->update(['scheduled_at' => $scheduledAt]);

            return $delivery->fresh(['driver', 'vehicle', 'statusHistories']);
        });
    }
}
