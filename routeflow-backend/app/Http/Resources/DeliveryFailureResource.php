<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryFailureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'description' => $this->description,
            'reported_by' => $this->whenLoaded('reportedBy', fn () => $this->reportedBy?->name),
            'reported_at' => $this->reported_at,
            'resolution' => $this->resolution,
            'resolved_at' => $this->resolved_at,
        ];
    }
}
