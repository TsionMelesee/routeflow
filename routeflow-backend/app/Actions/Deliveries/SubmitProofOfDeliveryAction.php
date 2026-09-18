<?php

namespace App\Actions\Deliveries;

use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\ProofOfDelivery;
use App\Models\User;
use App\Notifications\DeliveryDeliveredNotification;
use Illuminate\Support\Facades\DB;

/**
 * POST /api/v1/deliveries/{delivery}/proof
 *
 * Marking a delivery DELIVERED always happens together with recording
 * proof — the two can never be split, so this is the only path that's
 * allowed to move a delivery into DeliveryStatus::DELIVERED.
 */
class SubmitProofOfDeliveryAction
{
    public function __construct(private readonly UpdateDeliveryStatusAction $updateStatus) {}

    public function execute(Delivery $delivery, string $recipientName, ?string $signaturePath, ?string $photoPath, ?string $notes, User $actor): Delivery
    {
        $delivery = DB::transaction(function () use ($delivery, $recipientName, $signaturePath, $photoPath, $notes, $actor) {
            ProofOfDelivery::create([
                'delivery_id' => $delivery->id,
                'recipient_name' => $recipientName,
                'signature_path' => $signaturePath,
                'photo_path' => $photoPath,
                'notes' => $notes,
                'submitted_by' => $actor->id,
                'submitted_at' => now(),
            ]);

            $this->updateStatus->execute($delivery, DeliveryStatus::DELIVERED, $actor, 'Delivered — proof of delivery recorded.');

            return $delivery->fresh(['proofOfDelivery', 'statusHistories']);
        });

        User::whereHas('roles.permissions', fn ($q) => $q->where('slug', 'deliveries.assign'))
            ->get()
            ->each(fn (User $dispatcher) => $dispatcher->notify(new DeliveryDeliveredNotification($delivery)));

        return $delivery;
    }
}
