<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'delivery_number' => $this->delivery_number,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'picked_up_at' => $this->picked_up_at,
            'out_for_delivery_at' => $this->out_for_delivery_at,
            'delivered_at' => $this->delivered_at,
            'notes' => $this->notes,
            'driver' => $this->whenLoaded('driver', fn () => [
                'id' => $this->driver->id,
                'name' => $this->driver->user?->name,
                'status' => $this->driver->status,
            ]),
            'vehicle' => $this->whenLoaded('vehicle', fn () => [
                'id' => $this->vehicle->id,
                'plate_number' => $this->vehicle->plate_number,
                'status' => $this->vehicle->status,
            ]),
            'history' => DeliveryStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'failures' => DeliveryFailureResource::collection($this->whenLoaded('failures')),
            'proof_of_delivery' => $this->whenLoaded('proofOfDelivery', fn () => $this->proofOfDelivery ? new ProofOfDeliveryResource($this->proofOfDelivery) : null),
        ];
    }
}
