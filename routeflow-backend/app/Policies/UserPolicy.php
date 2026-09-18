<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class UserPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('users.view');
    }

    public function view(User $user, User $target): bool
    {
        return $user->hasPermission('users.view') && $this->sameOrganization($user, $target);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('users.create');
    }

    public function update(User $user, User $target): bool
    {
        return $user->hasPermission('users.update') && $this->sameOrganization($user, $target);
    }

    public function delete(User $user, User $target): bool
    {
        return $user->hasPermission('users.delete')
            && $this->sameOrganization($user, $target)
            && $user->id !== $target->id;
    }
}
