<?php

namespace Tests;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function seedRolesAndPermissions(): void
    {
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    /** Creates a user in a fresh organization with the given global role. */
    protected function userWithRole(string $roleSlug, ?Organization $organization = null): User
    {
        $organization = $organization ?? Organization::factory()->create();
        $user = User::factory()->for($organization)->create();
        $user->roles()->attach(Role::whereNull('organization_id')->where('slug', $roleSlug)->firstOrFail());

        return $user->load('roles.permissions');
    }
}
