<?php

namespace App\Actions\Users;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function execute(array $attributes, array $roleSlugs, User $actor): User
    {
        return DB::transaction(function () use ($attributes, $roleSlugs, $actor) {
            $user = User::create([
                'organization_id' => $actor->organization_id,
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
                'phone' => $attributes['phone'] ?? null,
            ]);

            $roles = Role::resolveForOrganization($roleSlugs, $actor->organization_id);
            $user->roles()->attach($roles->pluck('id'));

            return $user->load('roles');
        });
    }
}
