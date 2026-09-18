<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;
use App\Policies\Concerns\ChecksOrganization;

class VehiclePolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('vehicles.view');
    }

    public function view(User $user, Vehicle $vehicle): bool
    {
        return $user->hasPermission('vehicles.view') && $this->sameOrganization($user, $vehicle);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('vehicles.create');
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->hasPermission('vehicles.update') && $this->sameOrganization($user, $vehicle);
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $user->hasPermission('vehicles.delete') && $this->sameOrganization($user, $vehicle);
    }
}
