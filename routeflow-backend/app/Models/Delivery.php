<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\HasReferenceNumber;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Delivery extends Model
{
    use BelongsToOrganization, HasFactory, HasReferenceNumber, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'shipment_id', 'driver_id', 'vehicle_id', 'delivery_number',
        'status', 'scheduled_at', 'picked_up_at', 'out_for_delivery_at', 'delivered_at', 'notes',
    ];

    protected $casts = [
        'status' => DeliveryStatus::class,
        'scheduled_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(DeliveryStatusHistory::class)->latest('created_at');
    }

    public function failures(): HasMany
    {
        return $this->hasMany(DeliveryFailure::class);
    }

    public function proofOfDelivery(): HasOne
    {
        return $this->hasOne(ProofOfDelivery::class);
    }

    /**
     * Whether this delivery may transition to $target given the current
     * status. Controllers/actions must call this before writing a new
     * status — see DeliveryStatus::canTransitionTo() for the full matrix.
     */
    public function canTransitionTo(DeliveryStatus $target): bool
    {
        return $this->status->canTransitionTo($target);
    }
}
