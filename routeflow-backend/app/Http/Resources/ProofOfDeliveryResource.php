<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProofOfDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'recipient_name' => $this->recipient_name,
            'signature_url' => $this->signature_path ? Storage::url($this->signature_path) : null,
            'photo_url' => $this->photo_path ? Storage::url($this->photo_path) : null,
            'notes' => $this->notes,
            'submitted_by' => $this->whenLoaded('submittedBy', fn () => $this->submittedBy?->name),
            'submitted_at' => $this->submitted_at,
        ];
    }
}
