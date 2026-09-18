<?php

namespace App\Policies;

use App\Models\Driver;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class DriverPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('drivers.view');
    }

    public function view(User $user, Driver $driver): bool
    {
        return $user->hasPermission('drivers.view') && $this->sameOrganization($user, $driver);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('drivers.create');
    }

    public function update(User $user, Driver $driver): bool
    {
        return $user->hasPermission('drivers.update') && $this->sameOrganization($user, $driver);
    }

    public function delete(User $user, Driver $driver): bool
    {
        return $user->hasPermission('drivers.delete') && $this->sameOrganization($user, $driver);
    }
}
