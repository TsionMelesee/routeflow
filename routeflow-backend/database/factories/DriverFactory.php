<?php

namespace Database\Factories;

use App\Enums\DriverStatus;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DriverFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'user_id' => User::factory(),
            'license_number' => strtoupper(Str::random(8)),
            'license_expiry' => fake()->dateTimeBetween('+6 months', '+4 years'),
            'status' => DriverStatus::AVAILABLE,
        ];
    }
}
