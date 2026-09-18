<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class Role extends Model
{
    protected $fillable = [
        'organization_id', 'name', 'slug', 'description', 'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    /**
     * Resolves a list of role slugs to Role models visible to the given
     * organization — either a global template role (organization_id null)
     * or one of that organization's own custom roles. Throws a validation
     * error naming any slug that doesn't resolve, rather than silently
     * dropping it.
     *
     * @param  array<int, string>  $slugs
     * @return Collection<int, self>
     */
    public static function resolveForOrganization(array $slugs, int $organizationId): Collection
    {
        $roles = static::query()
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $organizationId))
            ->whereIn('slug', $slugs)
            ->get();

        $missing = array_diff($slugs, $roles->pluck('slug')->all());

        if (! empty($missing)) {
            throw ValidationException::withMessages([
                'role_slugs' => ['Unknown role(s): '.implode(', ', $missing).'.'],
            ]);
        }

        return $roles;
    }
}
