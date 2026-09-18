<?php

namespace App\Models;

use App\Enums\VehicleStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'plate_number', 'type', 'model', 'year', 'capacity', 'status',
    ];

    protected $casts = [
        'status' => VehicleStatus::class,
        'capacity' => 'decimal:2',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(VehicleMaintenance::class);
    }

    public function isAvailableForAssignment(): bool
    {
        return $this->status->isAssignable();
    }
}
