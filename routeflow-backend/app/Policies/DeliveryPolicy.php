<?php

namespace App\Policies;

use App\Models\Delivery;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class DeliveryPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('deliveries.view') || $user->driver !== null;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('deliveries.assign');
    }

    public function view(User $user, Delivery $delivery): bool
    {
        if (! $this->sameOrganization($user, $delivery)) {
            return false;
        }

        if ($user->driver && $delivery->driver_id === $user->driver->id) {
            return true;
        }

        return $user->hasPermission('deliveries.view');
    }

    public function assign(User $user, Delivery $delivery): bool
    {
        return $user->hasPermission('deliveries.assign') && $this->sameOrganization($user, $delivery);
    }

    public function updateStatus(User $user, Delivery $delivery): bool
    {
        if (! $this->sameOrganization($user, $delivery)) {
            return false;
        }

        if ($user->driver && $delivery->driver_id === $user->driver->id) {
            return true;
        }

        return $user->hasPermission('deliveries.update_status');
    }

    public function reschedule(User $user, Delivery $delivery): bool
    {
        return $user->hasPermission('deliveries.reschedule') && $this->sameOrganization($user, $delivery);
    }
}
