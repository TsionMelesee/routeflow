<?php

namespace App\Models;

use App\Enums\DeliveryFailureReason;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryFailure extends Model
{
    protected $fillable = [
        'delivery_id', 'reason', 'description', 'reported_by', 'reported_at',
        'resolution', 'resolved_at',
    ];

    protected $casts = [
        'reason' => DeliveryFailureReason::class,
        'reported_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }
}
