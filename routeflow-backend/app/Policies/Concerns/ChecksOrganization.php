<?php

namespace App\Policies\Concerns;

use App\Models\User;

/**
 * Defense in depth: the BelongsToOrganization global scope already keeps
 * cross-tenant records out of normal queries, but policies check the
 * organization match explicitly too, so authorization doesn't silently
 * depend on a scope never being bypassed upstream (e.g. by a future
 * withoutGlobalScope() call or an eager-loaded relation).
 */
trait ChecksOrganization
{
    protected function sameOrganization(User $user, object $model): bool
    {
        return $user->organization_id === $model->organization_id;
    }
}
