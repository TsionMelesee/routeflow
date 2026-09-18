<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * POST /api/v1/orders
 *
 * Order creation deliberately does NOT reserve inventory: at this point we
 * don't yet know which warehouse will fulfill each line item (a customer's
 * order isn't tied to a warehouse until a shipment is created against it
 * from a specific origin warehouse). Reservation happens in
 * CreateShipmentAction instead. This keeps "place an order" fast and
 * decoupled from warehouse-level stock state, matching how Steps 1–2
 * describe Order Created as a distinct, earlier step than Shipment Created.
 */
class CreateOrderAction
{
    /**
     * @param  array<int, array{product_id:int, quantity:int, unit_price?:float, notes?:string}>  $items
     */
    public function execute(Customer $customer, array $items, array $attributes, User $actor): Order
    {
        if ($customer->organization_id !== $actor->organization_id) {
            throw ValidationException::withMessages(['customer_id' => ['This customer does not belong to your organization.']]);
        }

        return DB::transaction(function () use ($customer, $items, $attributes, $actor) {
            $order = Order::create([
                ...$attributes,
                'customer_id' => $customer->id,
                'order_number' => Order::generateReferenceNumber('ORD', $actor->organization_id),
                'status' => OrderStatus::PENDING,
            ]);

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'] ?? null,
                    'weight' => $product->weight ? $product->weight * $item['quantity'] : null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $order->load('items.product');
        });
    }
}
