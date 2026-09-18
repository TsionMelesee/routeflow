<?php

namespace App\Models;

use App\Enums\CustomerStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'organization_id', 'name', 'company_name', 'email', 'phone',
        'address', 'city', 'country', 'notes', 'status',
    ];

    protected $casts = [
        'status' => CustomerStatus::class,
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
