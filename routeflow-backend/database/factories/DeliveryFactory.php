<?php

namespace Database\Factories;

use App\Enums\DeliveryStatus;
use App\Models\Organization;
use App\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'shipment_id' => Shipment::factory(),
            'delivery_number' => 'DEL-'.now()->year.'-'.fake()->unique()->numerify('######'),
            'status' => DeliveryStatus::PENDING,
            'scheduled_at' => now()->addDays(fake()->numberBetween(1, 5)),
        ];
    }
}
