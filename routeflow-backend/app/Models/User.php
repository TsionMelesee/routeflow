<?php

namespace App\Models;

use App\Enums\UserStatus;
use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use BelongsToOrganization, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'organization_id', 'name', 'email', 'password', 'phone', 'status', 'last_login_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'status' => UserStatus::class,
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class);
    }

    public function managedWarehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'manager_id');
    }

    /**
     * Flat, cached-per-request list of permission slugs across all of the
     * user's roles. Policies check against this rather than hardcoding
     * role names.
     */
    public function permissionSlugs(): Collection
    {
        return $this->roles->loadMissing('permissions')
            ->flatMap(fn (Role $role) => $role->permissions->pluck('slug'))
            ->unique()
            ->values();
    }

    public function hasPermission(string $slug): bool
    {
        return $this->permissionSlugs()->contains($slug);
    }

    /**
     * Platform-level administrator. Super Admins still belong to a home
     * organization (users.organization_id is not nullable), but any
     * platform-level query they run must explicitly bypass the tenant
     * scope with Model::withoutGlobalScope('organization') — this flag
     * never implicitly widens a query on its own.
     */
    public function isSuperAdmin(): bool
    {
        return $this->roles->contains('slug', 'super-admin');
    }
}
