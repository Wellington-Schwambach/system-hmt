<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LogisticsLoad extends Model
{
    public const STAGE_PROGRAMMING = 'PROGRAMMING';
    public const STAGE_COLLECTION = 'COLLECTION';
    public const STAGE_LOADING = 'LOADING';
    public const STAGE_DELIVERY = 'DELIVERY';

    public const STAGES = [
        self::STAGE_PROGRAMMING,
        self::STAGE_COLLECTION,
        self::STAGE_LOADING,
        self::STAGE_DELIVERY,
    ];

    protected $fillable = [
        'reference_code',
        'shipment_number',
        'load_number',
        'shipowner',
        'booking_number',
        'shipper_id',
        'driver_id',
        'driver_two_id',
        'tractor_id',
        'trailer_id',
        'container_number',
        'collection_city',
        'loading_city',
        'delivery_city',
        'collection_terminal',
        'collection_at',
        'loading_location',
        'loading_at',
        'delivery_location',
        'delivery_at',
        'scheduled_at',
        'stage',
        'position',
        'notes',
        'completed_at',
        'completed_by',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'immutable_datetime',
            'collection_at' => 'immutable_datetime',
            'loading_at' => 'immutable_datetime',
            'delivery_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
            'position' => 'integer',
        ];
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(Shipper::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_id');
    }

    public function driverTwo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'driver_two_id');
    }

    public function tractor(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'tractor_id');
    }

    public function trailer(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'trailer_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(LogisticsLoadEvent::class)->orderByDesc('occurred_at')->orderByDesc('id');
    }
}
