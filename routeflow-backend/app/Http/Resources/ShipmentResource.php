<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shipment_number' => $this->shipment_number,
            'status' => $this->status,
            'priority' => $this->priority,
            'order_id' => $this->order_id,
            'origin_warehouse' => $this->whenLoaded('originWarehouse', fn () => [
                'id' => $this->originWarehouse->id,
                'name' => $this->originWarehouse->name,
            ]),
            'destination_address' => $this->destination_address,
            'destination_city' => $this->destination_city,
            'package_count' => $this->package_count,
            'total_weight' => $this->total_weight,
            'expected_delivery_at' => $this->expected_delivery_at,
            'items' => ShipmentItemResource::collection($this->whenLoaded('items')),
            'has_delivery' => $this->whenLoaded('delivery', fn () => $this->delivery !== null),
            'created_at' => $this->created_at,
        ];
    }
}
