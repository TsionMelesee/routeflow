<?php

namespace Database\Factories;

use App\Enums\WarehouseStatus;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WarehouseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->city().' Warehouse',
            'code' => strtoupper(Str::random(4)),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'phone' => fake()->phoneNumber(),
            'status' => WarehouseStatus::ACTIVE,
        ];
    }
}
