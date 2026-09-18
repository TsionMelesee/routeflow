<?php

namespace App\Models;

use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\HasReferenceNumber;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use BelongsToOrganization, HasFactory, HasReferenceNumber, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'customer_id', 'order_number', 'status', 'priority',
        'pickup_address', 'pickup_city', 'delivery_address', 'delivery_city',
        'requested_at', 'notes',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'priority' => OrderPriority::class,
        'requested_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }
}
