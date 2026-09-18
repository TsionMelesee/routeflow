<?php

namespace App\Actions\Inventory;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * A signed correction to the physical quantity on hand — receiving new
 * stock (positive), or writing off damaged/lost stock (negative).
 * Row-locks the warehouse_products record so two concurrent adjustments
 * (or an adjustment racing a transfer) can't overwrite each other.
 */
class AdjustInventoryAction
{
    public function execute(Warehouse $warehouse, Product $product, int $delta, User $actor, ?string $notes = null): WarehouseProduct
    {
        if ($delta === 0) {
            throw ValidationException::withMessages(['quantity' => ['The adjustment quantity cannot be zero.']]);
        }

        return DB::transaction(function () use ($warehouse, $product, $delta, $actor, $notes) {
            $stock = WarehouseProduct::query()
                ->where('warehouse_id', $warehouse->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $currentQuantity = $stock?->quantity ?? 0;

            if ($currentQuantity + $delta < 0) {
                throw ValidationException::withMessages([
                    'quantity' => ["This adjustment would take stock below zero (currently {$currentQuantity})."],
                ]);
            }

            $stock = $stock ?? WarehouseProduct::create([
                'warehouse_id' => $warehouse->id,
                'product_id' => $product->id,
                'quantity' => 0,
            ]);

            $stock->increment('quantity', $delta);

            StockMovement::create([
                'organization_id' => $warehouse->organization_id,
                'warehouse_id' => $warehouse->id,
                'product_id' => $product->id,
                'type' => StockMovementType::ADJUSTED,
                'quantity' => $delta,
                'notes' => $notes,
                'created_by' => $actor->id,
                'created_at' => now(),
            ]);

            return $stock->refresh();
        });
    }
}
