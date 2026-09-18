<?php

namespace Database\Factories;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'customer_id' => Customer::factory(),
            'order_number' => 'ORD-'.now()->year.'-'.fake()->unique()->numerify('######'),
            'status' => OrderStatus::PENDING,
            'priority' => OrderPriority::STANDARD,
            'delivery_address' => fake()->streetAddress(),
            'delivery_city' => fake()->city(),
            'requested_at' => now()->addDays(fake()->numberBetween(1, 7)),
        ];
    }
}
