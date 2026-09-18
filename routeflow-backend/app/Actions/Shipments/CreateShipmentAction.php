<?php

namespace App\Actions\Shipments;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Enums\StockMovementType;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * POST /api/v1/orders/{order}/shipment
 *
 * This is where inventory actually gets reserved (not at order creation —
 * see CreateOrderAction's docblock for why). For each line item it locks
 * the (warehouse, product) stock row, confirms enough UNRESERVED stock
 * exists, and increments reserved_quantity — it does not yet touch the
 * physical quantity, since nothing has physically left the shelf until a
 * driver picks it up (that happens in a later delivery-status transition).
 */
class CreateShipmentAction
{
    /**
     * @param  array<int, array{product_id:int, quantity:int}>  $items
     */
    public function execute(Order $order, Warehouse $originWarehouse, array $items, array $attributes, User $actor): Shipment
    {
        if ($order->status !== OrderStatus::PROCESSING) {
            throw new InvalidStatusTransitionException($order->status->value, OrderStatus::SHIPPED->value, 'order_status');
        }

        if ($originWarehouse->organization_id !== $order->organization_id) {
            throw ValidationException::withMessages(['origin_warehouse_id' => ['This warehouse does not belong to your organization.']]);
        }

        return DB::transaction(function () use ($order, $originWarehouse, $items, $attributes, $actor) {
            $shipment = Shipment::create([
                ...$attributes,
                'order_id' => $order->id,
                'shipment_number' => Shipment::generateReferenceNumber('SHP', $actor->organization_id),
                'origin_warehouse_id' => $originWarehouse->id,
                'status' => ShipmentStatus::PENDING,
                'package_count' => count($items),
            ]);

            $totalWeight = 0;

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];

                $stock = WarehouseProduct::where('warehouse_id', $originWarehouse->id)
                    ->where('product_id', $product->id)
                    ->lockForUpdate()
                    ->first();

                $available = $stock ? $stock->quantity - $stock->reserved_quantity : 0;

                if ($available < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Not enough available stock for \"{$product->name}\" at {$originWarehouse->name} (available: {$available})."],
                    ]);
                }

                $stock->increment('reserved_quantity', $quantity);

                StockMovement::create([
                    'organization_id' => $order->organization_id,
                    'warehouse_id' => $originWarehouse->id,
                    'product_id' => $product->id,
                    'type' => StockMovementType::RESERVED,
                    'quantity' => $quantity,
                    'reference_type' => Shipment::class,
                    'reference_id' => $shipment->id,
                    'created_by' => $actor->id,
                    'created_at' => now(),
                ]);

                $weight = $product->weight ? $product->weight * $quantity : null;
                $totalWeight += $weight ?? 0;

                $shipment->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'weight' => $weight,
                ]);
            }

            $shipment->update(['total_weight' => $totalWeight ?: null]);
            $order->update(['status' => OrderStatus::SHIPPED]);

            return $shipment->load(['items.product', 'originWarehouse']);
        });
    }
}
