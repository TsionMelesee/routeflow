<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryFailureReason;
use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\DeliveryFailure;
use App\Models\User;
use App\Notifications\DeliveryFailedNotification;
use Illuminate\Support\Facades\DB;

/**
 * POST /api/v1/deliveries/{delivery}/failure
 *
 * A failure is always recorded together with the FAILED status transition
 * (never one without the other) — routed through UpdateDeliveryStatusAction
 * so the same transition guard, history row, and (non-)freeing of the
 * driver/vehicle apply here as everywhere else a delivery's status changes.
 */
class ReportDeliveryFailureAction
{
    public function __construct(private readonly UpdateDeliveryStatusAction $updateStatus) {}

    public function execute(Delivery $delivery, DeliveryFailureReason $reason, ?string $description, User $actor): Delivery
    {
        $delivery = DB::transaction(function () use ($delivery, $reason, $description, $actor) {
            $this->updateStatus->execute($delivery, DeliveryStatus::FAILED, $actor, "Failed: {$reason->value}.");

            DeliveryFailure::create([
                'delivery_id' => $delivery->id,
                'reason' => $reason,
                'description' => $description,
                'reported_by' => $actor->id,
                'reported_at' => now(),
            ]);

            return $delivery->fresh(['failures', 'statusHistories']);
        });

        User::whereHas('roles.permissions', fn ($q) => $q->where('slug', 'deliveries.assign'))
            ->get()
            ->each(fn (User $dispatcher) => $dispatcher->notify(new DeliveryFailedNotification($delivery, $reason->value)));

        return $delivery;
    }
}
