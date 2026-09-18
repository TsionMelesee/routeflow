<?php

namespace App\Actions\Drivers;

use App\Enums\DriverStatus;
use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * A driver logs in as their own User (Step 1 §5 — the driver has a
 * simplified dashboard, not separate credentials from the rest of the
 * system), so creating a driver always creates its User in the same
 * transaction and attaches the global "driver" role.
 */
class CreateDriverAction
{
    public function execute(array $userAttributes, array $driverAttributes, User $actor): Driver
    {
        return DB::transaction(function () use ($userAttributes, $driverAttributes, $actor) {
            $user = User::create([
                'organization_id' => $actor->organization_id,
                'name' => $userAttributes['name'],
                'email' => $userAttributes['email'],
                'password' => Hash::make($userAttributes['password']),
                'phone' => $userAttributes['phone'] ?? null,
            ]);

            $driverRole = Role::whereNull('organization_id')->where('slug', 'driver')->firstOrFail();
            $user->roles()->attach($driverRole);

            return Driver::create([
                'organization_id' => $actor->organization_id,
                'user_id' => $user->id,
                'license_number' => $driverAttributes['license_number'],
                'license_expiry' => $driverAttributes['license_expiry'] ?? null,
                'status' => DriverStatus::OFF_DUTY,
            ])->load('user');
        });
    }
}
