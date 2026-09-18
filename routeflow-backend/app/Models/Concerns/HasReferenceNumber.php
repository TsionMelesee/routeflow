<?php

namespace App\Models\Concerns;

use Illuminate\Support\Facades\DB;

/**
 * Generates human-facing reference numbers like ORD-2026-000381, unique
 * per organization per year (not globally — two organizations can each
 * have their own ORD-2026-000001).
 *
 * Implementation note: this counts existing rows for the year under
 * lockForUpdate() to reduce (not eliminate) race conditions between two
 * concurrent requests. It's adequate for the MVP's expected volume. If
 * order/shipment/delivery creation ever becomes high-concurrency, replace
 * this with a dedicated per-organization sequence/counter table so the
 * increment itself is atomic.
 */
trait HasReferenceNumber
{
    public static function generateReferenceNumber(string $prefix, int $organizationId): string
    {
        return DB::transaction(function () use ($prefix, $organizationId) {
            $year = now()->year;

            $count = static::withoutGlobalScope('organization')
                ->where('organization_id', $organizationId)
                ->whereYear('created_at', $year)
                ->lockForUpdate()
                ->count();

            $sequence = str_pad((string) ($count + 1), 6, '0', STR_PAD_LEFT);

            return "{$prefix}-{$year}-{$sequence}";
        });
    }
}
