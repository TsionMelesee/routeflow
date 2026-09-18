<?php

namespace Database\Factories;

use App\Enums\VehicleStatus;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VehicleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'plate_number' => strtoupper(Str::random(3)).'-'.fake()->numberBetween(1000, 9999),
            'type' => fake()->randomElement(['van', 'truck', 'motorcycle']),
            'model' => fake()->randomElement(['Isuzu NPR', 'Toyota Hiace', 'Ford Transit']),
            'year' => fake()->numberBetween(2012, 2025),
            'capacity' => fake()->randomFloat(2, 500, 5000),
            'status' => VehicleStatus::AVAILABLE,
        ];
    }
}
