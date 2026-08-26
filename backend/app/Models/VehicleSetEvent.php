<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleSetEvent extends Model
{
    use HasFactory;

    public const ACTION_COUPLED = 'COUPLED';
    public const ACTION_DRIVER_ASSIGNED = 'DRIVER_ASSIGNED';
    public const ACTION_DRIVER_CHANGED = 'DRIVER_CHANGED';
    public const ACTION_DETACHED = 'DETACHED';

    protected $fillable = [
        'vehicle_set_id',
        'action',
        'tractor_id',
        'trailer_id',
        'driver_id',
        'tractor_plate',
        'trailer_plate',
        'driver_name',
        'occurred_at',
        'notes',
        'details',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'immutable_datetime',
            'details' => 'array',
        ];
    }

    public function vehicleSet(): BelongsTo
    {
        return $this->belongsTo(VehicleSet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
