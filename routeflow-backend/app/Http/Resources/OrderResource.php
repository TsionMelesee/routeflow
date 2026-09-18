<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'priority' => $this->priority,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
            ]),
            'pickup_address' => $this->pickup_address,
            'pickup_city' => $this->pickup_city,
            'delivery_address' => $this->delivery_address,
            'delivery_city' => $this->delivery_city,
            'requested_at' => $this->requested_at,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'has_shipment' => $this->whenLoaded('shipment', fn () => $this->shipment !== null),
            'created_at' => $this->created_at,
        ];
    }
}
