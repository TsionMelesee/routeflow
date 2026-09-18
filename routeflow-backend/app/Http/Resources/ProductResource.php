<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'weight' => $this->weight,
            'low_stock_threshold' => $this->low_stock_threshold,
            'status' => $this->status,
            'total_quantity' => $this->when(
                $this->relationLoaded('warehouses'),
                fn () => (int) $this->warehouses->sum('pivot.quantity')
            ),
            'warehouses' => WarehouseStockResource::collection($this->whenLoaded('warehouses')),
        ];
    }
}
