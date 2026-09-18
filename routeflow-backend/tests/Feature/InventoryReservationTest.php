<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryReservationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->organization = Organization::factory()->create();
    }

    public function test_creating_a_shipment_reserves_stock_without_reducing_physical_quantity(): void
    {
        $warehouse = Warehouse::factory()->create(['organization_id' => $this->organization->id]);
        $product = Product::factory()->create(['organization_id' => $this->organization->id]);
        WarehouseProduct::create(['warehouse_id' => $warehouse->id, 'product_id' => $product->id, 'quantity' => 100]);

        $order = Order::factory()->create(['organization_id' => $this->organization->id, 'status' => OrderStatus::PROCESSING]);

        Sanctum::actingAs($this->userWithRole('organization-admin', $this->organization));

        $this->postJson("/api/v1/orders/{$order->id}/shipment", [
            'origin_warehouse_id' => $warehouse->id,
            'destination_address' => 'Bole Road, Addis Ababa',
            'items' => [['product_id' => $product->id, 'quantity' => 30]],
        ])->assertCreated();

        $stock = WarehouseProduct::where('warehouse_id', $warehouse->id)->where('product_id', $product->id)->first();

        // Nothing has physically left the shelf yet — only earmarked.
        $this->assertSame(100, $stock->quantity);
        $this->assertSame(30, $stock->reserved_quantity);
        $this->assertSame(70, $stock->availableQuantity());
    }

    public function test_cannot_reserve_more_than_the_unreserved_stock(): void
    {
        $warehouse = Warehouse::factory()->create(['organization_id' => $this->organization->id]);
        $product = Product::factory()->create(['organization_id' => $this->organization->id]);
        WarehouseProduct::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'reserved_quantity' => 45,
        ]);

        $order = Order::factory()->create(['organization_id' => $this->organization->id, 'status' => OrderStatus::PROCESSING]);

        Sanctum::actingAs($this->userWithRole('organization-admin', $this->organization));

        // 50 on hand but only 5 unreserved.
        $this->postJson("/api/v1/orders/{$order->id}/shipment", [
            'origin_warehouse_id' => $warehouse->id,
            'destination_address' => 'Bole Road, Addis Ababa',
            'items' => [['product_id' => $product->id, 'quantity' => 10]],
        ])->assertStatus(422);

        $this->assertDatabaseCount('shipments', 0);
    }

    public function test_adjustment_cannot_take_stock_below_zero(): void
    {
        $warehouse = Warehouse::factory()->create(['organization_id' => $this->organization->id]);
        $product = Product::factory()->create(['organization_id' => $this->organization->id]);
        WarehouseProduct::create(['warehouse_id' => $warehouse->id, 'product_id' => $product->id, 'quantity' => 5]);

        Sanctum::actingAs($this->userWithRole('warehouse-staff', $this->organization));

        $this->postJson('/api/v1/inventory/adjust', [
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => -10,
        ])->assertStatus(422);
    }

    public function test_transfer_moves_stock_between_warehouses(): void
    {
        $from = Warehouse::factory()->create(['organization_id' => $this->organization->id]);
        $to = Warehouse::factory()->create(['organization_id' => $this->organization->id]);
        $product = Product::factory()->create(['organization_id' => $this->organization->id]);
        WarehouseProduct::create(['warehouse_id' => $from->id, 'product_id' => $product->id, 'quantity' => 40]);

        Sanctum::actingAs($this->userWithRole('warehouse-staff', $this->organization));

        $this->postJson('/api/v1/inventory/transfer', [
            'product_id' => $product->id,
            'from_warehouse_id' => $from->id,
            'to_warehouse_id' => $to->id,
            'quantity' => 15,
        ])->assertOk();

        $this->assertSame(25, WarehouseProduct::where('warehouse_id', $from->id)->first()->quantity);
        $this->assertSame(15, WarehouseProduct::where('warehouse_id', $to->id)->first()->quantity);
        $this->assertDatabaseCount('stock_movements', 2);
    }
}
