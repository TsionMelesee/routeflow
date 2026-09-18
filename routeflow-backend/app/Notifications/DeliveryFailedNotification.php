<?php

namespace App\Notifications;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to dispatchers when a delivery fails — Step 1 §19: "Delivery ->
 * FAILED -> Failure record -> Dispatcher notification".
 */
class DeliveryFailedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Delivery $delivery, private readonly string $reason) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'delivery.failed',
            'delivery_id' => $this->delivery->id,
            'delivery_number' => $this->delivery->delivery_number,
            'reason' => $this->reason,
            'message' => "Delivery {$this->delivery->delivery_number} failed: {$this->reason}.",
        ];
    }
}
