<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Writes an AuditLog row on create/update/delete — matches the example in
 * Step 1 §22 almost exactly: action "delivery.status_updated" becomes our
 * "delivery.updated" with old/new values scoped to just the changed
 * columns (status among them). We use the generic {entity}.{event} shape
 * rather than hand-writing a distinct action name per changed field, so
 * every model that opts in gets full coverage for free.
 *
 * Deliberately NOT applied to User or Organization — those carry
 * credentials/PII we don't want mirrored into old_values/new_values.
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            $model->recordAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            $original = array_intersect_key($model->getOriginal(), $changes);
            $model->recordAudit('updated', $original, $changes);
        });

        static::deleted(function ($model) {
            $model->recordAudit('deleted', $model->getOriginal(), null);
        });
    }

    protected function recordAudit(string $event, ?array $old, ?array $new): void
    {
        AuditLog::create([
            'organization_id' => $this->organization_id ?? Auth::user()?->organization_id,
            'user_id' => Auth::id(),
            'action' => Str::snake(class_basename($this)).'.'.$event,
            'entity_type' => static::class,
            'entity_id' => $this->getKey(),
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()?->ip(),
            'created_at' => now(),
        ]);
    }
}
