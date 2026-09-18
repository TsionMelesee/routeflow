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
 * Moves stock between two warehouses in the same organization. Both
 * warehouse_products rows are locked for the duration of the transaction
 * so a concurrent adjustment/transfer against either side can't race this
 * one — either the whole transfer lands, or none of it does.
 */
class TransferInventoryAction
{
    public function execute(Product $product, Warehouse $from, Warehouse $to, int $quantity, User $actor, ?string $notes = null): array
    {
        if ($quantity <= 0) {
            throw ValidationException::withMessages(['quantity' => ['The transfer quantity must be greater than zero.']]);
        }

        if ($from->id === $to->id) {
            throw ValidationException::withMessages(['to_warehouse_id' => ['Source and destination warehouse must be different.']]);
        }

        return DB::transaction(function () use ($product, $from, $to, $quantity, $actor, $notes) {
            // Lock in a stable order (lower id first) to avoid deadlocking
            // against a concurrent transfer running in the opposite direction.
            [$first, $second] = $from->id < $to->id ? [$from, $to] : [$to, $from];

            WarehouseProduct::where('warehouse_id', $first->id)->where('product_id', $product->id)->lockForUpdate()->first();
            WarehouseProduct::where('warehouse_id', $second->id)->where('product_id', $product->id)->lockForUpdate()->first();

            $sourceStock = WarehouseProduct::where('warehouse_id', $from->id)->where('product_id', $product->id)->first();
            $available = $sourceStock ? $sourceStock->quantity - $sourceStock->reserved_quantity : 0;

            if ($available < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ["Only {$available} unreserved unit(s) available at {$from->name}."],
                ]);
            }

            $sourceStock->decrement('quantity', $quantity);

            $destinationStock = WarehouseProduct::firstOrCreate(
                ['warehouse_id' => $to->id, 'product_id' => $product->id],
                ['quantity' => 0]
            );
            $destinationStock->increment('quantity', $quantity);

            $commonAttributes = [
                'organization_id' => $from->organization_id,
                'product_id' => $product->id,
                'reference_type' => 'transfer',
                'notes' => $notes,
                'created_by' => $actor->id,
                'created_at' => now(),
            ];

            StockMovement::create([...$commonAttributes, 'warehouse_id' => $from->id, 'type' => StockMovementType::TRANSFERRED_OUT, 'quantity' => -$quantity]);
            StockMovement::create([...$commonAttributes, 'warehouse_id' => $to->id, 'type' => StockMovementType::TRANSFERRED_IN, 'quantity' => $quantity]);

            return ['from' => $sourceStock->refresh(), 'to' => $destinationStock->refresh()];
        });
    }
}
