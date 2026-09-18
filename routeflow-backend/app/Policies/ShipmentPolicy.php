<?php

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class ShipmentPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('shipments.view');
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return $user->hasPermission('shipments.view') && $this->sameOrganization($user, $shipment);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('shipments.create');
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $user->hasPermission('shipments.update') && $this->sameOrganization($user, $shipment);
    }
}
