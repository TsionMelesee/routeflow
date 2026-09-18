<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\DriverStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'user_id', 'license_number', 'license_expiry', 'status',
    ];

    protected $casts = [
        'status' => DriverStatus::class,
        'license_expiry' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }

    public function activeDeliveries(): HasMany
    {
        return $this->deliveries()->whereNotIn('status', [
            DeliveryStatus::DELIVERED->value,
            DeliveryStatus::RETURNED->value,
            DeliveryStatus::CANCELLED->value,
        ]);
    }

    public function isAvailableForAssignment(): bool
    {
        return $this->status->isAssignable() && $this->activeDeliveries()->doesntExist();
    }
}
