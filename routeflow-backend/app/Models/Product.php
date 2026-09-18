<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'sku', 'name', 'description', 'weight',
        'low_stock_threshold', 'status',
    ];

    protected $casts = [
        'status' => ProductStatus::class,
        'weight' => 'decimal:2',
    ];

    public function warehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'warehouse_products')
            ->withPivot(['quantity', 'reserved_quantity', 'reorder_level'])
            ->withTimestamps();
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /** Total on-hand quantity across every warehouse. */
    public function totalQuantity(): int
    {
        return (int) $this->warehouses()->sum('warehouse_products.quantity');
    }
}
