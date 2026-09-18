<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('roles.view');
    }

    public function view(User $user, Role $role): bool
    {
        if (! $user->hasPermission('roles.view')) {
            return false;
        }

        // Global template roles (organization_id null) are visible to
        // everyone with roles.view; organization-owned custom roles are
        // only visible to that organization.
        return $role->organization_id === null || $role->organization_id === $user->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('roles.manage');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermission('roles.manage')
            && ! $role->is_system
            && $role->organization_id === $user->organization_id;
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->update($user, $role);
    }
}
