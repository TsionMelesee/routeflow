<?php

namespace Database\Factories;

use App\Enums\OrderPriority;
use App\Enums\ShipmentStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'order_id' => Order::factory(),
            'shipment_number' => 'SHP-'.now()->year.'-'.fake()->unique()->numerify('######'),
            'origin_warehouse_id' => Warehouse::factory(),
            'destination_address' => fake()->streetAddress(),
            'destination_city' => fake()->city(),
            'package_count' => fake()->numberBetween(1, 5),
            'total_weight' => fake()->randomFloat(2, 1, 200),
            'priority' => OrderPriority::STANDARD,
            'status' => ShipmentStatus::PENDING,
        ];
    }
}
