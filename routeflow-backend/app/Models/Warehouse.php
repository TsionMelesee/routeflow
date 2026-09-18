<?php

namespace App\Models;

use App\Enums\WarehouseStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'name', 'code', 'address', 'city', 'phone', 'manager_id', 'status',
    ];

    protected $casts = [
        'status' => WarehouseStatus::class,
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'warehouse_products')
            ->withPivot(['quantity', 'reserved_quantity', 'reorder_level'])
            ->withTimestamps();
    }

    public function warehouseProducts(): HasMany
    {
        return $this->hasMany(WarehouseProduct::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function outgoingShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'origin_warehouse_id');
    }
}
