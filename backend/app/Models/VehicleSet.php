<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleSet extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_DETACHED = 'DETACHED';

    protected $fillable = [
        'tractor_id',
        'trailer_id',
        'trailer_two_id',
        'driver_id',
        'driver_two_id',
        'tractor_plate',
        'tractor_label',
        'trailer_plate',
        'trailer_label',
        'trailer_two_plate',
        'trailer_two_label',
        'driver_name',
        'driver_two_name',
        'coupled_at',
        'driver_assigned_at',
        'driver_two_assigned_at',
        'detached_at',
        'status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'coupled_at' => 'immutable_datetime',
            'driver_assigned_at' => 'immutable_datetime',
            'driver_two_assigned_at' => 'immutable_datetime',
            'detached_at' => 'immutable_datetime',
        ];
    }

    public function tractor(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'tractor_id');
    }

    public function trailer(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'trailer_id');
    }

    public function trailerTwo(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'trailer_two_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_id');
    }

    public function driverTwo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_two_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(VehicleSetEvent::class);
    }
}
