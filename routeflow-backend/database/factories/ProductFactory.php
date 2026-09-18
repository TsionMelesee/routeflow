<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'sku' => strtoupper(Str::random(3)).'-'.fake()->unique()->numberBetween(1000, 9999),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'weight' => fake()->randomFloat(2, 0.1, 50),
            'low_stock_threshold' => fake()->numberBetween(5, 25),
            'status' => ProductStatus::ACTIVE,
        ];
    }
}
