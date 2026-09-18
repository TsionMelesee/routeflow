<?php

namespace App\Models;

use App\Enums\OrderPriority;
use App\Enums\ShipmentStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\HasReferenceNumber;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use BelongsToOrganization, HasFactory, HasReferenceNumber, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'order_id', 'shipment_number', 'origin_warehouse_id',
        'destination_address', 'destination_city', 'package_count', 'total_weight',
        'priority', 'status', 'expected_delivery_at',
    ];

    protected $casts = [
        'status' => ShipmentStatus::class,
        'priority' => OrderPriority::class,
        'total_weight' => 'decimal:2',
        'expected_delivery_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function originWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'origin_warehouse_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }
}
