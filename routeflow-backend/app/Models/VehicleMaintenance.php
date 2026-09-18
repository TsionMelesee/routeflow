<?php

namespace App\Models;

use App\Enums\VehicleMaintenanceStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleMaintenance extends Model
{
    protected $table = 'vehicle_maintenance';

    protected $fillable = [
        'vehicle_id', 'type', 'description', 'cost', 'maintenance_date',
        'next_maintenance_date', 'status',
    ];

    protected $casts = [
        'status' => VehicleMaintenanceStatus::class,
        'cost' => 'decimal:2',
        'maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
