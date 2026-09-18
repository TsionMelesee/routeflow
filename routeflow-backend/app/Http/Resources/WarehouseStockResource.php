<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Represents a product's stock at one warehouse — used both from
 * ProductResource (product -> its warehouses) and could equally be reused
 * from a Warehouse -> its products listing.
 */
class WarehouseStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'warehouse_id' => $this->id,
            'warehouse_name' => $this->name,
            'quantity' => $this->pivot->quantity,
            'reserved_quantity' => $this->pivot->reserved_quantity,
            'available_quantity' => max(0, $this->pivot->quantity - $this->pivot->reserved_quantity),
            'reorder_level' => $this->pivot->reorder_level,
        ];
    }
}
