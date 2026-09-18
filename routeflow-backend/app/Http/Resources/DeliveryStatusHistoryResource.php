<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => $this->status,
            'notes' => $this->notes,
            'changed_by' => $this->changedBy?->name,
            'created_at' => $this->created_at,
        ];
    }
}
