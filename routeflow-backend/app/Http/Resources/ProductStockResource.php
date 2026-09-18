<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product's stock level at one specific warehouse — the mirror image of
 * WarehouseStockResource (which shows a warehouse's stock of one product).
 * Used by WarehouseController::inventory().
 */
class ProductStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'quantity' => $this->pivot->quantity,
            'reserved_quantity' => $this->pivot->reserved_quantity,
            'available_quantity' => max(0, $this->pivot->quantity - $this->pivot->reserved_quantity),
            'reorder_level' => $this->pivot->reorder_level,
            'low_stock_threshold' => $this->low_stock_threshold,
        ];
    }
}
