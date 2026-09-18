<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class CustomerPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('customers.view');
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->hasPermission('customers.view') && $this->sameOrganization($user, $customer);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('customers.create');
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasPermission('customers.update') && $this->sameOrganization($user, $customer);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasPermission('customers.delete') && $this->sameOrganization($user, $customer);
    }
}
