<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * Enforces tenant isolation at the model layer.
 *
 * Every query against a model using this trait is automatically scoped to
 * the authenticated user's organization, and organization_id is filled in
 * automatically on create. This is the backstop referenced throughout the
 * spec: "Never trust the frontend" — even if a client sends an
 * organization_id in the payload, or omits the scope by accident in a
 * controller, this global scope still applies.
 *
 * Super Admin (platform-level) queries that intentionally need to see
 * every tenant should use `Model::withoutGlobalScope('organization')`
 * explicitly, so the bypass is always visible in the code.
 */
trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            if ($organizationId = static::currentOrganizationId()) {
                $builder->where($builder->getModel()->getTable().'.organization_id', $organizationId);
            }
        });

        static::creating(function ($model) {
            if (! $model->organization_id && $organizationId = static::currentOrganizationId()) {
                $model->organization_id = $organizationId;
            }
        });
    }

    protected static function currentOrganizationId(): ?int
    {
        return Auth::user()?->organization_id;
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
