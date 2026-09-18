<?php

namespace App\Notifications;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DeliveryDeliveredNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Delivery $delivery) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'delivery.delivered',
            'delivery_id' => $this->delivery->id,
            'delivery_number' => $this->delivery->delivery_number,
            'message' => "Delivery {$this->delivery->delivery_number} was delivered.",
        ];
    }
}
